package com.MyWebpage.register.login.market.saved;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SavedMarketRepository extends JpaRepository<SavedMarket, Long> {

    Page<SavedMarket> findByUserId(Long userId, Pageable pageable);

    Optional<SavedMarket> findByIdAndUserId(Long id, Long userId);

    Optional<SavedMarket> findByUserIdAndMarket_Id(Long userId, Long marketId);

    @Query("select distinct s.userId from SavedMarket s where s.market.id = :marketId")
    List<Long> findDistinctUserIdsByMarketId(Long marketId);

    long deleteByUserId(Long userId);
}
