package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.news.dto.NewsResponse;
import com.MyWebpage.register.login.news.dto.SavedNewsResponse;
import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.entity.SavedNews;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.repository.NewsRepository;
import com.MyWebpage.register.login.news.repository.SavedNewsRepository;
import jakarta.persistence.criteria.Join;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class SavedNewsServiceImpl implements SavedNewsService {

    private final SavedNewsRepository savedNewsRepository;
    private final NewsRepository newsRepository;

    public SavedNewsServiceImpl(SavedNewsRepository savedNewsRepository, NewsRepository newsRepository) {
        this.savedNewsRepository = savedNewsRepository;
        this.newsRepository = newsRepository;
    }

    @Override
    @Transactional
    public void saveNews(Long userId, Long newsId) {
        if (savedNewsRepository.existsByUserIdAndNews_Id(userId, newsId)) {
            return;
        }
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with ID: " + newsId));
        if (news.getStatus() != NewsStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active news can be saved");
        }
        SavedNews savedNews = new SavedNews();
        savedNews.setUserId(userId);
        savedNews.setNews(news);
        savedNewsRepository.save(savedNews);
    }

    @Override
    @Transactional
    public void unsaveNews(Long userId, Long newsId) {
        savedNewsRepository.deleteByUserIdAndNews_Id(userId, newsId);
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<SavedNewsResponse> getSavedNews(Long userId, NewsCategory category, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? 10 : Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<SavedNews> specification = (root, query, cb) -> {
            Join<SavedNews, News> newsJoin = root.join("news");
            Specification<SavedNews> spec = Specification.<SavedNews>where((r, q, c) -> c.equal(r.get("userId"), userId))
                    .and((r, q, c) -> c.equal(newsJoin.get("status"), NewsStatus.ACTIVE));
            if (category != null) {
                spec = spec.and((r, q, c) -> c.equal(newsJoin.get("category"), category));
            }
            if (keyword != null && !keyword.isBlank()) {
                String likeValue = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
                spec = spec.and((r, q, c) -> c.or(
                        c.like(c.lower(newsJoin.get("title")), likeValue),
                        c.like(c.lower(newsJoin.get("summary")), likeValue),
                        c.like(c.lower(c.coalesce(newsJoin.get("sourceName").as(String.class), "")), likeValue)
                ));
            }
            return spec.toPredicate(root, query, cb);
        };

        return savedNewsRepository.findAll(specification, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public boolean isSaved(Long userId, Long newsId) {
        return savedNewsRepository.existsByUserIdAndNews_Id(userId, newsId);
    }

    private SavedNewsResponse toResponse(SavedNews savedNews) {
        News news = savedNews.getNews();
        NewsResponse newsResponse = new NewsResponse();
        newsResponse.setId(news.getId());
        newsResponse.setTitle(news.getTitle());
        newsResponse.setSummary(news.getSummary());
        newsResponse.setSourceName(news.getSourceName());
        newsResponse.setSourceUrl(news.getSourceUrl());
        newsResponse.setImageUrl(news.getImageUrl());
        newsResponse.setCategory(news.getCategory());
        newsResponse.setNewsType(news.getNewsType());
        newsResponse.setLanguage(news.getLanguage());
        newsResponse.setIsImportant(news.getIsImportant());
        newsResponse.setUploadedBy(news.getUploadedBy());
        newsResponse.setStatus(news.getStatus());
        newsResponse.setCreatedAt(news.getCreatedAt());
        newsResponse.setUpdatedAt(news.getUpdatedAt());
        newsResponse.setIsSaved(true);

        SavedNewsResponse response = new SavedNewsResponse();
        response.setId(savedNews.getId());
        response.setNews(newsResponse);
        response.setSavedAt(savedNews.getCreatedAt());
        return response;
    }
}
