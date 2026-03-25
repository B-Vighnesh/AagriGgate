package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.dto.CropRequestDTO;
import com.MyWebpage.register.login.dto.CropResponseDTO;
import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.mapper.CropMapper;
import com.MyWebpage.register.login.model.Crop;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.CropRepo;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.service.CropService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CropServiceImpl implements CropService {

    private static final Logger logger = LoggerFactory.getLogger(CropServiceImpl.class);

    private final CropRepo cropRepo;
    private final FarmerRepo farmerRepo;
    private final CropMapper cropMapper;

    public CropServiceImpl(CropRepo cropRepo, FarmerRepo farmerRepo, CropMapper cropMapper) {
        this.cropRepo = cropRepo;
        this.farmerRepo = farmerRepo;
        this.cropMapper = cropMapper;
    }

    @Override
    public Crop addCropV1(Crop crop, MultipartFile imageFile) throws IOException {
        Farmer farmer = farmerRepo.findByFarmerId(crop.getFarmer().getFarmerId());
        if (farmer == null) {
            throw new ResourceNotFoundException("Farmer not found with ID: " + crop.getFarmer().getFarmerId());
        }
        crop.setFarmer(farmer);
        crop.setPostDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        applyImage(crop, imageFile);
        logger.info("[v1] Adding crop {}", crop.getCropName());
        return cropRepo.save(crop);
    }

    @Override
    public Crop updateCropV1(Long cropId, Crop crop, MultipartFile imageFile) throws IOException {
        Crop existing = cropRepo.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + cropId));
        crop.setCropID(cropId);
        crop.setPostDate(existing.getPostDate());
        if (imageFile != null && !imageFile.isEmpty()) {
            applyImage(crop, imageFile);
        } else {
            crop.setImageData(existing.getImageData());
            crop.setImageName(existing.getImageName());
            crop.setImageType(existing.getImageType());
        }
        logger.info("[v1] Updating crop {}", cropId);
        return cropRepo.save(crop);
    }

    @Override
    public Page<Crop> getAllCropsV1(int page, int size) {
        return cropRepo.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "cropID")));
    }

    @Override
    public List<Crop> getCropsByFarmerIdV1(Long farmerId) {
        return cropRepo.findByFarmerId(farmerId);
    }

    @Override
    public Crop getCropByCropIdV1(Long cropId) {
        return cropRepo.findById(cropId).orElse(new Crop());
    }

    @Override
    public void deleteCropByIdV1(Long cropId) {
        cropRepo.deleteById(cropId);
    }

    @Override
    public void deleteCropByFarmerIdV1(Long farmerId) {
        cropRepo.deleteByFarmerId(farmerId);
    }

    @Override
    public List<Crop> getCropsByNameV1(String cropName) {
        return cropRepo.findByCropName(cropName);
    }

    @Override
    public CropResponseDTO addCropV2(CropRequestDTO dto, MultipartFile imageFile) throws IOException {
        Farmer farmer = farmerRepo.findByFarmerId(dto.getFarmerId());
        if (farmer == null) {
            throw new ResourceNotFoundException("Farmer not found with ID: " + dto.getFarmerId());
        }

        Crop crop = cropMapper.toEntity(dto);
        crop.setFarmer(farmer);
        crop.setPostDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        applyImage(crop, imageFile);

        logger.info("[v2] Adding crop {} for farmer {}", dto.getCropName(), dto.getFarmerId());
        return cropMapper.toResponse(cropRepo.save(crop));
    }

    @Override
    public CropResponseDTO updateCropV2(Long cropId, CropRequestDTO dto, MultipartFile imageFile) throws IOException {
        Crop existing = cropRepo.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + cropId));

        Crop crop = cropMapper.toEntity(dto);
        crop.setCropID(cropId);
        crop.setPostDate(existing.getPostDate());
        if (imageFile != null && !imageFile.isEmpty()) {
            applyImage(crop, imageFile);
        } else {
            crop.setImageData(existing.getImageData());
            crop.setImageName(existing.getImageName());
            crop.setImageType(existing.getImageType());
        }

        logger.info("[v2] Updating crop {}", cropId);
        return cropMapper.toResponse(cropRepo.save(crop));
    }

    @Override
    public Page<CropResponseDTO> getAllCropsV2(int page, int size) {
        return cropRepo.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "cropID")))
                .map(cropMapper::toResponse);
    }

    @Override
    public List<CropResponseDTO> getCropsByFarmerIdV2(Long farmerId) {
        return cropRepo.findByFarmerId(farmerId).stream().map(cropMapper::toResponse).toList();
    }

    @Override
    public CropResponseDTO getCropByCropIdV2(Long cropId) {
        return cropMapper.toResponse(cropRepo.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + cropId)));
    }

    @Override
    public void deleteCropByIdV2(Long cropId) {
        logger.info("[v2] Deleting crop {}", cropId);
        cropRepo.deleteById(cropId);
    }

    @Override
    public void deleteCropByFarmerIdV2(Long farmerId) {
        logger.info("[v2] Deleting all crops for farmer {}", farmerId);
        cropRepo.deleteByFarmerId(farmerId);
    }

    @Override
    public Page<CropResponseDTO> searchCropsV2(String keyword, int page, int size) {
        return cropRepo.findByCropNameContainingIgnoreCase(
                        keyword,
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "cropID"))
                )
                .map(cropMapper::toResponse);
    }

    private void applyImage(Crop crop, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            crop.setImageName(imageFile.getOriginalFilename());
            crop.setImageType(imageFile.getContentType());
            crop.setImageData(imageFile.getBytes());
        }
    }
}
