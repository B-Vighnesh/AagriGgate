package com.MyWebpage.register.login.mapper;

import com.MyWebpage.register.login.dto.CropRequestDTO;
import com.MyWebpage.register.login.dto.CropResponseDTO;
import com.MyWebpage.register.login.model.Crop;
import com.MyWebpage.register.login.model.Farmer;
import org.springframework.stereotype.Component;

@Component
public class CropMapper {
    public Crop toEntity(CropRequestDTO dto) {
        Crop crop = new Crop();
        crop.setCropName(dto.getCropName());
        crop.setCropType(dto.getCropType());
        crop.setRegion(dto.getRegion());
        crop.setMarketPrice(dto.getMarketPrice());
        crop.setQuantity(dto.getQuantity());
        crop.setUnit(dto.getUnit());
        crop.setDescription(dto.getDescription());
        Farmer farmer = new Farmer();
        farmer.setFarmerId(dto.getFarmerId());
        crop.setFarmer(farmer);
        return crop;
    }

    public CropResponseDTO toResponse(Crop crop) {
        CropResponseDTO dto = new CropResponseDTO();
        dto.setCropId(crop.getCropID());
        dto.setCropName(crop.getCropName());
        dto.setCropType(crop.getCropType());
        dto.setRegion(crop.getRegion());
        dto.setMarketPrice(crop.getMarketPrice());
        dto.setQuantity(crop.getQuantity());
        dto.setUnit(crop.getUnit());
        dto.setDescription(crop.getDescription());
        dto.setPostDate(crop.getPostDate());
        dto.setFarmerId(crop.getFarmer() != null ? crop.getFarmer().getFarmerId() : null);
        return dto;
    }
}
