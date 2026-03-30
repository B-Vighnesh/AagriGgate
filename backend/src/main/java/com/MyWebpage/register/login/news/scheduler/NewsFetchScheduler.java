package com.MyWebpage.register.login.news.scheduler;

import com.MyWebpage.register.login.news.dto.request.NewsRequest;
import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.enums.NewsType;
import com.MyWebpage.register.login.news.mapper.NewsMapper;
import com.MyWebpage.register.login.news.repository.NewsRepository;
import com.MyWebpage.register.login.news.repository.TrustedSourceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEnclosure;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.InputStream;
import java.net.URI;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Component
public class NewsFetchScheduler {

    private static final Logger log = LoggerFactory.getLogger(NewsFetchScheduler.class);

    private static final List<String> PLACEHOLDER_KEYS = List.of(
            "demo-news-key", "your-api-key", "your_api_key", "changeme", ""
    );

    /**
     * Verified-working RSS feeds for Indian agriculture news (tested March 2026).
     * Each entry: { name, domain, sourceUrl, categoryScope, sourceType }.
     */
    private static final List<String[]> DEFAULT_RSS_SOURCES = List.of(
            new String[]{"Down To Earth - Agriculture",   "downtoearth.org.in",    "https://www.downtoearth.org.in/rss/agriculture",                                       "FARMING_TIP,OTHER",  "RSS"},
            new String[]{"Economic Times - Agriculture",  "economictimes.com",     "https://economictimes.indiatimes.com/news/economy/agriculture/rssfeeds/53215982.cms",   "MARKET,SUBSIDY",     "RSS"},
            new String[]{"The Hindu - Agriculture",       "thehindu.com",          "https://www.thehindu.com/sci-tech/agriculture/feeder/default.rss",                      "FARMING_TIP,LAW",    "RSS"},
            new String[]{"AgriFarming",                   "agrifarming.in",        "https://www.agrifarming.in/feed",                                                      "FARMING_TIP",        "RSS"},
            new String[]{"LiveMint - Economy",            "livemint.com",          "https://www.livemint.com/rss/economy",                                                 "MARKET,SUBSIDY",     "RSS"},
            new String[]{"Times of India - Environment",  "timesofindia.com",      "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",                              "WEATHER,OTHER",      "RSS"},
            new String[]{"Indian Express - India",        "indianexpress.com",     "https://indianexpress.com/section/india/feed/",                                         "LAW,SUBSIDY",        "RSS"}
    );

    @Value("${news.api.key}")
    private String newsApiKey;

    @Value("${news.api.gnews-url}")
    private String gnewsBaseUrl;

    @Value("${news.api.max-items-per-source:10}")
    private int maxItemsPerSource;

    @Value("${news.api.rss-timeout-seconds:15}")
    private int rssTimeoutSeconds;

