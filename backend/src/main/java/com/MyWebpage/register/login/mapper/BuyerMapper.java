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
        farmer.setFirstName(dto.getFirstName());
        farmer.setLastName(dto.getLastName());
        farmer.setPhoneNo(dto.getPhoneNo());
        farmer.setState(dto.getState());
        farmer.setDistrict(dto.getDistrict());

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
                .build();
    }

}
