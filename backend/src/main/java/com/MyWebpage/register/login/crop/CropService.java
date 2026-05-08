package com.MyWebpage.register.login.crop;

import com.MyWebpage.register.login.crop.ImageStorage.ImageResult;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CropService {
    // v1 methods (legacy contract retained)
    Crop addCropV1(Long farmerId, Crop crop, MultipartFile imageFile) throws IOException;
    Crop updateCropV1(Long farmerId, Long cropId, Crop crop, MultipartFile imageFile) throws IOException;
    Page<CropViewDTO> getAllCropsV1(Long currentUserId, int page, int size, String keyword, String region, String category, Double maxPrice, String farmerName, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, Boolean discountOnly, String sortBy);
    Page<CropViewDTO> getCropsByFarmerIdV1(Long currentUserId, Long farmerId, int page, int size, String keyword, String region, String category, Double maxPrice, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, Boolean discountOnly, String sortBy);
    CropViewDTO getCropByCropIdV1(Long currentUserId, Long cropId);
    Crop getCropEntityById(Long cropId);
    void deleteCropByIdV1(Long farmerId, Long cropId);

    void softDeleteCropByFarmerIdV1(Long farmerId);

    ImageResult getCropImage(Long cropId);

    void deleteCropByFarmerIdV2(Long farmerId);
}
