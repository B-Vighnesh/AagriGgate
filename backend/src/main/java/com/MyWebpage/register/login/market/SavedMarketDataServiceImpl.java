package com.MyWebpage.register.login.market;

import com.MyWebpage.register.login.farmer.FarmerRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class SavedMarketDataServiceImpl implements SavedMarketDataService {

    private static final Logger logger = LoggerFactory.getLogger(SavedMarketDataServiceImpl.class);

    private final SavedMarketDataRepository repository;
    private final FarmerRepo farmerRepo;

    public SavedMarketDataServiceImpl(SavedMarketDataRepository repository, FarmerRepo farmerRepo) {
        this.repository = repository;
        this.farmerRepo = farmerRepo;
    }

    @Override
    public SavedMarketData save(String farmerId, SavedMarketData data) {
        if (farmerRepo.findById(Long.parseLong(farmerId)).isEmpty()) {
            throw new RuntimeException("Farmer not found");
        }
        data.setFarmerId(farmerId);
        SavedMarketData saved = repository.save(data);
        logger.info("Saved market data created: {}", saved.getId());
        return saved;
    }

    @Override
    public Page<SavedMarketData> getAll(String farmerId, int page, int size) {
        return repository.findByFarmerId(farmerId, PageRequest.of(page, size));
    }

    @Override
    public void delete(String farmerId, Long id) {
        SavedMarketData savedMarketData = repository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new RuntimeException("Saved market data not found"));
        repository.delete(savedMarketData);
        logger.info("Saved market data deleted: {}", id);
    }
}
