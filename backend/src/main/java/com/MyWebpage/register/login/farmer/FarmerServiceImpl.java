package com.MyWebpage.register.login.farmer;

import com.MyWebpage.register.login.common.ProfileUpdateValidator;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class FarmerServiceImpl implements FarmerService {

    private final FarmerRepo farmerRepo;
    private final FarmerMapper farmerMapper;

    public FarmerServiceImpl(FarmerRepo farmerRepo, FarmerMapper farmerMapper) {
        this.farmerRepo = farmerRepo;
        this.farmerMapper = farmerMapper;
    }

    @Override
    public FarmerResponseDTO getProfile(Long farmerId) {
        Farmer farmer = farmerRepo.findById(farmerId).orElseThrow(() -> new RuntimeException("Farmer not found"));
        return farmerMapper.toResponse(farmer);
    }

    @Override
    @Transactional
    public FarmerResponseDTO updateProfile(Long farmerId, FarmerUpdateDTO dto) {
        Farmer existingFarmer = farmerRepo.findById(farmerId).orElseThrow(() -> new RuntimeException("Farmer not found"));

        existingFarmer.setFirstName(ProfileUpdateValidator.requirePersonName(dto.getFirstName(), "firstName"));
        existingFarmer.setLastName(ProfileUpdateValidator.normalizeOptionalPersonName(dto.getLastName(), "lastName"));
        existingFarmer.setPhoneNo(ProfileUpdateValidator.requirePhone(dto.getPhoneNo()));
        existingFarmer.setDob(ProfileUpdateValidator.requireAdultDob(dto.getDob()));
        existingFarmer.setState(ProfileUpdateValidator.requireState(dto.getState()));
        existingFarmer.setDistrict(ProfileUpdateValidator.requireDistrict(dto.getDistrict()));
        existingFarmer.setAadharNo(ProfileUpdateValidator.requireAadhar(dto.getAadharNo()));

        Farmer savedFarmer = farmerRepo.save(existingFarmer);
        return farmerMapper.toResponse(savedFarmer);
    }

    @Override
    public Farmer find(Long farmerId) {
        return farmerRepo.findByFarmerId(farmerId);
    }
}
