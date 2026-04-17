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

@Component
public class NewsIngestionScheduler {

    private static final Logger log = LoggerFactory.getLogger(NewsIngestionScheduler.class);

    private static final Set<String> KNOWN_BROKEN_IMAGE_DOMAINS = Set.of(
            "pbs.twimg.com",
            "static.toiimg.com"
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

    private final NewsApiProperties newsApiProperties;
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

    public NewsIngestionScheduler(
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

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        registerCanonicalSources();
        if (!newsApiProperties.isIngestOnStartup()) {
            log.info("news.startup.ingestion.skipped", keyValue("event", "startup_ingestion_skipped"));
            return;
        }
        if (!newsApiProperties.isSchedulerEnabled()) {
            log.info("news.startup.ingestion.scheduler_disabled", keyValue("event", "startup_ingestion_scheduler_disabled"));
            return;
        }
        log.info("news.startup.ingestion.started", keyValue("event", "startup_ingestion_started"));
        fetchAllSources();
        log.info("news.startup.ingestion.completed", keyValue("event", "startup_ingestion_completed"));
    }

    @Scheduled(cron = "${news.api.scheduler-cron}")
    @Transactional
    public void fetchAllSources() {
        if (!newsApiProperties.isSchedulerEnabled()) {
            log.info("news.scheduler.disabled", keyValue("event", "scheduler_skipped"));
            return;
        }

        List<TrustedSource> sources = trustedSourceRepository.findByIsActiveTrue();
        if (sources.isEmpty()) {
            log.info("news.scheduler.no_sources", keyValue("event", "scheduler_no_sources"));
            return;
        }

        newsSchedulerState.markCycleStarted();
        boolean gnewsQuotaExhausted = false;
        int successCount = 0;
        int failureCount = 0;

        for (TrustedSource source : sources) {
            if (gnewsQuotaExhausted && isGnewsSource(source)) {
                continue;
            }

            try {
                Future<Integer> future = newsExecutorService.submit(() -> fetchSource(source));
                int saved = future.get();
                successCount++;
            } catch (Exception exception) {
                failureCount++;
                if (isQuotaExceeded(exception)) {
                    gnewsQuotaExhausted = true;
                }
                log.error(
                        "news.scheduler.source_failed",
                        keyValue("event", "source_fetch_failed"),
                        keyValue("sourceId", source.getId()),
                        keyValue("sourceName", source.getName()),
                        keyValue("sourceType", source.getSourceType()),
                        keyValue("errorMessage", exception.getMessage()),
                        keyValue("timestamp", LocalDateTime.now(NewsTime.IST).toString())
                );
            }
        }

        newsSchedulerState.markCycleCompleted(successCount, failureCount);
    }

    @Transactional
    public int fetchSource(TrustedSource source) throws Exception {
        long startedAt = System.nanoTime();
        Span span = tracer.nextSpan().name("news_fetch_source")
                .tag("sourceName", source.getName())
                .tag("sourceType", source.getSourceType())
                .start();

        try (Tracer.SpanInScope ignored = tracer.withSpan(span)) {
            List<NewsRequest> fetchedItems = executeWithResilience(() -> fetchItemsForSource(source));
            int fetchedCount = fetchedItems.size();
            int savedCount = 0;
            int dedupedCount = 0;

            for (NewsRequest item : fetchedItems) {
                String sourceUrl = normalize(item.getSourceUrl());
                String title = normalize(item.getTitle());
                if (sourceUrl == null || title == null) {
                    continue;
                }
                String sourceUrlHash = News.buildSourceUrlHash(title, sourceUrl);
                if (sourceUrlHash == null) {
                    continue;
                }
                if (newsRepository.existsBySourceUrlHash(sourceUrlHash)) {
                    dedupedCount++;
                    continue;
                }

                item.setSourceUrl(sourceUrl);
                item.setTitle(title);
                item.setImageUrl(sanitizeImageUrl(item.getImageUrl()));
                News news = newsMapper.toEntity(item);
                news.setSourceUrlHash(sourceUrlHash);
                news.setUploadedBy("SOURCE");
                news.setNewsType(NewsType.EXTERNAL);
                news.setStatus(NewsStatus.ACTIVE);
                newsRepository.save(news);
                savedCount++;
            }

            source.setLastFetchedAt(LocalDateTime.now(NewsTime.IST));
            trustedSourceRepository.save(source);

            recordMetrics(source, startedAt, fetchedCount, savedCount, dedupedCount);
            logFetchEvent("source_fetch_completed", source, startedAt, fetchedCount, savedCount, dedupedCount, null);
            return savedCount;
        } catch (Exception exception) {
            span.error(exception);
            logFetchEvent("source_fetch_failed", source, startedAt, 0, 0, 0, exception.getMessage());
            throw exception;
        } finally {
            span.end();
        }
    }

    @Transactional
    public void registerCanonicalSources() {
        List<TrustedSource> existingSources = trustedSourceRepository.findAll();
        Set<String> canonicalNames = CANONICAL_SOURCES.stream()
                .map(config -> config[0])
                .collect(java.util.stream.Collectors.toSet());
        for (String[] sourceConfig : CANONICAL_SOURCES) {
            TrustedSource source = existingSources.stream()
                    .filter(existing -> existing.getName().equals(sourceConfig[0]))
                    .findFirst()
                    .orElseGet(TrustedSource::new);
            source.setName(sourceConfig[0]);
            source.setDomain(sourceConfig[1]);
            source.setSourceUrl(sourceConfig[2]);
            source.setCategoryScope(sourceConfig[3]);
            source.setSourceType(sourceConfig[4]);
            source.setFetchKeyword(sourceConfig[5]);
            source.setIsActive(true);
            trustedSourceRepository.save(source);
        }
        existingSources.stream()
                .filter(source -> !canonicalNames.contains(source.getName()))
                .forEach(source -> {
                    source.setIsActive(false);
                    trustedSourceRepository.save(source);
                });
    }

    private List<NewsRequest> fetchItemsForSource(TrustedSource source) {
        return switch (normalizeSourceType(source.getSourceType())) {
            case "RSS" -> fetchFromRss(source);
            case "GNEWS_KEYWORD", "GNEWS_TOPIC" -> fetchFromGnewsPaginated(source);
            default -> Collections.emptyList();
        };
    }

    private List<NewsRequest> fetchFromRss(TrustedSource source) {
        List<NewsRequest> items = new ArrayList<>();
        try {
            URLConnection connection = URI.create(source.getSourceUrl()).toURL().openConnection();
            connection.setConnectTimeout(newsApiProperties.getRssTimeoutSeconds() * 1000);
            connection.setReadTimeout(newsApiProperties.getRssTimeoutSeconds() * 1000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (compatible; AagriGgateBot/1.0)");
            connection.setRequestProperty("Accept", "application/rss+xml, application/xml, text/xml, */*");

            try (InputStream inputStream = connection.getInputStream();
                 XmlReader reader = new XmlReader(inputStream)) {
                SyndFeed feed = new SyndFeedInput().build(reader);
                for (SyndEntry entry : feed.getEntries().stream().limit(newsApiProperties.getMaxItemsPerSource()).toList()) {
//                    System.out.println("hiiiiiiiiiiiiiiiiiiiiiiiiii"+entry);
                    NewsRequest request = new NewsRequest();
                    request.setTitle(entry.getTitle());
                    request.setSummary(extractSummary(entry));
                    request.setSourceUrl(entry.getLink());
                    request.setImageUrl(extractImageFromEntry(entry));
                    request.setSourceName(source.getName());
                    request.setCategory(resolveCategory(source.getCategoryScope()));
                    request.setNewsType(NewsType.EXTERNAL);
                    request.setLanguage("en");
                    request.setIsImportant(false);
                    request.setPublishedAt(extractPublishedAt(entry));
                    items.add(request);
                }
            }
        } catch (Exception exception) {
            throw new IllegalStateException("RSS fetch failed for " + source.getName(), exception);
        }
        return items;
    }

    private List<NewsRequest> fetchFromGnewsPaginated(TrustedSource source) {
        if (!newsApiProperties.isGnewsEnabled()) {
            return Collections.emptyList();
        }

        List<NewsRequest> allItems = new ArrayList<>();
        int page = 1;
        int fetched;

        do {
            if (!apiQuotaLogService.tryConsumeGnewsCall(newsApiProperties.getGnewsDailyLimit())) {
                log.warn(
                        "news.scheduler.quota_guard",
                        keyValue("event", "gnews_quota_guard"),
                        keyValue("sourceId", source.getId()),
                        keyValue("sourceName", source.getName()),
                        keyValue("sourceType", source.getSourceType()),
                        keyValue("errorMessage", "Daily GNews quota reached"),
                        keyValue("timestamp", LocalDateTime.now(NewsTime.IST).toString())
                );
                throw new IllegalStateException("GNEWS_QUOTA_LIMIT_REACHED");
            }

            List<NewsRequest> batch = fetchGnewsPage(source, buildGnewsUrl(source, page));
            allItems.addAll(batch);
            fetched = batch.size();
            page++;
        } while (fetched > 0 && allItems.size() < newsApiProperties.getMaxItemsPerSource());

        return allItems.stream().limit(newsApiProperties.getMaxItemsPerSource()).toList();
    }

    private List<NewsRequest> fetchGnewsPage(TrustedSource source, String url) {
        Span span = tracer.nextSpan().name("fetch_gnews")
                .tag("sourceName", source.getName())
                .tag("sourceType", source.getSourceType())
                .start();
        try (Tracer.SpanInScope ignored = tracer.withSpan(span)) {
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
                request.setSourceName(article.path("source").path("name").asText(source.getName()));
                request.setCategory(resolveCategory(source.getCategoryScope()));
                request.setNewsType(NewsType.EXTERNAL);
                request.setLanguage("en");
                request.setIsImportant(false);
                request.setPublishedAt(extractPublishedAt(article.path("publishedAt").asText(null)));
                items.add(request);
            }
            return items;
        } catch (Exception exception) {
            span.error(exception);
            throw new IllegalStateException("GNews fetch failed for " + source.getName(), exception);
        } finally {
            span.end();
        }
    }

    private <T> T executeWithResilience(Callable<T> callable) throws Exception {
        return Retry.decorateCallable(retry, CircuitBreaker.decorateCallable(circuitBreaker, callable)).call();
    }

    private void recordMetrics(TrustedSource source, long startedAt, int fetchedCount, int savedCount, int dedupedCount) {
        Timer.builder("news.scheduler.fetch.duration")
                .tag("sourceName", source.getName())
                .tag("sourceType", source.getSourceType())
                .register(meterRegistry)
                .record(System.nanoTime() - startedAt, java.util.concurrent.TimeUnit.NANOSECONDS);
        counter("news.items.fetched.total", source).increment(fetchedCount);
        counter("news.items.saved.total", source).increment(savedCount);
        counter("news.items.deduped.total", source).increment(dedupedCount);
    }

    private Counter counter(String name, TrustedSource source) {
        return Counter.builder(name)
                .tag("sourceName", source.getName())
                .register(meterRegistry);
    }

    private void logFetchEvent(
            String event,
            TrustedSource source,
            long startedAt,
            int itemsFetched,
            int itemsSaved,
            int itemsDeduped,
            String errorMessage
    ) {
        long durationMs = Duration.ofNanos(System.nanoTime() - startedAt).toMillis();
        if (errorMessage == null) {
            log.info(
                    "news.scheduler.event",
                    keyValue("event", event),
                    keyValue("sourceId", source.getId()),
                    keyValue("sourceName", source.getName()),
                    keyValue("sourceType", source.getSourceType()),
                    keyValue("fetchDurationMs", durationMs),
                    keyValue("itemsFetched", itemsFetched),
                    keyValue("itemsSaved", itemsSaved),
                    keyValue("itemsDeduped", itemsDeduped),
                    keyValue("timestamp", LocalDateTime.now(NewsTime.IST).toString())
            );
            return;
        }

        log.error(
                "news.scheduler.event",
                keyValue("event", event),
                keyValue("sourceId", source.getId()),
                keyValue("sourceName", source.getName()),
                keyValue("sourceType", source.getSourceType()),
                keyValue("fetchDurationMs", durationMs),
                keyValue("itemsFetched", itemsFetched),
                keyValue("itemsSaved", itemsSaved),
                keyValue("itemsDeduped", itemsDeduped),
                keyValue("errorMessage", errorMessage),
                keyValue("timestamp", LocalDateTime.now(NewsTime.IST).toString())
        );
    }

    private String buildGnewsUrl(TrustedSource source, int page) {
        String baseUrl = normalize(source.getSourceUrl());
        String keyword = normalize(source.getFetchKeyword());
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl == null ? newsApiProperties.getGnewsUrl() + "/search" : baseUrl)
                .queryParam("lang", "en")
                .queryParam("country", "in")
                .queryParam("max", newsApiProperties.getMaxItemsPerSource())
                .queryParam("page", page)
                .queryParam("apikey", newsApiProperties.getKey());

        if ("GNEWS_TOPIC".equals(normalizeSourceType(source.getSourceType()))) {
            builder.queryParam("topic", keyword == null ? "agriculture" : keyword);
        } else {
            builder.queryParam("q", keyword == null ? "agriculture" : keyword);
        }

        return builder.build(true).toUriString();
    }

