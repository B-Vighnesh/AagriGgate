package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.dto.FarmerResponseDTO;
import com.MyWebpage.register.login.dto.FarmerUpdateDTO;
import com.MyWebpage.register.login.mapper.FarmerMapper;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.service.FarmerService;
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

        if (dto.getFirstName() != null) {
            existingFarmer.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            existingFarmer.setLastName(dto.getLastName());
        }
        if (dto.getPhoneNo() != null) {
            existingFarmer.setPhoneNo(dto.getPhoneNo());
        }
        if (dto.getState() != null) {
            existingFarmer.setState(dto.getState());
        }
        if (dto.getVillage() != null) {
            existingFarmer.setDistrict(dto.getVillage());
        }

        Farmer savedFarmer = farmerRepo.save(existingFarmer);
        return farmerMapper.toResponse(savedFarmer);
    }

    @Override
    public Farmer find(Long farmerId) {
        return farmerRepo.findByFarmerId(farmerId);
    }
}
