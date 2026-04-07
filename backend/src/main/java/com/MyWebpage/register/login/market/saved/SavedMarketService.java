package com.MyWebpage.register.login.market.saved;

import org.springframework.data.domain.Page;

public interface SavedMarketService {

    SavedMarketResponse save(Long userId, SaveMarketRequest request);

    Page<SavedMarketResponse> getAll(Long userId, int page, int size);

    void delete(Long userId, Long id);

    long deleteAll(Long userId);
}
