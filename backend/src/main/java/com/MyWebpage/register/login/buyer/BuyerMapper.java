package com.MyWebpage.register.login.buyer;

import com.MyWebpage.register.login.farmer.Farmer;
import org.springframework.stereotype.Component;

@Component
public class BuyerMapper {

    public Farmer toEntity(BuyerRequestDTO dto) {

        Farmer farmer = new Farmer();

        farmer.setUsername(dto.getUsername());
        farmer.setEmail(dto.getEmail());
        farmer.setFirstName(dto.getFirstName());
        farmer.setLastName(dto.getLastName());
        farmer.setPhoneNo(dto.getPhoneNo());
        farmer.setState(dto.getState());
        farmer.setDistrict(dto.getDistrict());
        farmer.setDob(dto.getDob());
        farmer.setAadharNo(dto.getAadharNo());
        return farmer;
    }

    public BuyerResponseDTO toDTO(Farmer farmer) {

        return BuyerResponseDTO.builder()
                .buyerId(farmer.getFarmerId())
                .username(farmer.getUsername())
                .email(farmer.getEmail())
                .firstName(farmer.getFirstName())
                .lastName(farmer.getLastName())
                .phoneNo(farmer.getPhoneNo())
                .state(farmer.getState())
                .district(farmer.getDistrict())
                .dob(farmer.getDob())
                .aadharNo(farmer.getAadharNo())
                .build();
    }

}
