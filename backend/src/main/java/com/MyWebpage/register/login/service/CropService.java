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
    Crop addCropV1(Crop crop, MultipartFile imageFile) throws IOException;
    Crop updateCropV1(Long cropId, Crop crop, MultipartFile imageFile) throws IOException;
    List<Crop> getAllCropsV1();
    List<Crop> getCropsByFarmerIdV1(Long farmerId);
    Crop getCropByCropIdV1(Long cropId);
    void deleteCropByIdV1(Long cropId);
    void deleteCropByFarmerIdV1(Long farmerId);
    List<Crop> getCropsByNameV1(String cropName);

    // v2 methods (industry-standard DTO contract)
    CropResponseDTO addCropV2(CropRequestDTO cropRequestDTO, MultipartFile imageFile) throws IOException;
    CropResponseDTO updateCropV2(Long cropId, CropRequestDTO cropRequestDTO, MultipartFile imageFile) throws IOException;
    List<CropResponseDTO> getAllCropsV2();
    List<CropResponseDTO> getCropsByFarmerIdV2(Long farmerId);
    CropResponseDTO getCropByCropIdV2(Long cropId);
    void deleteCropByIdV2(Long cropId);
    void deleteCropByFarmerIdV2(Long farmerId);
    Page<CropResponseDTO> searchCropsV2(String keyword, int page, int size);
}
