package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.market.SavedMarketData;
import org.springframework.data.domain.Page;

public interface SavedMarketDataService {
    SavedMarketData save(String farmerId, SavedMarketData data);
    Page<SavedMarketData> getAll(String farmerId, int page, int size);
    void delete(String farmerId, Long id);
}
