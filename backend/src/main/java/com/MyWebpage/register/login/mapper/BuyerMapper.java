package com.MyWebpage.register.login.mapper;

import com.MyWebpage.register.login.dto.BuyerResponseDTO;
import com.MyWebpage.register.login.model.Farmer;
import org.springframework.stereotype.Component;

@Component
public class BuyerMapper {
    public BuyerResponseDTO toResponse(Farmer buyer) {
        BuyerResponseDTO dto = new BuyerResponseDTO();
        dto.setFarmerId(buyer.getFarmerId());
        dto.setUsername(buyer.getUsername());
        dto.setFirstName(buyer.getFirstName());
        dto.setLastName(buyer.getLastName());
        dto.setEmail(buyer.getEmail());
        dto.setPhoneNo(buyer.getPhoneNo());
        dto.setRole(buyer.getRole());
        return dto;
    }
}
