package com.MyWebpage.register.login.news.repository;

import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long>, JpaSpecificationExecutor<News> {
    boolean existsBySourceUrl(String sourceUrl);
    boolean existsByTitle(String title);
    List<News> findByStatusAndIsImportant(NewsStatus status, Boolean isImportant);
}
