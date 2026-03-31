package com.MyWebpage.register.login.news.cache;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class NewsCacheService {

    private final CacheManager cacheManager;

    public NewsCacheService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    public void evictFeedCache() {
        Cache cache = cacheManager.getCache("news-feed");
        if (cache != null) {
            cache.clear();
        }
    }
}
