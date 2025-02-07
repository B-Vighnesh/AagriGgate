package com.MyWebpage.register.login.repositor;

import com.MyWebpage.register.login.model.SavedMarketData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedMarketDataRepository extends JpaRepository<SavedMarketData,Long> {
    List<SavedMarketData> findByFarmerId(String farmerId);

}