    private String extractSummary(SyndEntry entry) {
        SyndContent description = entry.getDescription();
        if (description != null && description.getValue() != null) {
            String cleaned = Jsoup.clean(description.getValue(), Safelist.none()).trim();
            if (!cleaned.isEmpty()) {
                return cleaned.length() > 2000 ? cleaned.substring(0, 1997) + "..." : cleaned;
            }
        }
        return entry.getTitle() == null ? "No summary available." : entry.getTitle();
    }

    private String extractImageFromEntry(SyndEntry entry) {
        // 1. Check enclosures (standard RSS image attachment)
        if (entry.getEnclosures() != null && !entry.getEnclosures().isEmpty()) {
            String url = entry.getEnclosures().get(0).getUrl();
            if (url != null && !url.isBlank()) {
                return sanitizeImageUrl(url);
            }
        }
        // 2. Check foreign markup for media:content and media:thumbnail
        if (entry.getForeignMarkup() != null) {
            for (Element element : entry.getForeignMarkup()) {
                String prefix = element.getNamespacePrefix();
                String name = element.getName();
                // media:content or media:thumbnail — both carry a "url" attribute
                if ("media".equals(prefix) && ("content".equals(name) || "thumbnail".equals(name))) {
                    String url = element.getAttributeValue("url");
                    if (url != null && !url.isBlank()) {
                        return sanitizeImageUrl(url);
                    }
                }
            }
        }
        // 3. Fallback: try to extract the first <img> src from the description HTML
        SyndContent description = entry.getDescription();
        if (description != null && description.getValue() != null) {
            String html = description.getValue();
            try {
                org.jsoup.nodes.Document doc = Jsoup.parse(html);
                org.jsoup.nodes.Element img = doc.selectFirst("img[src]");
                if (img != null) {
                    String src = img.attr("abs:src");
                    if (src.isBlank()) {
                        src = img.attr("src");
                    }
                    if (!src.isBlank()) {
                        return sanitizeImageUrl(src);
                    }
                }
            } catch (Exception ignored) {
                // HTML parsing failure is non-critical; skip image extraction
            }
        }
        return null;
    }

