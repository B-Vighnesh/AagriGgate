package com.MyWebpage.register.login.news.repository;

import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NewsRepository extends JpaRepository<News, Long>, JpaSpecificationExecutor<News> {

    boolean existsBySourceUrlHash(String sourceUrlHash);

    Optional<News> findBySourceUrlHash(String sourceUrlHash);

    Optional<News> findByIdAndStatus(Long id, NewsStatus status);

    List<News> findByStatusAndIsImportantTrue(NewsStatus status);

    @Modifying
    @Query("""
        UPDATE News n
        SET n.status = com.MyWebpage.register.login.news.enums.NewsStatus.ARCHIVED
        WHERE n.status = com.MyWebpage.register.login.news.enums.NewsStatus.ACTIVE
        AND n.isImportant = false
        AND n.createdAt < :cutoff
        """)
    int archiveOldNonImportantNews(@Param("cutoff") LocalDateTime cutoff);
}
