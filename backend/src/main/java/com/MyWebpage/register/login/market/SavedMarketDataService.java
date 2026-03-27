package com.MyWebpage.register.login.market;

import org.springframework.data.domain.Page;

public interface SavedMarketDataService {
    SavedMarketData save(String farmerId, SavedMarketData data);
    Page<SavedMarketData> getAll(String farmerId, int page, int size);
    void delete(String farmerId, Long id);
}
