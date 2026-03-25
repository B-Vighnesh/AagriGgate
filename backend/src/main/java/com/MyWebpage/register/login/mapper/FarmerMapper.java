package com.MyWebpage.register.login.mapper;

import com.MyWebpage.register.login.dto.FarmerResponseDTO;
import com.MyWebpage.register.login.model.Farmer;
import org.springframework.stereotype.Component;

@Component
public class FarmerMapper {
    public FarmerResponseDTO toResponse(Farmer farmer) {
        FarmerResponseDTO dto = new FarmerResponseDTO();
        dto.setFarmerId(farmer.getFarmerId());
        dto.setUsername(farmer.getUsername());
        dto.setFirstName(farmer.getFirstName());
        dto.setLastName(farmer.getLastName());
        dto.setEmail(farmer.getEmail());
        dto.setPhoneNo(farmer.getPhoneNo());
        dto.setState(farmer.getState());
        dto.setDistrict(farmer.getDistrict());
        dto.setRole(farmer.getRole());
        dto.setDob(farmer.getDob());
        return dto;
    }
}
