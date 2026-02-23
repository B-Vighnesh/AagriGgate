package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.service.BuyerService;
import com.MyWebpage.register.login.service.FarmerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class BuyerServiceImpl implements BuyerService {

    private static final Logger logger = LoggerFactory.getLogger(BuyerServiceImpl.class);

    private final FarmerService farmerService;

    public BuyerServiceImpl(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @Override
    public ResponseEntity<Farmer> register(Farmer buyer) {
        logger.info("Buyer registration requested for email: {}", buyer.getEmail());
        return farmerService.register(buyer);
    }

    @Override
    public AuthResponseDTO verify(Farmer buyer) {
        logger.info("Buyer login requested for principal: {}", buyer.getUsername());
        return farmerService.verify(buyer);
    }

    @Override
    public ResponseEntity<String> resetPassword(String email, String newPassword) {
        return farmerService.resetPassword(email, newPassword);
    }

    @Override
    public Farmer find(Long farmerId) {
        return farmerService.find(farmerId);
    }

    @Override
    public Farmer update(Farmer buyer) {
        return farmerService.update(buyer);
    }

    @Override
    public ResponseEntity<String> delete(String password, Long farmerId) {
        return farmerService.delete(password, farmerId);
    }

    @Override
    public ResponseEntity<String> changePassword(String email, Long farmerId, String currentPassword, String newPassword) {
        return farmerService.changePassword(email, farmerId, currentPassword, newPassword);
    }
}
