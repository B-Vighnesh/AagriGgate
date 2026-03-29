package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.news.dto.NewsRequest;
import com.MyWebpage.register.login.news.dto.NewsResponse;
import com.MyWebpage.register.login.news.dto.TrustedSourceRequest;
import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.enums.NewsType;
import com.MyWebpage.register.login.news.notification.NewsNotificationService;
import com.MyWebpage.register.login.news.repository.NewsRepository;
import com.MyWebpage.register.login.news.repository.SavedNewsRepository;
import com.MyWebpage.register.login.news.repository.TrustedSourceRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class NewsServiceImpl implements NewsService {

    private static final Logger logger = LoggerFactory.getLogger(NewsServiceImpl.class);

    private final NewsRepository newsRepository;
    private final SavedNewsRepository savedNewsRepository;
    private final TrustedSourceRepository trustedSourceRepository;
    private final NewsNotificationService newsNotificationService;

    public NewsServiceImpl(
            NewsRepository newsRepository,
            SavedNewsRepository savedNewsRepository,
            TrustedSourceRepository trustedSourceRepository,
            NewsNotificationService newsNotificationService
    ) {
        this.newsRepository = newsRepository;
        this.savedNewsRepository = savedNewsRepository;
        this.trustedSourceRepository = trustedSourceRepository;
        this.newsNotificationService = newsNotificationService;
    }

    @Override
    @Transactional
    public NewsResponse createNews(NewsRequest request, String uploadedBy) {
        String normalizedSourceUrl = normalizeUrl(request.getSourceUrl());
        String normalizedTitle = normalizeRequired(request.getTitle(), "title");
        if (newsRepository.existsBySourceUrl(normalizedSourceUrl)) {
            throw new IllegalArgumentException("News already exists with this source URL");
        }
        if (newsRepository.existsByTitle(normalizedTitle)) {
            throw new IllegalArgumentException("News already exists with this title");
        }

        News news = new News();
        applyRequest(news, request);
        news.setTitle(normalizedTitle);
        news.setSourceUrl(normalizedSourceUrl);
        news.setUploadedBy(normalizeUploadedBy(uploadedBy));
        News saved = newsRepository.save(news);
        newsNotificationService.notifyImportantNews(saved);
        logger.info("News created with id={} uploadedBy={}", saved.getId(), saved.getUploadedBy());
        return toResponse(saved, false);
    }

    @Override
    @Transactional
    public NewsResponse updateNews(Long id, NewsRequest request) {
        News existing = requireNews(id);
        if (existing.getStatus() == NewsStatus.DELETED) {
            throw new IllegalArgumentException("Deleted news cannot be edited");
        }

        String normalizedSourceUrl = normalizeUrl(request.getSourceUrl());
        String normalizedTitle = normalizeRequired(request.getTitle(), "title");
        if (newsRepository.existsBySourceUrl(normalizedSourceUrl) && !normalizedSourceUrl.equals(existing.getSourceUrl())) {
            throw new IllegalArgumentException("News already exists with this source URL");
        }
        if (newsRepository.existsByTitle(normalizedTitle) && !normalizedTitle.equals(existing.getTitle())) {
            throw new IllegalArgumentException("News already exists with this title");
        }

        applyRequest(existing, request);
        existing.setTitle(normalizedTitle);
        existing.setSourceUrl(normalizedSourceUrl);
        News saved = newsRepository.save(existing);
        logger.info("News updated with id={}", saved.getId());
        return toResponse(saved, false);
    }

    @Override
    @Transactional
    public void softDeleteNews(Long id) {
        News existing = requireNews(id);
        if (existing.getStatus() == NewsStatus.DELETED) {
            return;
        }
        existing.setStatus(NewsStatus.DELETED);
        newsRepository.save(existing);
        logger.info("News soft deleted with id={}", id);
    }

    @Override
    @Transactional
    public NewsResponse archiveNews(Long id) {
        News existing = requireNews(id);
        if (existing.getStatus() == NewsStatus.DELETED) {
            throw new IllegalArgumentException("Deleted news cannot be archived");
        }
        if (existing.getStatus() == NewsStatus.ARCHIVED) {
            throw new IllegalArgumentException("News is already archived");
        }
        existing.setStatus(NewsStatus.ARCHIVED);
        News saved = newsRepository.save(existing);
        logger.info("News archived with id={}", id);
        return toResponse(saved, false);
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<NewsResponse> getAllNews(
            NewsCategory category,
            NewsType newsType,
            String language,
            Boolean isImportant,
            String keyword,
            int page,
            int size,
            String sortBy,
            Long userId
    ) {
        Pageable pageable = buildPageable(page, size, sortBy);
        Specification<News> specification = buildNewsSpecification(NewsStatus.ACTIVE, category, newsType, language, isImportant, keyword);
        return newsRepository.findAll(specification, pageable)
                .map(news -> toResponse(news, isSaved(userId, news.getId())));
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public NewsResponse getNewsById(Long id, Long userId) {
        News news = newsRepository.findOne(buildIdSpecification(id, NewsStatus.ACTIVE))
                .orElseThrow(() -> new ResourceNotFoundException("News not found with ID: " + id));
        return toResponse(news, isSaved(userId, news.getId()));
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<NewsResponse> getAdminNews(NewsStatus status, String keyword, int page, int size, String sortBy) {
        Pageable pageable = buildPageable(page, size, sortBy);
        Specification<News> specification = Specification.where(null);
        if (status != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (keyword != null && !keyword.isBlank()) {
            String likeValue = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), likeValue),
                    cb.like(cb.lower(root.get("summary")), likeValue),
                    cb.like(cb.lower(cb.coalesce(root.get("sourceName").as(String.class), "")), likeValue)
            ));
        }
        return newsRepository.findAll(specification, pageable)
                .map(news -> toResponse(news, false));
    }

    @Override
    @Transactional
    public TrustedSource createTrustedSource(TrustedSourceRequest request) {
        TrustedSource source = new TrustedSource();
        applyTrustedSourceRequest(source, request);
        TrustedSource saved = trustedSourceRepository.save(source);
        logger.info("Trusted source created with id={}", saved.getId());
        return saved;
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<TrustedSource> getAllTrustedSources() {
        return trustedSourceRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Override
    @Transactional
    public TrustedSource updateTrustedSource(Long id, TrustedSourceRequest request) {
        TrustedSource source = trustedSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trusted source not found with ID: " + id));
        applyTrustedSourceRequest(source, request);
        TrustedSource saved = trustedSourceRepository.save(source);
        logger.info("Trusted source updated with id={}", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public TrustedSource deactivateTrustedSource(Long id) {
        TrustedSource source = trustedSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trusted source not found with ID: " + id));
        source.setIsActive(false);
        TrustedSource saved = trustedSourceRepository.save(source);
        logger.info("Trusted source deactivated with id={}", saved.getId());
        return saved;
    }

    private News requireNews(Long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with ID: " + id));
    }

    private void applyRequest(News news, NewsRequest request) {
        news.setSummary(normalizeRequired(request.getSummary(), "summary"));
        news.setSourceName(normalizeOptional(request.getSourceName()));
        news.setImageUrl(normalizeOptionalUrl(request.getImageUrl()));
        news.setCategory(request.getCategory());
        news.setNewsType(request.getNewsType());
        news.setLanguage(normalizeLanguage(request.getLanguage()));
        news.setIsImportant(Boolean.TRUE.equals(request.getIsImportant()));
        if (news.getStatus() == null) {
            news.setStatus(NewsStatus.ACTIVE);
        }
    }

    private void applyTrustedSourceRequest(TrustedSource source, TrustedSourceRequest request) {
        String sourceUrl = normalizeUrl(request.getSourceUrl());
        source.setName(normalizeRequired(request.getName(), "name"));
        source.setSourceUrl(sourceUrl);
        source.setDomain(resolveDomain(request.getDomain(), sourceUrl));
        source.setCategoryScope(normalizeCategoryScope(request.getCategoryScope()));
        source.setIsActive(request.getIsActive() == null || request.getIsActive());
    }

    private Specification<News> buildNewsSpecification(
            NewsStatus status,
            NewsCategory category,
            NewsType newsType,
            String language,
            Boolean isImportant,
            String keyword
    ) {
        return (root, query, cb) -> {
            Specification<News> specification = Specification.where((r, q, c) -> c.equal(r.get("status"), status));
            if (category != null) {
                specification = specification.and((r, q, c) -> c.equal(r.get("category"), category));
            }
            if (newsType != null) {
                specification = specification.and((r, q, c) -> c.equal(r.get("newsType"), newsType));
            }
            String normalizedLanguage = normalizeOptional(language);
            if (normalizedLanguage != null) {
                specification = specification.and((r, q, c) -> c.equal(c.lower(r.get("language")), normalizedLanguage.toLowerCase(Locale.ROOT)));
            }
            if (Boolean.TRUE.equals(isImportant)) {
                specification = specification.and((r, q, c) -> c.isTrue(r.get("isImportant")));
            }
            String normalizedKeyword = normalizeOptional(keyword);
            if (normalizedKeyword != null) {
                String likeValue = "%" + normalizedKeyword.toLowerCase(Locale.ROOT) + "%";
                specification = specification.and((r, q, c) -> c.or(
                        c.like(c.lower(r.get("title")), likeValue),
                        c.like(c.lower(r.get("summary")), likeValue),
                        c.like(c.lower(c.coalesce(r.get("sourceName").as(String.class), "")), likeValue)
                ));
            }
            return specification.toPredicate(root, query, cb);
        };
    }

    private Specification<News> buildIdSpecification(Long id, NewsStatus status) {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("id"), id),
                cb.equal(root.get("status"), status)
        );
    }

    private Pageable buildPageable(int page, int size, String sortBy) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);
        return PageRequest.of(safePage, safeSize, resolveSort(sortBy));
    }

    private Sort resolveSort(String sortBy) {
        if ("oldest".equalsIgnoreCase(sortBy)) {
            return Sort.by(Sort.Direction.ASC, "createdAt");
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    private boolean isSaved(Long userId, Long newsId) {
        return userId != null && savedNewsRepository.existsByUserIdAndNews_Id(userId, newsId);
    }

    private NewsResponse toResponse(News news, boolean isSaved) {
        NewsResponse response = new NewsResponse();
        response.setId(news.getId());
        response.setTitle(news.getTitle());
        response.setSummary(news.getSummary());
        response.setSourceName(news.getSourceName());
        response.setSourceUrl(news.getSourceUrl());
        response.setImageUrl(news.getImageUrl());
        response.setCategory(news.getCategory());
        response.setNewsType(news.getNewsType());
        response.setLanguage(news.getLanguage());
        response.setIsImportant(news.getIsImportant());
        response.setUploadedBy(news.getUploadedBy());
        response.setStatus(news.getStatus());
        response.setCreatedAt(news.getCreatedAt());
        response.setUpdatedAt(news.getUpdatedAt());
        response.setIsSaved(isSaved);
        return response;
    }

    private String normalizeUploadedBy(String uploadedBy) {
        String normalized = normalizeOptional(uploadedBy);
        if (normalized == null) {
            return "SYSTEM";
        }
        return normalized.toUpperCase(Locale.ROOT);
    }

    private String normalizeLanguage(String language) {
        String normalized = normalizeOptional(language);
        if (normalized == null) {
            return "en";
        }
        return normalized.toLowerCase(Locale.ROOT);
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

    private String normalizeUrl(String url) {
        return normalizeRequired(url, "sourceUrl");
    }

    private String normalizeOptionalUrl(String url) {
        return normalizeOptional(url);
    }

    private String resolveDomain(String domain, String sourceUrl) {
        String normalizedDomain = normalizeOptional(domain);
        if (normalizedDomain != null) {
            return normalizedDomain.toLowerCase(Locale.ROOT);
        }
        try {
            URI uri = new URI(sourceUrl);
            String host = uri.getHost();
            if (host == null) {
                return null;
            }
            return host.startsWith("www.") ? host.substring(4).toLowerCase(Locale.ROOT) : host.toLowerCase(Locale.ROOT);
        } catch (URISyntaxException ex) {
            return null;
        }
    }

    private String normalizeCategoryScope(String categoryScope) {
        String normalized = normalizeOptional(categoryScope);
        if (normalized == null) {
            return null;
        }
        List<String> values = Arrays.stream(normalized.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> value.toUpperCase(Locale.ROOT))
                .peek(value -> NewsCategory.valueOf(value))
                .distinct()
                .collect(Collectors.toList());
        return values.isEmpty() ? null : String.join(",", values);
    }
}
