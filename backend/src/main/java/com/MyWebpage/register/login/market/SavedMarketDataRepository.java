package com.MyWebpage.register.login.market;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedMarketDataRepository extends JpaRepository<SavedMarketData,Long> {
    Page<SavedMarketData> findByFarmerId(String farmerId, Pageable pageable);
    Optional<SavedMarketData> findByIdAndFarmerId(Long id, String farmerId);
}
