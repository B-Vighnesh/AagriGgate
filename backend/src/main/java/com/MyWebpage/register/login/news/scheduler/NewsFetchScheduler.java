package com.MyWebpage.register.login.news.scheduler;

import com.MyWebpage.register.login.news.config.NewsApiProperties;
import com.MyWebpage.register.login.news.dto.request.NewsRequest;
import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.enums.NewsType;
import com.MyWebpage.register.login.news.mapper.NewsMapper;
import com.MyWebpage.register.login.news.repository.NewsRepository;
import com.MyWebpage.register.login.news.repository.TrustedSourceRepository;
import com.MyWebpage.register.login.news.service.ApiQuotaLogService;
import com.MyWebpage.register.login.news.util.NewsTime;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEnclosure;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import org.jdom2.Element;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;

import static net.logstash.logback.argument.StructuredArguments.keyValue;

@Deprecated
public class NewsFetchScheduler {

    private static final Logger log = LoggerFactory.getLogger(NewsFetchScheduler.class);

    private static final Set<String> KNOWN_BROKEN_IMAGE_DOMAINS = Set.of(
            "pbs.twimg.com",
            "static.toiimg.com"
    );

    private static final List<String> PLACEHOLDER_KEYS = List.of(
            "demo-news-key", "your-api-key", "your_api_key", "changeme", ""
    );

    private static final List<String[]> CANONICAL_SOURCES = List.of(
            new String[]{"PIB Agriculture", "pib.gov.in", "https://www.pib.gov.in/rssfeed.aspx?mincode=2", "SUBSIDY,LAW", "RSS", null},
            new String[]{"Krishi Jagran", "krishijagran.com", "https://krishijagran.com/feed/", "FARMING_TIP,MARKET", "RSS", null},
            new String[]{"AgriFarming", "agrifarming.in", "https://www.agrifarming.in/feed", "FARMING_TIP", "RSS", null},
            new String[]{"Kisan Rath", "kisanrath.in", "https://www.kisanrath.in/feed", "MARKET,SUBSIDY", "RSS", null},
            new String[]{"GNews: kisan subsidy", "gnews.io", "https://gnews.io/api/v4/search", "SUBSIDY,LOAN", "GNEWS_KEYWORD", "kisan subsidy"},
            new String[]{"GNews: mandi price", "gnews.io", "https://gnews.io/api/v4/search", "MARKET", "GNEWS_KEYWORD", "mandi price"},
            new String[]{"GNews: agriculture law", "gnews.io", "https://gnews.io/api/v4/search", "LAW", "GNEWS_KEYWORD", "agriculture law"},
            new String[]{"GNews: crop weather", "gnews.io", "https://gnews.io/api/v4/search", "WEATHER", "GNEWS_KEYWORD", "crop weather"},
            new String[]{"GNews: farm loan", "gnews.io", "https://gnews.io/api/v4/search", "LOAN", "GNEWS_KEYWORD", "farm loan"},
            new String[]{"GNews: agri scheme", "gnews.io", "https://gnews.io/api/v4/search", "SUBSIDY", "GNEWS_KEYWORD", "agri scheme"}
    );

    private static final List<String[]> DEFAULT_RSS_SOURCES = CANONICAL_SOURCES;

    private final NewsApiProperties newsApiProperties;
    private final String newsApiKey;
    private final String gnewsBaseUrl;
    private final int maxItemsPerSource;
    private final int rssTimeoutSeconds;
    private final TrustedSourceRepository trustedSourceRepository;
    private final NewsRepository newsRepository;
    private final NewsMapper newsMapper;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ExecutorService newsExecutorService;
    private final ApiQuotaLogService apiQuotaLogService;
    private final NewsSchedulerState newsSchedulerState;
    private final Tracer tracer;
    private final MeterRegistry meterRegistry;
    private final CircuitBreaker circuitBreaker;
    private final Retry retry;

    public NewsFetchScheduler(
            NewsApiProperties newsApiProperties,
            TrustedSourceRepository trustedSourceRepository,
            NewsRepository newsRepository,
            NewsMapper newsMapper,
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            ExecutorService newsExecutorService,
            ApiQuotaLogService apiQuotaLogService,
            NewsSchedulerState newsSchedulerState,
            Tracer tracer,
            MeterRegistry meterRegistry
    ) {
        this.newsApiProperties = newsApiProperties;
        this.newsApiKey = newsApiProperties.getKey();
        this.gnewsBaseUrl = newsApiProperties.getGnewsUrl();
        this.maxItemsPerSource = newsApiProperties.getMaxItemsPerSource();
        this.rssTimeoutSeconds = newsApiProperties.getRssTimeoutSeconds();
        this.trustedSourceRepository = trustedSourceRepository;
        this.newsRepository = newsRepository;
        this.newsMapper = newsMapper;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.newsExecutorService = newsExecutorService;
        this.apiQuotaLogService = apiQuotaLogService;
        this.newsSchedulerState = newsSchedulerState;
        this.tracer = tracer;
        this.meterRegistry = meterRegistry;
        this.circuitBreaker = CircuitBreaker.of("news-fetch", CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(60))
                .slidingWindowSize(10)
                .build());
        this.retry = Retry.of("news-fetch", RetryConfig.custom()
                .maxAttempts(3)
                .intervalFunction(io.github.resilience4j.core.IntervalFunction.ofExponentialBackoff(1000L, 2.0d))
                .build());
    }

    // ─── Startup ────────────────────────────────────────────────────────────────

    /**
     * On application startup: register default RSS sources if missing, then
     * immediately fetch from all active sources so the news page has content.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("[NewsFetchScheduler] Application ready — initialising news sources...");
        registerCanonicalSources();

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
            String sourceUrlHash = News.buildSourceUrlHash(title, sourceUrl);
            if (sourceUrlHash == null) continue;
            if (newsRepository.existsBySourceUrlHash(sourceUrlHash)) continue;

            item.setSourceUrl(sourceUrl);
            item.setTitle(title);
            News news = newsMapper.toEntity(item);
            news.setSourceUrlHash(sourceUrlHash);
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
                    request.setPublishedAt(extractPublishedAt(entry));
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
                request.setPublishedAt(extractPublishedAt(article.path("publishedAt").asText(null)));
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
    public void registerCanonicalSources() {
        registerDefaultSources();
    }

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

    private LocalDateTime extractPublishedAt(SyndEntry entry) {
        Date publishedDate = entry.getPublishedDate();
        if (publishedDate == null) {
            return null;
        }
        return LocalDateTime.ofInstant(publishedDate.toInstant(), NewsTime.IST);
    }

    private LocalDateTime extractPublishedAt(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        try {
            return OffsetDateTime.parse(normalized).atZoneSameInstant(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
        } catch (Exception ignored) {
        }
        try {
            return ZonedDateTime.parse(normalized).withZoneSameInstant(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
        } catch (Exception ignored) {
        }
        try {
            return LocalDateTime.ofInstant(Instant.parse(normalized), NewsTime.IST);
        } catch (Exception ignored) {
        }
        return null;
    }
}
