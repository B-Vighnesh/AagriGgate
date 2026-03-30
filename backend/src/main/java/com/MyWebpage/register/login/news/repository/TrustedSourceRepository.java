package com.MyWebpage.register.login.news.repository;

import com.MyWebpage.register.login.news.entity.TrustedSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrustedSourceRepository extends JpaRepository<TrustedSource, Long> {

    List<TrustedSource> findByIsActiveTrue();
}
