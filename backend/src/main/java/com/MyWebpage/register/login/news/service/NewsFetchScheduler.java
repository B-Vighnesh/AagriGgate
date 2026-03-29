package com.MyWebpage.register.login.news.service;

import com.MyWebpage.register.login.news.dto.NewsRequest;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.enums.NewsType;
import com.MyWebpage.register.login.news.repository.NewsRepository;
import com.MyWebpage.register.login.news.repository.TrustedSourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;

@Service
public class NewsFetchScheduler {

    private static final Logger logger = LoggerFactory.getLogger(NewsFetchScheduler.class);

    private final TrustedSourceRepository trustedSourceRepository;
    private final NewsRepository newsRepository;
    private final NewsService newsService;

    public NewsFetchScheduler(
            TrustedSourceRepository trustedSourceRepository,
            NewsRepository newsRepository,
            NewsService newsService
    ) {
        this.trustedSourceRepository = trustedSourceRepository;
        this.newsRepository = newsRepository;
        this.newsService = newsService;
    }

    @Scheduled(fixedRate = 21600000)
    public void fetchNewsFromTrustedSources() {
        List<TrustedSource> sources = trustedSourceRepository.findByIsActiveTrue();
        logger.info("News fetch scheduler started for {} active sources", sources.size());
        for (TrustedSource source : sources) {
            try {
                List<NewsRequest> items = fetchFromSource(source);
                for (NewsRequest item : items) {
                    if (item.getSourceUrl() == null || item.getSourceUrl().isBlank()) {
                        continue;
                    }
                    if (newsRepository.existsBySourceUrl(item.getSourceUrl().trim())) {
                        logger.info("Skipping duplicate news for sourceUrl={}", item.getSourceUrl());
                        continue;
                    }
                    item.setNewsType(NewsType.EXTERNAL);
                    newsService.createNews(item, "SOURCE");
                }
            } catch (Exception ex) {
                logger.warn("Failed to fetch news from source id={} url={}", source.getId(), source.getSourceUrl(), ex);
            } finally {
                source.setLastFetchedAt(LocalDateTime.now(ZoneOffset.UTC));
                trustedSourceRepository.save(source);
            }
        }
    }

    private List<NewsRequest> fetchFromSource(TrustedSource source) {
        logger.info("Fetching from: {}", source.getSourceUrl());
        return Collections.emptyList();
    }
}
