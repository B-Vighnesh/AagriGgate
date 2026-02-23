package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.model.SavedMarketData;
import com.MyWebpage.register.login.repository.SavedMarketDataRepository;
import com.MyWebpage.register.login.service.SavedMarketDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class SavedMarketDataServiceImpl implements SavedMarketDataService {

    private static final Logger logger = LoggerFactory.getLogger(SavedMarketDataServiceImpl.class);

    private final SavedMarketDataRepository repository;

    public SavedMarketDataServiceImpl(SavedMarketDataRepository repository) {
        this.repository = repository;
    }

    @Override
    public SavedMarketData save(SavedMarketData data) {
        SavedMarketData saved = repository.save(data);
        logger.info("Saved market data created: {}", saved.getId());
        return saved;
    }

    @Override
    public Page<SavedMarketData> getAll(String farmerId, int page, int size) {
        return repository.findByFarmerId(farmerId, PageRequest.of(page, size));
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
        logger.info("Saved market data deleted: {}", id);
    }
}
