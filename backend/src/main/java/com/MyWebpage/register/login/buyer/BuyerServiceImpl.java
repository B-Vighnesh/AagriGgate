package com.MyWebpage.register.login.buyer;

import com.MyWebpage.register.login.common.ProfileUpdateValidator;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
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
            buyer.setUsername(ProfileUpdateValidator.normalizeOptionalUsername(request.getUsername()));
        }
        buyer.setFirstName(ProfileUpdateValidator.requirePersonName(request.getFirstName(), "firstName"));
        buyer.setLastName(ProfileUpdateValidator.normalizeOptionalPersonName(request.getLastName(), "lastName"));
        buyer.setPhoneNo(ProfileUpdateValidator.requirePhone(request.getPhoneNo()));
        buyer.setState(ProfileUpdateValidator.requireState(request.getState()));
        buyer.setDistrict(ProfileUpdateValidator.requireDistrict(request.getDistrict()));
        buyer.setDob(ProfileUpdateValidator.requireAdultDob(request.getDob()));
        buyer.setAadharNo(ProfileUpdateValidator.requireAadhar(request.getAadharNo()));

        farmerRepository.save(buyer);
        return buyerMapper.toDTO(buyer);
    }

    
}
