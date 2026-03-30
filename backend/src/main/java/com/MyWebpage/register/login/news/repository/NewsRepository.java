package com.MyWebpage.register.login.news.repository;

import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface NewsRepository extends JpaRepository<News, Long>, JpaSpecificationExecutor<News> {

    boolean existsBySourceUrl(String sourceUrl);

    boolean existsByTitle(String title);

    boolean existsBySourceUrlOrTitle(String sourceUrl, String title);

    Optional<News> findBySourceUrl(String sourceUrl);

    Optional<News> findByTitle(String title);

    Optional<News> findByIdAndStatus(Long id, NewsStatus status);

    List<News> findByStatusAndIsImportantTrue(NewsStatus status);
}
