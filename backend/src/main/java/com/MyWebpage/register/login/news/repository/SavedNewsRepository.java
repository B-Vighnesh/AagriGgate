package com.MyWebpage.register.login.news.repository;

import com.MyWebpage.register.login.news.entity.SavedNews;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SavedNewsRepository extends JpaRepository<SavedNews, Long> {

    Optional<SavedNews> findByUserIdAndNews_Id(Long userId, Long newsId);

    boolean existsByUserIdAndNews_Id(Long userId, Long newsId);

    void deleteByUserIdAndNews_Id(Long userId, Long newsId);

    Page<SavedNews> findByUserId(Long userId, Pageable pageable);

    List<SavedNews> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<SavedNews> findByUserIdAndNews_IdIn(Long userId, Collection<Long> newsIds);

    long deleteByUserId(Long userId);
}
