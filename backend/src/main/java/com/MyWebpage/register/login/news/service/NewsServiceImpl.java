package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.exception.DuplicateNewsException;
import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.news.dto.request.NewsRequest;
import com.MyWebpage.register.login.news.dto.request.TrustedSourceRequest;
import com.MyWebpage.register.login.news.dto.response.NewsResponse;
import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.enums.DateRange;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.enums.NewsType;
import com.MyWebpage.register.login.news.mapper.NewsMapper;
import com.MyWebpage.register.login.news.repository.NewsRepository;
import com.MyWebpage.register.login.news.repository.SavedNewsRepository;
import com.MyWebpage.register.login.news.repository.TrustedSourceRepository;
import com.MyWebpage.register.login.news.scheduler.NewsIngestionScheduler;
import com.MyWebpage.register.login.notification.enums.NotificationType;
import com.MyWebpage.register.login.notification.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final NewsMapper newsMapper;
    private final SavedNewsRepository savedNewsRepository;
    private final TrustedSourceRepository trustedSourceRepository;
    private final NotificationService notificationService;
    private final FarmerRepo farmerRepo;
    private final NewsIngestionScheduler newsFetchScheduler;
    public NewsServiceImpl(
            NewsRepository newsRepository,
            NewsMapper newsMapper,
            SavedNewsRepository savedNewsRepository,
            TrustedSourceRepository trustedSourceRepository,
            NotificationService notificationService,
            FarmerRepo farmerRepo,
            NewsIngestionScheduler newsFetchScheduler
    ) {
        this.newsRepository = newsRepository;
        this.newsMapper = newsMapper;
        this.savedNewsRepository = savedNewsRepository;
        this.trustedSourceRepository = trustedSourceRepository;
        this.notificationService = notificationService;
        this.farmerRepo = farmerRepo;
        this.newsFetchScheduler = newsFetchScheduler;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NewsResponse> getAllNews(
            NewsCategory category,
            NewsType newsType,
            String language,
            Boolean isImportant,
            String keyword,
            DateRange dateRange,
            Long currentUserId,
            int page,
            int size,
            String sortBy
    ) {
        // Page size cap raised from 50 → 100 to support production-scale news feeds
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), resolveSort(sortBy));
        Page<News> newsPage = newsRepository.findAll(buildSpecification(NewsStatus.ACTIVE, category, newsType, language, isImportant, keyword, dateRange), pageable);
        Set<Long> savedIds = loadSavedIds(currentUserId, newsPage.getContent().stream().map(News::getId).toList());
        return newsPage.map(news -> newsMapper.toResponse(news, savedIds.contains(news.getId())));
    }

    @Override
    @Transactional(readOnly = true)
    public NewsResponse getNewsById(Long id, Long currentUserId) {
        News news = newsRepository.findByIdAndStatus(id, NewsStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with ID: " + id));
        boolean isSaved = savedNewsRepository.existsByUserIdAndNews_Id(currentUserId, id);
        return newsMapper.toResponse(news, isSaved);
    }

    @Override
    @Transactional
    public NewsResponse createNews(NewsRequest request, String uploadedBy) {
        String sourceUrl = normalizeRequired(request.getSourceUrl(), "sourceUrl");
        String title = normalizeRequired(request.getTitle(), "title");
        String sourceUrlHash = News.buildSourceUrlHash(title, sourceUrl);
        if (sourceUrlHash == null) {
            throw new IllegalArgumentException("Unable to build deduplication hash for news");
        }
        if (newsRepository.existsBySourceUrlHash(sourceUrlHash)) {
            throw new DuplicateNewsException("News already exists with the same title and source URL");
        }

        request.setSourceUrl(sourceUrl);
        request.setTitle(title);
        News news = newsMapper.toEntity(request);
        news.setSourceUrlHash(sourceUrlHash);
        news.setUploadedBy(normalizeUploadedBy(uploadedBy));
        News saved = newsRepository.save(news);
        notifyImportantNews(saved);
        return newsMapper.toResponse(saved, false);
    }

    @Override
    @Transactional
    public NewsResponse updateNews(Long id, NewsRequest request) {
        News existing = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with ID: " + id));

        String sourceUrl = normalizeRequired(request.getSourceUrl(), "sourceUrl");
        String title = normalizeRequired(request.getTitle(), "title");
        String sourceUrlHash = News.buildSourceUrlHash(title, sourceUrl);

        if (sourceUrlHash == null) {
            throw new IllegalArgumentException("Unable to build deduplication hash for news");
        }

        newsRepository.findBySourceUrlHash(sourceUrlHash)
                .filter(news -> !news.getId().equals(id))
                .ifPresent(news -> {
                    throw new DuplicateNewsException("News already exists with the same title and source URL");
                });

        request.setSourceUrl(sourceUrl);
        request.setTitle(title);
        newsMapper.updateEntity(existing, request);
        existing.setSourceUrlHash(sourceUrlHash);
        return newsMapper.toResponse(newsRepository.save(existing), false);
    }

    @Override
    @Transactional
    public void softDeleteNews(Long id) {
        News news = requireNews(id);
        news.setStatus(NewsStatus.DELETED);
        newsRepository.save(news);
    }

    @Override
    @Transactional
    public void archiveNews(Long id) {
        News news = requireNews(id);
        news.setStatus(NewsStatus.ARCHIVED);
        newsRepository.save(news);
    }

    @Override
    @Transactional
    public NewsResponse restoreNews(Long id) {
        News news = requireNews(id);
        news.setStatus(NewsStatus.ACTIVE);
        return newsMapper.toResponse(newsRepository.save(news), false);
    }

// TODO: Report feature temporarily disabled — to be re-enabled in future release.
/*
    @Override
    @Transactional
    public void reportNews(Long newsId, String reason) {
        News news = requireNews(newsId);
        news.setReportReason(normalizeRequired(reason, "reason"));
        news.setReportCount((news.getReportCount() == null ? 0 : news.getReportCount()) + 1);
        if (news.getReportCount() >= 5) {
            news.setStatus(NewsStatus.ARCHIVED);
        }
        newsRepository.save(news);
    }
*/

    @Override
    @Transactional(readOnly = true)
    public Page<NewsResponse> getAdminNews(
            NewsStatus status,
            NewsCategory category,
            NewsType newsType,
            String keyword,
            int page,
            int size,
            String sortBy
    ) {
        // Page size cap raised from 50 → 100 to support production-scale admin views
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), resolveSort(sortBy));
        return newsRepository.findAll(buildSpecification(status, category, newsType, null, null, keyword, null), pageable)
                .map(newsMapper::toResponse);
    }

    @Override
    @Transactional
    public TrustedSource createTrustedSource(TrustedSourceRequest request) {
        TrustedSource source = new TrustedSource();
        applyTrustedSource(source, request);
        return trustedSourceRepository.save(source);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrustedSource> getAllTrustedSources() {
        return trustedSourceRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Override
    @Transactional
    public TrustedSource updateTrustedSource(Long id, TrustedSourceRequest request) {
        TrustedSource source = trustedSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trusted source not found with ID: " + id));
        applyTrustedSource(source, request);
        return trustedSourceRepository.save(source);
    }

    @Override
    @Transactional
    public TrustedSource deactivateTrustedSource(Long id) {
        TrustedSource source = trustedSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trusted source not found with ID: " + id));
        source.setIsActive(false);
        return trustedSourceRepository.save(source);
    }

    @Override
    @Transactional
    public int triggerTrustedSourceFetch(Long id) {
        TrustedSource source = trustedSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trusted source not found with ID: " + id));
        try {
            return newsFetchScheduler.fetchSource(source);
        } catch (Exception exception) {
            throw new IllegalStateException("Trusted source fetch failed for source ID: " + id, exception);
        }
    }

    private Specification<News> buildSpecification(
            NewsStatus status,
            NewsCategory category,
            NewsType newsType,
            String language,
            Boolean isImportant,
            String keyword,
            DateRange dateRange
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (newsType != null) {
                predicates.add(cb.equal(root.get("newsType"), newsType));
            }
            if (language != null && !language.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("language")), language.trim().toLowerCase(Locale.ROOT)));
            }
            if (Boolean.TRUE.equals(isImportant)) {
                predicates.add(cb.isTrue(root.get("isImportant")));
            }
            if (keyword != null && !keyword.isBlank()) {
                String likeValue = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), likeValue),
                        cb.like(cb.lower(root.get("summary")), likeValue),
                        cb.like(cb.lower(cb.coalesce(root.get("sourceName"), "")), likeValue)
                ));
            }
            applyDateRangeFilter(dateRange, predicates, root, cb);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Set<Long> loadSavedIds(Long currentUserId, List<Long> newsIds) {
        if (newsIds.isEmpty()) {
            return java.util.Collections.emptySet();
        }
        Set<Long> savedIds = new HashSet<>();
        savedNewsRepository.findByUserIdAndNews_IdIn(currentUserId, newsIds)
                .forEach(saved -> savedIds.add(saved.getNews().getId()));
        return savedIds;
    }

    private void applyDateRangeFilter(
            DateRange dateRange,
            List<Predicate> predicates,
            jakarta.persistence.criteria.Root<News> root,
            jakarta.persistence.criteria.CriteriaBuilder cb
    ) {
        if (dateRange == null || dateRange == DateRange.ALL) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(com.MyWebpage.register.login.news.util.NewsTime.IST);
        LocalDateTime from = switch (dateRange) {
            case TODAY -> now.toLocalDate().atStartOfDay();
            case YESTERDAY -> now.toLocalDate().minusDays(1).atStartOfDay();
            case LAST_7_DAYS -> now.minusDays(7);
            case LAST_30_DAYS -> now.minusDays(30);
            case ALL -> null;
        };
        LocalDateTime to = switch (dateRange) {
            case YESTERDAY -> now.toLocalDate().atStartOfDay();
            default -> now;
        };
        if (from != null) {
            predicates.add(cb.or(
                    cb.between(root.get("publishedAt"), from, to),
                    cb.and(
                            cb.isNull(root.get("publishedAt")),
                            cb.between(root.get("createdAt"), from, to)
                    )
            ));
        }
    }

    private News requireNews(Long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with ID: " + id));
    }

    private Sort resolveSort(String sortBy) {
        if ("oldest".equalsIgnoreCase(sortBy)) {
            return Sort.by(
                    Sort.Order.asc("publishedAt").nullsLast(),
                    Sort.Order.asc("createdAt")
            );
        }
        return Sort.by(
                Sort.Order.desc("publishedAt").nullsLast(),
                Sort.Order.desc("createdAt")
        );
    }

    private void applyTrustedSource(TrustedSource source, TrustedSourceRequest request) {
        String sourceUrl = normalizeRequired(request.getSourceUrl(), "sourceUrl");
        source.setName(normalizeRequired(request.getName(), "name"));
        source.setSourceUrl(sourceUrl);
        source.setDomain(resolveDomain(request.getDomain(), sourceUrl));
        source.setCategoryScope(normalizeCategoryScope(request.getCategoryScope()));
        source.setSourceType(normalizeSourceType(request.getSourceType()));
        source.setFetchKeyword(normalizeOptional(request.getFetchKeyword()));
        source.setIsActive(request.getIsActive() == null || request.getIsActive());
    }

    private void notifyImportantNews(News news) {
        if (!Boolean.TRUE.equals(news.getIsImportant())) {
            return;
        }
        if (!(news.getCategory() == NewsCategory.LAW
                || news.getCategory() == NewsCategory.SUBSIDY
                || news.getCategory() == NewsCategory.LOAN
                || news.getCategory() == NewsCategory.WEATHER)) {
            return;
        }

        String body = buildImportantNotificationBody(news);
        for (Farmer farmer : farmerRepo.findAll()) {
            notificationService.createNotification(
                    farmer.getFarmerId(),
                    news.getTitle(),
                    body,
                    NotificationType.NEWS_IMPORTANT,
                    String.valueOf(news.getId()),
                    "NEWS"
            );
        }
    }

    private String buildImportantNotificationBody(News news) {
        String summary = news.getSummary() == null ? "" : news.getSummary().trim();
        if (summary.length() > 180) {
            summary = summary.substring(0, 177) + "...";
        }
        return news.getCategory().name() + ": " + summary;
    }

    private String normalizeUploadedBy(String value) {
        String normalized = normalizeOptional(value);
        return normalized == null ? "SYSTEM" : normalized.toUpperCase(Locale.ROOT);
    }

    private String normalizeCategoryScope(String value) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            return null;
        }
        List<String> values = java.util.Arrays.stream(normalized.split(","))
                .map(String::trim)
                .filter(token -> !token.isEmpty())
                .map(token -> token.toUpperCase(Locale.ROOT))
                .peek(NewsCategory::valueOf)
                .distinct()
                .toList();
        return values.isEmpty() ? null : String.join(",", values);
    }

    private String normalizeSourceType(String value) {
        String normalized = normalizeRequired(value, "sourceType").toUpperCase(Locale.ROOT);
        if (!normalized.equals("RSS") && !normalized.equals("GNEWS_TOPIC") && !normalized.equals("GNEWS_KEYWORD")) {
            throw new IllegalArgumentException("sourceType must be RSS, GNEWS_TOPIC, or GNEWS_KEYWORD");
        }
        return normalized;
    }

    private String resolveDomain(String domain, String sourceUrl) {
        String normalized = normalizeOptional(domain);
        if (normalized != null) {
            return normalized.toLowerCase(Locale.ROOT);
        }
        try {
            URI uri = URI.create(sourceUrl);
            String host = uri.getHost();
            if (host == null) {
                return null;
            }
            return host.startsWith("www.") ? host.substring(4).toLowerCase(Locale.ROOT) : host.toLowerCase(Locale.ROOT);
        } catch (Exception ex) {
            return null;
        }
    }

    private String normalizeRequired(String value, String field) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new IllegalArgumentException(field + " is required");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
