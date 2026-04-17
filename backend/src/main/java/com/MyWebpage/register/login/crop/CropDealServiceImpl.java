package com.MyWebpage.register.login.crop;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CropDealServiceImpl implements CropDealService {

    private final CropRepo cropRepo;

    public CropDealServiceImpl(CropRepo cropRepo) {
        this.cropRepo = cropRepo;
    }

    @Override
    public Crop confirmDealQuantity(Long cropId, Double agreedQuantity) {
        Crop crop = cropRepo.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + cropId));
        if (!crop.isActive() || crop.getDeletedAt() != null || crop.getFarmer() == null || !crop.getFarmer().isActive()) {
            throw new ResourceNotFoundException("Crop not found with ID: " + cropId);
        }

        double quantity = agreedQuantity == null ? 0.0 : agreedQuantity;
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agreed quantity must be greater than zero");
        }

        double availableQuantity = crop.getQuantity() == null ? 0.0 : crop.getQuantity();
        if (quantity > availableQuantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agreed quantity exceeds available crop quantity");
        }

        double remaining = Math.max(availableQuantity - quantity, 0.0);
        crop.setQuantity(remaining);
        crop.setStatus(remaining <= 0 ? "sold" : "available");
        return cropRepo.save(crop);
    }
}