    private String sanitizeImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }
        // Task 6: Attempt to upgrade http → https instead of discarding
        String url = imageUrl.trim();
        if (url.startsWith("http://")) {
            url = "https://" + url.substring(7);
        }
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            if (host == null) {
                return null;
            }
            for (String blocked : KNOWN_BROKEN_IMAGE_DOMAINS) {
                if (host.contains(blocked)) {
                    return null;
                }
            }
            return url;
        } catch (URISyntaxException exception) {
            return null;
        }
    }

    private NewsCategory resolveCategory(String categoryScope) {
        String normalized = normalize(categoryScope);
        if (normalized == null) {
            return NewsCategory.OTHER;
        }
        String first = normalized.split(",")[0].trim().toUpperCase(Locale.ROOT);
        try {
            return NewsCategory.valueOf(first);
        } catch (IllegalArgumentException exception) {
            return NewsCategory.OTHER;
        }
    }

    private boolean isGnewsSource(TrustedSource source) {
        String type = normalizeSourceType(source.getSourceType());
        return "GNEWS_KEYWORD".equals(type) || "GNEWS_TOPIC".equals(type);
    }

    private boolean isQuotaExceeded(Exception exception) {
        Throwable cause = exception;
        while (cause != null) {
            if ("GNEWS_QUOTA_LIMIT_REACHED".equals(cause.getMessage())) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
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
