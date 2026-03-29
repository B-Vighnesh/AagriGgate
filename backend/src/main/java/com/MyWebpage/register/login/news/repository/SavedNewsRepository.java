package com.MyWebpage.register.login.news.repository;

import com.MyWebpage.register.login.news.entity.SavedNews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedNewsRepository extends JpaRepository<SavedNews, Long>, JpaSpecificationExecutor<SavedNews> {
    Optional<SavedNews> findByUserIdAndNews_Id(Long userId, Long newsId);
    Page<SavedNews> findByUserId(Long userId, Pageable pageable);
    boolean existsByUserIdAndNews_Id(Long userId, Long newsId);
    void deleteByUserIdAndNews_Id(Long userId, Long newsId);
}
