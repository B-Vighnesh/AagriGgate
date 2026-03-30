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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Component
public class NewsFetchScheduler {

    private static final Logger log = LoggerFactory.getLogger(NewsFetchScheduler.class);

    @Value("${news.api.key}")
    private String newsApiKey;

    @Value("${news.api.gnews-url}")
    private String gnewsBaseUrl;

    @Value("${news.api.max-items-per-source:10}")
    private int maxItemsPerSource;

    @Value("${news.api.rss-timeout-seconds:10}")
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

    @Scheduled(fixedRate = 21_600_000)
    @Transactional
    public void fetchAllSources() {
        List<TrustedSource> sources = trustedSourceRepository.findByIsActiveTrue();
        if (sources.isEmpty()) {
            log.info("[NewsFetchScheduler] No active trusted sources configured.");
            return;
        }

        log.info("[NewsFetchScheduler] Starting fetch for {} sources", sources.size());
        for (TrustedSource source : sources) {
            try {
                int saved = fetchSource(source);
                log.info("[NewsFetchScheduler] Source '{}' fetched successfully; saved {} items", source.getName(), saved);
            } catch (Exception ex) {
                log.error("[NewsFetchScheduler] Failed to fetch source '{}': {}", source.getName(), ex.getMessage(), ex);
            }
        }
        log.info("[NewsFetchScheduler] Fetch cycle complete.");
    }

    @Transactional
    public int fetchSource(TrustedSource source) {
        List<NewsRequest> items = switch (normalizeSourceType(source.getSourceType())) {
            case "RSS" -> fetchFromRss(source);
            case "GNEWS_TOPIC" -> fetchFromGNewsTopics(source);
            case "GNEWS_KEYWORD" -> fetchFromGNewsKeyword(source);
            default -> {
                log.warn("[NewsFetchScheduler] Unknown sourceType: {}", source.getSourceType());
                yield Collections.emptyList();
            }
        };

        int savedCount = 0;
        for (NewsRequest item : items) {
            String sourceUrl = normalize(item.getSourceUrl());
            String title = normalize(item.getTitle());
            if (sourceUrl == null || title == null) {
                continue;
            }
            if (newsRepository.existsBySourceUrlOrTitle(sourceUrl, title)) {
                continue;
            }

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

    private List<NewsRequest> fetchFromRss(TrustedSource source) {
        List<NewsRequest> items = new ArrayList<>();
        try {
            URLConnection connection = new URL(source.getSourceUrl()).openConnection();
            connection.setConnectTimeout(rssTimeoutSeconds * 1000);
            connection.setReadTimeout(rssTimeoutSeconds * 1000);
            try (InputStream inputStream = connection.getInputStream(); XmlReader reader = new XmlReader(inputStream)) {
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
            throw new IllegalStateException("RSS fetch failed for source: " + source.getName(), ex);
        }
        return items;
    }

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
                return items;
            }

            for (JsonNode article : articles) {
                NewsRequest request = new NewsRequest();
                request.setTitle(article.path("title").asText(null));
                request.setSummary(article.path("description").asText(""));
                request.setSourceUrl(article.path("url").asText(null));
                request.setImageUrl(article.path("image").asText(null));
                String sourceName = article.path("source").path("name").asText(null);
                request.setSourceName(sourceName == null || sourceName.isBlank() ? source.getName() : sourceName);
                request.setCategory(resolveCategory(source.getCategoryScope()));
                request.setNewsType(NewsType.EXTERNAL);
                request.setLanguage("en");
                request.setIsImportant(false);
                items.add(request);
            }
            return items;
        } catch (Exception ex) {
            throw new IllegalStateException("GNews fetch failed for source: " + source.getName(), ex);
        }
    }

    private String extractSummary(SyndEntry entry) {
        SyndContent description = entry.getDescription();
        if (description != null && description.getValue() != null) {
            String cleaned = Jsoup.clean(description.getValue(), Safelist.none()).trim();
            if (!cleaned.isEmpty()) {
                return cleaned;
            }
        }
        return entry.getTitle() == null ? "No summary available." : entry.getTitle();
    }

    private String extractEnclosureImage(SyndEntry entry) {
        if (entry.getEnclosures() == null) {
            return null;
        }
        return entry.getEnclosures().stream()
                .map(SyndEnclosure::getUrl)
                .filter(url -> url != null && !url.isBlank())
                .findFirst()
                .orElse(null);
    }

    private NewsCategory resolveCategory(String categoryScope) {
        String normalized = normalize(categoryScope);
        if (normalized == null) {
            return NewsCategory.OTHER;
        }
        String first = normalized.split(",")[0].trim().toUpperCase(Locale.ROOT);
        try {
            return NewsCategory.valueOf(first);
        } catch (IllegalArgumentException ex) {
            return NewsCategory.OTHER;
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeSourceType(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
