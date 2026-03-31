package com.MyWebpage.register.login.news.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
public class NewsExecutorConfig {

    @Bean(destroyMethod = "shutdown")
    public ExecutorService newsExecutorService(NewsApiProperties newsApiProperties) {
        return Executors.newFixedThreadPool(newsApiProperties.getExecutorPoolSize());
    }
}
