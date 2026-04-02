package com.MyWebpage.register.login.market;

import com.MyWebpage.register.login.farmer.FarmerRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SavedMarketServiceImpl implements SavedMarketService {

    private static final Logger logger = LoggerFactory.getLogger(SavedMarketServiceImpl.class);

    private final SavedMarketRepository savedMarketRepository;
    private final MarketRepository marketRepository;
    private final FarmerRepo farmerRepo;

    public SavedMarketServiceImpl(
            SavedMarketRepository savedMarketRepository,
            MarketRepository marketRepository,
            FarmerRepo farmerRepo
    ) {
        this.savedMarketRepository = savedMarketRepository;
        this.marketRepository = marketRepository;
        this.farmerRepo = farmerRepo;
    }

    @Override
    @Transactional
    public SavedMarketResponse save(Long userId, SaveMarketRequest request) {
        if (request == null || request.getMarketId() == null) {
            throw new IllegalArgumentException("marketId is required");
        }
        if (farmerRepo.findById(userId).isEmpty()) {
            throw new IllegalArgumentException("Farmer not found");
        }

        SavedMarket existing = savedMarketRepository.findByUserIdAndMarket_Id(userId, request.getMarketId()).orElse(null);
        if (existing != null) {
            if (request.getNote() != null && !request.getNote().isBlank()) {
                existing.setNote(request.getNote().trim());
            }
            return SavedMarketResponse.from(existing);
        }

        Market market = marketRepository.findById(request.getMarketId())
                .orElseThrow(() -> new IllegalArgumentException("Market record not found"));

        SavedMarket savedMarket = new SavedMarket();
        savedMarket.setUserId(userId);
        savedMarket.setMarket(market);
        if (request.getNote() != null && !request.getNote().isBlank()) {
            savedMarket.setNote(request.getNote().trim());
        }

        SavedMarket saved = savedMarketRepository.save(savedMarket);
        logger.info("Saved market created: {}", saved.getId());
        return SavedMarketResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SavedMarketResponse> getAll(Long userId, int page, int size) {
        return savedMarketRepository.findByUserId(
                        userId,
                        PageRequest.of(
                                page,
                                size,
                                Sort.by(Sort.Order.desc("savedAt"), Sort.Order.desc("id"))
                        )
                )
                .map(SavedMarketResponse::from);
    }

    @Override
    @Transactional
    public void delete(Long userId, Long id) {
        SavedMarket savedMarket = savedMarketRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Saved market record not found"));
        savedMarketRepository.delete(savedMarket);
        logger.info("Saved market deleted: {}", id);
    }

    @Override
    @Transactional
    public long deleteAll(Long userId) {
        long deleted = savedMarketRepository.deleteByUserId(userId);
        logger.info("Deleted {} saved market rows for user {}", deleted, userId);
        return deleted;
    }
}
