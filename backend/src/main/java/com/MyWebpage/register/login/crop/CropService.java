package com.MyWebpage.register.login.crop;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.crop.ImageStorage.ImageResult;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CropService {
        ApiResponse<CropResponseDTO> addCropV1(Long farmerId, CropRequestDTO dto, MultipartFile imageFile) throws IOException;
        ApiResponse<CropResponseDTO> updateCropV1(Long farmerId, Long cropId, UpdateCropRequest dto, MultipartFile imageFile);
        ApiResponse<Page<CropViewDTO>> getAllCropsV1(Long currentUserId, int page, int size, String keyword, String region, String state, String district, String category, Double maxPrice, String farmerName, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, Boolean discountOnly, String sortBy);
        ApiResponse<Page<CropViewDTO>> getCropsByFarmerIdV1(Long currentUserId, Long farmerId, int page, int size, String keyword, String region, String state, String district, String category, Double maxPrice, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, Boolean discountOnly, String sortBy);
        ApiResponse<CropViewDTO> getCropByCropIdV1(Long currentUserId, Long cropId);
        ApiResponse<Void> deleteCropByIdV1(Long farmerId, Long cropId);
        ImageResult getCropThumbnail(Long cropId);
        ImageResult getCropImage(Long cropId);
        void softDeleteCropByFarmerIdV1(Long farmerId);
        void deleteCropByFarmerIdV2(Long farmerId);
        Crop getCropEntityById(Long cropId);

}
