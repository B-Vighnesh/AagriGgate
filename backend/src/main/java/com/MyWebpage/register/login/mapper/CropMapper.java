package com.MyWebpage.register.login.mapper;

import com.MyWebpage.register.login.dto.CropRequestDTO;
import com.MyWebpage.register.login.dto.CropResponseDTO;
import com.MyWebpage.register.login.dto.CropViewDTO;
import com.MyWebpage.register.login.model.Crop;
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
        crop.setIsUrgent(dto.getIsUrgent());
        crop.setIsWaste(dto.getIsWaste());
        crop.setDiscountPrice(dto.getDiscountPrice());
        crop.setStatus(dto.getStatus());
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
        dto.setFarmerName(buildFarmerName(crop));
        dto.setIsUrgent(crop.getIsUrgent());
        dto.setIsWaste(crop.getIsWaste());
        dto.setDiscountPrice(crop.getDiscountPrice());
        dto.setStatus(crop.getStatus());
        return dto;
    }

    public CropViewDTO toViewResponse(Crop crop, Long currentUserId) {
        CropViewDTO dto = new CropViewDTO();
        dto.setCropID(crop.getCropID());
        dto.setCropName(crop.getCropName());
        dto.setCropType(crop.getCropType());
        dto.setRegion(crop.getRegion());
        dto.setMarketPrice(crop.getMarketPrice());
        dto.setQuantity(crop.getQuantity());
        dto.setUnit(crop.getUnit());
        dto.setDescription(crop.getDescription());
        dto.setPostDate(crop.getPostDate());
        dto.setFarmerName(buildFarmerName(crop));
        Long ownerId = crop.getFarmer() != null ? crop.getFarmer().getFarmerId() : null;
        dto.setOwnedByCurrentUser(currentUserId != null && currentUserId.equals(ownerId));
        dto.setIsUrgent(crop.getIsUrgent());
        dto.setIsWaste(crop.getIsWaste());
        dto.setDiscountPrice(crop.getDiscountPrice());
        dto.setStatus(crop.getStatus());
        return dto;
    }

    private String buildFarmerName(Crop crop) {
        if (crop.getFarmer() == null) {
            return null;
        }
        String firstName = crop.getFarmer().getFirstName() == null ? "" : crop.getFarmer().getFirstName().trim();
        String lastName = crop.getFarmer().getLastName() == null ? "" : crop.getFarmer().getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        if (!fullName.isBlank()) {
            return fullName;
        }
        return crop.getFarmer().getUsername();
    }
}
