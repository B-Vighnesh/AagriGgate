package com.MyWebpage.register.login.news.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class NewsCacheConfig {

    @Bean
    public CacheManager cacheManager(NewsApiProperties newsApiProperties) {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("news-feed");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(newsApiProperties.getCacheTtlSeconds(), TimeUnit.SECONDS)
                .maximumSize(500));
        return cacheManager;
    }
}
