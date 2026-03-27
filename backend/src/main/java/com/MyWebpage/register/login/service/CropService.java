package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.CropRequestDTO;
import com.MyWebpage.register.login.dto.CropResponseDTO;
import com.MyWebpage.register.login.dto.CropViewDTO;
import com.MyWebpage.register.login.model.Crop;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CropService {
    // v1 methods (legacy contract retained)
    Crop addCropV1(Long farmerId, Crop crop, MultipartFile imageFile) throws IOException;
    Crop updateCropV1(Long farmerId, Long cropId, Crop crop, MultipartFile imageFile) throws IOException;
    Page<CropViewDTO> getAllCropsV1(Long currentUserId, int page, int size, String keyword, String region, String category, Double maxPrice, String farmerName, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, String sortBy);
    Page<CropViewDTO> getCropsByFarmerIdV1(Long currentUserId, Long farmerId, int page, int size, String keyword, String region, String category, Double maxPrice, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, String sortBy);
    CropViewDTO getCropByCropIdV1(Long currentUserId, Long cropId);
    Crop getCropEntityById(Long cropId);
    void deleteCropByIdV1(Long farmerId, Long cropId);
    void deleteCropByFarmerIdV1(Long farmerId);
    List<Crop> getCropsByNameV1(String cropName);

    // v2 methods (industry-standard DTO contract)
    CropResponseDTO addCropV2(Long farmerId, CropRequestDTO cropRequestDTO, MultipartFile imageFile) throws IOException;
    CropResponseDTO updateCropV2(Long farmerId, Long cropId, CropRequestDTO cropRequestDTO, MultipartFile imageFile) throws IOException;
    Page<CropResponseDTO> getAllCropsV2(int page, int size, String keyword, String region, String category, Double maxPrice, String farmerName, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, String sortBy);
    Page<CropResponseDTO> getCropsByFarmerIdV2(Long farmerId, int page, int size, String keyword, String region, String category, Double maxPrice, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, String sortBy);
    CropResponseDTO getCropByCropIdV2(Long cropId);
    void deleteCropByIdV2(Long farmerId, Long cropId);
    void deleteCropByFarmerIdV2(Long farmerId);
    Page<CropResponseDTO> searchCropsV2(String keyword, int page, int size);
}