    private final TrustedSourceRepository trustedSourceRepository;
    private final NewsRepository newsRepository;
    private final NewsMapper newsMapper;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public NewsFetchScheduler(
            TrustedSourceRepository trustedSourceRepository,
            NewsRepository newsRepository,
            NewsMapper newsMapper,
            RestTemplate restTemplate,
            ObjectMapper objectMapper
    ) {
        this.trustedSourceRepository = trustedSourceRepository;
        this.newsRepository = newsRepository;
        this.newsMapper = newsMapper;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    // ─── Startup ────────────────────────────────────────────────────────────────

    /**
     * On application startup: register default RSS sources if missing, then
     * immediately fetch from all active sources so the news page has content.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("[NewsFetchScheduler] Application ready — initialising news sources...");
        registerDefaultSources();

        if (isGNewsKeyPlaceholder()) {
            log.warn("[NewsFetchScheduler] NEWS_API_KEY is a placeholder ('{}'). "
                    + "GNews sources will be skipped. Get a free key at https://gnews.io "
                    + "and set the NEWS_API_KEY environment variable.", newsApiKey);
        }

        log.info("[NewsFetchScheduler] Running initial news fetch...");
        fetchAllSources();
        log.info("[NewsFetchScheduler] Startup complete — {} news items in database.", newsRepository.count());
    }

    // ─── Scheduled fetch ────────────────────────────────────────────────────────

    /** Runs every 6 hours to refresh news from all active trusted sources. */
    @Scheduled(fixedRate = 21_600_000)
    @Transactional
    public void fetchAllSources() {
        List<TrustedSource> sources = trustedSourceRepository.findByIsActiveTrue();
        if (sources.isEmpty()) {
            log.info("[NewsFetchScheduler] No active trusted sources configured.");
            return;
        }

        log.info("[NewsFetchScheduler] Starting fetch cycle for {} sources...", sources.size());
        int totalSaved = 0;
        int failures = 0;

        for (TrustedSource source : sources) {
            try {
                int saved = fetchSource(source);
                totalSaved += saved;
                if (saved > 0) {
                    log.info("[NewsFetchScheduler] '{}' → saved {} new items", source.getName(), saved);
                }
            } catch (Exception ex) {
                failures++;
                log.error("[NewsFetchScheduler] '{}' → FAILED: {}", source.getName(), ex.getMessage());
            }
        }
        log.info("[NewsFetchScheduler] Fetch cycle complete — {} new items, {} failures", totalSaved, failures);
    }

    // ─── Per-source fetch ───────────────────────────────────────────────────────

    @Transactional
    public int fetchSource(TrustedSource source) {
        String type = normalizeSourceType(source.getSourceType());
        List<NewsRequest> items;

        switch (type) {
            case "RSS" -> items = fetchFromRss(source);
            case "GNEWS_TOPIC" -> {
                if (isGNewsKeyPlaceholder()) {
                    return 0;
                }
                items = fetchFromGNewsTopics(source);
            }
            case "GNEWS_KEYWORD" -> {
                if (isGNewsKeyPlaceholder()) {
                    return 0;
                }
                items = fetchFromGNewsKeyword(source);
            }
            default -> {
                log.warn("[NewsFetchScheduler] Unknown sourceType '{}' for '{}'",
                        source.getSourceType(), source.getName());
                items = Collections.emptyList();
            }
        }

        int savedCount = 0;
        for (NewsRequest item : items) {
            String sourceUrl = normalize(item.getSourceUrl());
            String title = normalize(item.getTitle());
            if (sourceUrl == null || title == null) continue;
            if (newsRepository.existsBySourceUrlOrTitle(sourceUrl, title)) continue;

            item.setSourceUrl(sourceUrl);
            item.setTitle(title);
            News news = newsMapper.toEntity(item);
            news.setUploadedBy("SOURCE");
            news.setNewsType(NewsType.EXTERNAL);
            news.setStatus(NewsStatus.ACTIVE);
            newsRepository.save(news);
            savedCount++;
        }

        source.setLastFetchedAt(LocalDateTime.now());
        trustedSourceRepository.save(source);
        return savedCount;
    }

    // ─── RSS fetching ───────────────────────────────────────────────────────────

    private List<NewsRequest> fetchFromRss(TrustedSource source) {
        List<NewsRequest> items = new ArrayList<>();
        try {
            URLConnection connection = URI.create(source.getSourceUrl()).toURL().openConnection();
            connection.setConnectTimeout(rssTimeoutSeconds * 1000);
            connection.setReadTimeout(rssTimeoutSeconds * 1000);
            connection.setRequestProperty("User-Agent",
                    "Mozilla/5.0 (compatible; AagriGgateBot/1.0; +https://aagrigate.com)");
            connection.setRequestProperty("Accept",
                    "application/rss+xml, application/xml, text/xml, */*");

            try (InputStream inputStream = connection.getInputStream();
                 XmlReader reader = new XmlReader(inputStream)) {
                SyndFeed feed = new SyndFeedInput().build(reader);
                for (SyndEntry entry : feed.getEntries().stream().limit(maxItemsPerSource).toList()) {
                    NewsRequest request = new NewsRequest();
                    request.setTitle(entry.getTitle());
                    request.setSummary(extractSummary(entry));
                    request.setSourceUrl(entry.getLink());
                    request.setImageUrl(extractEnclosureImage(entry));
                    request.setSourceName(feed.getTitle() != null ? feed.getTitle() : source.getName());
                    request.setCategory(resolveCategory(source.getCategoryScope()));
                    request.setNewsType(NewsType.EXTERNAL);
                    request.setLanguage("en");
                    request.setIsImportant(false);
                    items.add(request);
                }
            }
        } catch (Exception ex) {
            log.warn("[NewsFetchScheduler] RSS fetch failed for '{}': {}", source.getName(), ex.getMessage());
        }
        return items;
    }

    // ─── GNews fetching ─────────────────────────────────────────────────────────

    private List<NewsRequest> fetchFromGNewsTopics(TrustedSource source) {
        String keyword = normalize(source.getFetchKeyword());
        String url = UriComponentsBuilder.fromHttpUrl(gnewsBaseUrl + "/top-headlines")
                .queryParam("topic", keyword == null ? "agriculture" : keyword)
                .queryParam("lang", "en")
                .queryParam("country", "in")
                .queryParam("max", maxItemsPerSource)
                .queryParam("apikey", newsApiKey)
                .build(true)
                .toUriString();
        return fetchFromGnewsResponse(url, source);
    }

    private List<NewsRequest> fetchFromGNewsKeyword(TrustedSource source) {
        String keyword = normalize(source.getFetchKeyword());
        String url = UriComponentsBuilder.fromHttpUrl(gnewsBaseUrl + "/search")
                .queryParam("q", keyword == null ? "agriculture" : keyword)
                .queryParam("lang", "en")
                .queryParam("country", "in")
                .queryParam("max", maxItemsPerSource)
                .queryParam("apikey", newsApiKey)
                .build(true)
                .toUriString();
        return fetchFromGnewsResponse(url, source);
    }

    private List<NewsRequest> fetchFromGnewsResponse(String url, TrustedSource source) {
        try {
            String responseBody = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode articles = root.path("articles");
            List<NewsRequest> items = new ArrayList<>();
            if (!articles.isArray()) {
                log.warn("[NewsFetchScheduler] GNews: no 'articles' array for '{}'", source.getName());
                return items;
            }

            for (JsonNode article : articles) {
                NewsRequest request = new NewsRequest();
                request.setTitle(article.path("title").asText(null));
                request.setSummary(article.path("description").asText(""));
                request.setSourceUrl(article.path("url").asText(null));
                request.setImageUrl(article.path("image").asText(null));
                String sourceName = article.path("source").path("name").asText(null);
                request.setSourceName(sourceName == null || sourceName.isBlank()
                        ? source.getName() : sourceName);
                request.setCategory(resolveCategory(source.getCategoryScope()));
                request.setNewsType(NewsType.EXTERNAL);
                request.setLanguage("en");
                request.setIsImportant(false);
                items.add(request);
            }
            return items;
        } catch (Exception ex) {
            log.error("[NewsFetchScheduler] GNews fetch failed for '{}': {}",
                    source.getName(), ex.getMessage());
            return Collections.emptyList();
        }
    }

    // ─── Source registration ────────────────────────────────────────────────────

    /**
     * Ensures the default verified RSS feeds exist as trusted sources in the DB.
     * Only inserts sources whose name doesn't already exist.
     */
    @Transactional
    public void registerDefaultSources() {
        int registered = 0;
        for (String[] src : DEFAULT_RSS_SOURCES) {
            String name = src[0];
            if (trustedSourceRepository.existsByName(name)) continue;

            TrustedSource source = new TrustedSource();
            source.setName(name);
            source.setDomain(src[1]);
            source.setSourceUrl(src[2]);
            source.setCategoryScope(src[3]);
            source.setSourceType(src[4]);
            source.setIsActive(true);
            trustedSourceRepository.save(source);
            registered++;
        }
        if (registered > 0) {
            log.info("[NewsFetchScheduler] Registered {} new default RSS sources.", registered);
        }
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private boolean isGNewsKeyPlaceholder() {
        return newsApiKey == null
                || PLACEHOLDER_KEYS.contains(newsApiKey.trim().toLowerCase(Locale.ROOT));
    }

    private String extractSummary(SyndEntry entry) {
        SyndContent description = entry.getDescription();
        if (description != null && description.getValue() != null) {
            String cleaned = Jsoup.clean(description.getValue(), Safelist.none()).trim();
            if (!cleaned.isEmpty()) {
                return cleaned.length() > 2000
                        ? cleaned.substring(0, 1997) + "..." : cleaned;
            }
        }
        return entry.getTitle() == null ? "No summary available." : entry.getTitle();
    }

    private String extractEnclosureImage(SyndEntry entry) {
        if (entry.getEnclosures() == null) return null;
        return entry.getEnclosures().stream()
                .map(SyndEnclosure::getUrl)
                .filter(url -> url != null && !url.isBlank())
                .findFirst()
                .orElse(null);
    }

    private NewsCategory resolveCategory(String categoryScope) {
        String normalized = normalize(categoryScope);
        if (normalized == null) return NewsCategory.OTHER;
        String first = normalized.split(",")[0].trim().toUpperCase(Locale.ROOT);
        try {
            return NewsCategory.valueOf(first);
        } catch (IllegalArgumentException ex) {
            return NewsCategory.OTHER;
        }
    }

    private String normalize(String value) {
        if (value == null) return null;
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeSourceType(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
