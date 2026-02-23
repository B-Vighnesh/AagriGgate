package com.MyWebpage.register.login.repository;

import com.MyWebpage.register.login.model.SavedMarketData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavedMarketDataRepository extends JpaRepository<SavedMarketData,Long> {
    Page<SavedMarketData> findByFarmerId(String farmerId, Pageable pageable);
}
