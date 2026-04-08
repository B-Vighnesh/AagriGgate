package com.MyWebpage.register.login.farmer;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FarmerQueryService {

    private final FarmerRepo farmerRepo;

    public FarmerQueryService(FarmerRepo farmerRepo) {
        this.farmerRepo = farmerRepo;
    }

    public Farmer requireActiveFarmer(Long farmerId) {
        Farmer farmer = farmerRepo.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + farmerId));
        if (!farmer.isActive()) {
            throw new RuntimeException("User not found with ID: " + farmerId);
        }
        return farmer;
    }

    public Farmer findActiveByEmail(String email) {
        Farmer farmer = farmerRepo.findByEmail(email).orElse(null);
        if (farmer == null || !farmer.isActive()) {
            return null;
        }
        return farmer;
    }
}
