package com.MyWebpage.register.login.mapper;

import com.MyWebpage.register.login.dto.BuyerRequestDTO;
import com.MyWebpage.register.login.dto.BuyerResponseDTO;
import com.MyWebpage.register.login.model.Farmer;
import org.springframework.stereotype.Component;

@Component
public class BuyerMapper {

    public Farmer toEntity(BuyerRequestDTO dto) {

        Farmer farmer = new Farmer();

        farmer.setUsername(dto.getUsername());
        farmer.setEmail(dto.getEmail());
        farmer.setPhoneNo(dto.getPhoneNo());
        farmer.setDistrict(dto.getDistrict());

        return farmer;
    }

    public BuyerResponseDTO toDTO(Farmer farmer) {

        return BuyerResponseDTO.builder()
                .buyerId(farmer.getFarmerId())
                .username(farmer.getUsername())
                .email(farmer.getEmail())
                .phoneNo(farmer.getPhoneNo())
                .district(farmer.getDistrict())
                .build();
    }

}