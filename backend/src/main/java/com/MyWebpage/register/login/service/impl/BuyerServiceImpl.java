package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.buyer.BuyerRequestDTO;
import com.MyWebpage.register.login.buyer.BuyerResponseDTO;
import com.MyWebpage.register.login.buyer.BuyerMapper;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.service.BuyerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BuyerServiceImpl implements BuyerService {

    private final FarmerRepo farmerRepository;
    private final BuyerMapper buyerMapper;

    public BuyerServiceImpl(FarmerRepo farmerRepository, BuyerMapper buyerMapper) {
        this.farmerRepository = farmerRepository;
        this.buyerMapper = buyerMapper;
    }

    @Override
    public BuyerResponseDTO getProfile(Long farmerId) {
        Farmer buyer = farmerRepository.findById(farmerId).orElse(null);
        if (buyer == null || !buyer.getRole().equals("BUYER")) {
            throw new RuntimeException("Buyer not found");
        }
        return buyerMapper.toDTO(buyer);
    }

    @Override
    public BuyerResponseDTO updateProfile(Long farmerId, BuyerRequestDTO request) {
        Farmer buyer = farmerRepository.findById(farmerId).orElse(null);
        if (buyer == null || !buyer.getRole().equals("BUYER")) {
            throw new RuntimeException("Buyer not found");
        }

        if (request.getUsername() != null) {
            buyer.setUsername(request.getUsername());
        }
        if (request.getFirstName() != null) {
            buyer.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            buyer.setLastName(request.getLastName());
        }
        if (request.getPhoneNo() != null) {
            buyer.setPhoneNo(request.getPhoneNo());
        }
        if (request.getState() != null) {
            buyer.setState(request.getState());
        }
        if (request.getDistrict() != null) {
            buyer.setDistrict(request.getDistrict());
        }

        farmerRepository.save(buyer);
        return buyerMapper.toDTO(buyer);
    }

    @Override
    public void deleteProfile(Long farmerId) {
        Farmer buyer = farmerRepository.findById(farmerId).orElse(null);
        if (buyer == null || !buyer.getRole().equals("BUYER")) {
            throw new RuntimeException("Buyer not found");
        }
        farmerRepository.delete(buyer);
    }
}
