package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.dto.BuyerRequestDTO;
import com.MyWebpage.register.login.dto.BuyerResponseDTO;
import com.MyWebpage.register.login.mapper.BuyerMapper;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.service.BuyerService;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BuyerServiceImpl implements BuyerService {

    private final FarmerRepo farmerRepository;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    private final BuyerMapper buyerMapper;

    public BuyerServiceImpl(FarmerRepo farmerRepository,
                            BCryptPasswordEncoder bCryptPasswordEncoder,
                            BuyerMapper buyerMapper) {

        this.farmerRepository = farmerRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.buyerMapper = buyerMapper;
    }

    @Override
    public BuyerResponseDTO register(BuyerRequestDTO request) {

        if (farmerRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException("Email already exists");
        }

        Farmer buyer = buyerMapper.toEntity(request);

        buyer.setPassword(
                bCryptPasswordEncoder.encode(request.getPassword())
        );

        buyer.setRole("BUYER");

        farmerRepository.save(buyer);

        return buyerMapper.toDTO(buyer);
    }

    @Override
    public BuyerResponseDTO getById(Long buyerId) {

        Farmer buyer = farmerRepository
                .findById(buyerId)
                .orElseThrow(() ->
                        new RuntimeException("Buyer not found"));

        if (!buyer.getRole().equals("BUYER")) {

            throw new RuntimeException("Invalid buyer");
        }

        return buyerMapper.toDTO(buyer);
    }

    @Override
    public BuyerResponseDTO getCurrentBuyer(Long farmerId) {
        Farmer buyer = farmerRepository
                .findById(farmerId)
                .orElse(null);
        if (buyer == null || !buyer.getRole().equals("BUYER")) {

            throw new RuntimeException("Buyer not found");
        }

        return buyerMapper.toDTO(buyer);
    }

    @Override
    public BuyerResponseDTO updateCurrentBuyer(
            Long farmerId,
            BuyerRequestDTO request) {

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
    public void deleteCurrentBuyer(Long farmerId) {
        Farmer buyer = farmerRepository
                .findById(farmerId)
                .orElse(null);

        if (buyer == null || !buyer.getRole().equals("BUYER")) {

            throw new RuntimeException("Buyer not found");
        }

        farmerRepository.delete(buyer);
    }

}
