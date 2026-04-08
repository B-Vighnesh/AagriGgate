package com.MyWebpage.register.login.crop;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class CropQueryService {

    private final CropRepo cropRepo;

    public CropQueryService(CropRepo cropRepo) {
        this.cropRepo = cropRepo;
    }

    public Crop requireActiveCrop(Long cropId) {
        Crop crop = cropRepo.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found"));
        if (!isVisible(crop)) {
            throw new ResourceNotFoundException("Crop not found");
        }
        return crop;
    }

    public Crop requireAvailableCropForBuyer(Long cropId, Long buyerId) {
        Crop crop = requireActiveCrop(cropId);
        if (crop.getFarmer() != null && buyerId.equals(crop.getFarmer().getFarmerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot use your own crop");
        }
        if ("sold".equalsIgnoreCase(crop.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This crop is already sold");
        }
        return crop;
    }

    public boolean isVisible(Crop crop) {
        return crop != null
                && crop.isActive()
                && crop.getDeletedAt() == null
                && crop.getFarmer() != null
                && crop.getFarmer().isActive();
    }
}
