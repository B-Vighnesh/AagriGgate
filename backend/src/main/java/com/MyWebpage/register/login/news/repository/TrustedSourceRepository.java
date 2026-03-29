package com.MyWebpage.register.login.news.repository;

import com.MyWebpage.register.login.news.entity.TrustedSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrustedSourceRepository extends JpaRepository<TrustedSource, Long> {
    List<TrustedSource> findByIsActiveTrue();
}
