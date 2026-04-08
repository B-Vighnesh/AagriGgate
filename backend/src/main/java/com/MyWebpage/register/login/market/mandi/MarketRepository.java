package com.MyWebpage.register.login.market.mandi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MarketRepository extends JpaRepository<Market, Long>, JpaSpecificationExecutor<Market>, MarketBatchRepository {
}
