package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.CropRequestDTO;
import com.MyWebpage.register.login.dto.CropResponseDTO;
import com.MyWebpage.register.login.model.Crop;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CropService {
    // v1 methods (legacy contract retained)
    Crop addCropV1(Long farmerId, Crop crop, MultipartFile imageFile) throws IOException;
    Crop updateCropV1(Long farmerId, Long cropId, Crop crop, MultipartFile imageFile) throws IOException;
    Page<Crop> getAllCropsV1(int page, int size);
    List<Crop> getCropsByFarmerIdV1(Long farmerId);
    Crop getCropByCropIdV1(Long cropId);
    void deleteCropByIdV1(Long farmerId, Long cropId);
    void deleteCropByFarmerIdV1(Long farmerId);
    List<Crop> getCropsByNameV1(String cropName);

    // v2 methods (industry-standard DTO contract)
    CropResponseDTO addCropV2(Long farmerId, CropRequestDTO cropRequestDTO, MultipartFile imageFile) throws IOException;
    CropResponseDTO updateCropV2(Long farmerId, Long cropId, CropRequestDTO cropRequestDTO, MultipartFile imageFile) throws IOException;
    Page<CropResponseDTO> getAllCropsV2(int page, int size);
    List<CropResponseDTO> getCropsByFarmerIdV2(Long farmerId);
    CropResponseDTO getCropByCropIdV2(Long cropId);
    void deleteCropByIdV2(Long farmerId, Long cropId);
    void deleteCropByFarmerIdV2(Long farmerId);
    Page<CropResponseDTO> searchCropsV2(String keyword, int page, int size);
}
