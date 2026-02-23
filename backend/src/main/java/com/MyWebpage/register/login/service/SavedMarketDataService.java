package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.model.SavedMarketData;
import org.springframework.data.domain.Page;

public interface SavedMarketDataService {
    SavedMarketData save(SavedMarketData data);
    Page<SavedMarketData> getAll(String farmerId, int page, int size);
    void delete(Long id);
}
