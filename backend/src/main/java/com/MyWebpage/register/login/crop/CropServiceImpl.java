package com.MyWebpage.register.login.crop;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.HttpStatus;

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
    public Crop addCropV1(Long farmerId, Crop crop, MultipartFile imageFile) throws IOException {
        Farmer farmer = farmerRepo.findByFarmerId(farmerId);
        if (farmer == null) {
            throw new ResourceNotFoundException("Farmer not found with ID: " + farmerId);
        }
        crop.setFarmer(farmer);
        crop.setPostDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        normalizeCropFlags(crop);
        applyImage(crop, imageFile);
        logger.info("[v1] Adding crop {}", crop.getCropName());
        return cropRepo.save(crop);
    }

    @Override
    public Crop updateCropV1(Long farmerId, Long cropId, Crop crop, MultipartFile imageFile) throws IOException {
        Crop existing = requireOwnedCrop(cropId, farmerId);
        crop.setCropID(cropId);
        crop.setFarmer(existing.getFarmer());
        crop.setPostDate(existing.getPostDate());
        if (imageFile != null && !imageFile.isEmpty()) {
            applyImage(crop, imageFile);
        } else {
            crop.setImageData(existing.getImageData());
            crop.setImageName(existing.getImageName());
            crop.setImageType(existing.getImageType());
        }
        normalizeCropFlags(crop);
        logger.info("[v1] Updating crop {}", cropId);
        return cropRepo.save(crop);
    }

    @Override
    public Page<CropViewDTO> getAllCropsV1(Long currentUserId, int page, int size, String keyword, String region, String category, Double maxPrice, String farmerName, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, Boolean discountOnly, String sortBy) {
        return cropRepo.findFilteredCropViews(
                currentUserId,
                null,
                normalizeFilter(keyword),
                normalizeFilter(region),
                normalizeFilter(category),
                maxPrice,
                normalizeFilter(farmerName),
                normalizeBooleanFilter(urgentOnly),
                normalizeBooleanFilter(wasteOnly),
                normalizeBooleanFilter(normalOnly),
                normalizeBooleanFilter(discountOnly),
                buildPageRequest(page, size, sortBy)
        );
    }

    @Override
    public Page<CropViewDTO> getCropsByFarmerIdV1(Long currentUserId, Long farmerId, int page, int size, String keyword, String region, String category, Double maxPrice, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, Boolean discountOnly, String sortBy) {
        return cropRepo.findFilteredCropViews(
                currentUserId,
                farmerId,
                normalizeFilter(keyword),
                normalizeFilter(region),
                normalizeFilter(category),
                maxPrice,
                null,
                normalizeBooleanFilter(urgentOnly),
                normalizeBooleanFilter(wasteOnly),
                normalizeBooleanFilter(normalOnly),
                normalizeBooleanFilter(discountOnly),
                buildPageRequest(page, size, sortBy)
        );
    }

    @Override
    public CropViewDTO getCropByCropIdV1(Long currentUserId, Long cropId) {
        CropViewDTO crop = cropRepo.findCropViewById(cropId, currentUserId);
        if (crop == null) {
            throw new ResourceNotFoundException("Crop not found with ID: " + cropId);
        }
        return crop;
    }

    @Override
    public Crop getCropEntityById(Long cropId) {
        return cropRepo.findById(cropId).orElse(null);
    }

    @Override
    public void deleteCropByIdV1(Long farmerId, Long cropId) {
        requireOwnedCrop(cropId, farmerId);
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
    public CropResponseDTO addCropV2(Long farmerId, CropRequestDTO dto, MultipartFile imageFile) throws IOException {
        Farmer farmer = farmerRepo.findByFarmerId(farmerId);
        if (farmer == null) {
            throw new ResourceNotFoundException("Farmer not found with ID: " + farmerId);
        }

        Crop crop = cropMapper.toEntity(dto);
        crop.setFarmer(farmer);
        crop.setPostDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        normalizeCropFlags(crop);
        applyImage(crop, imageFile);

        logger.info("[v2] Adding crop {} for farmer {}", dto.getCropName(), farmerId);
        return cropMapper.toResponse(cropRepo.save(crop));
    }

    @Override
    public CropResponseDTO updateCropV2(Long farmerId, Long cropId, CropRequestDTO dto, MultipartFile imageFile) throws IOException {
        Crop existing = requireOwnedCrop(cropId, farmerId);

        Crop crop = cropMapper.toEntity(dto);
        crop.setCropID(cropId);
        crop.setFarmer(existing.getFarmer());
        crop.setPostDate(existing.getPostDate());
        if (imageFile != null && !imageFile.isEmpty()) {
            applyImage(crop, imageFile);
        } else {
            crop.setImageData(existing.getImageData());
            crop.setImageName(existing.getImageName());
            crop.setImageType(existing.getImageType());
        }

        normalizeCropFlags(crop);
        logger.info("[v2] Updating crop {}", cropId);
        return cropMapper.toResponse(cropRepo.save(crop));
    }

    @Override
    public Page<CropResponseDTO> getAllCropsV2(int page, int size, String keyword, String region, String category, Double maxPrice, String farmerName, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, Boolean discountOnly, String sortBy) {
        return cropRepo.findFilteredCropResponses(
                        null,
                        normalizeFilter(keyword),
                        normalizeFilter(region),
                        normalizeFilter(category),
                        maxPrice,
                        normalizeFilter(farmerName),
                        normalizeBooleanFilter(urgentOnly),
                        normalizeBooleanFilter(wasteOnly),
                        normalizeBooleanFilter(normalOnly),
                        normalizeBooleanFilter(discountOnly),
                        buildPageRequest(page, size, sortBy)
                );
    }

    @Override
    public Page<CropResponseDTO> getCropsByFarmerIdV2(Long farmerId, int page, int size, String keyword, String region, String category, Double maxPrice, Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly, Boolean discountOnly, String sortBy) {
        return cropRepo.findFilteredCropResponses(
                        farmerId,
                        normalizeFilter(keyword),
                        normalizeFilter(region),
                        normalizeFilter(category),
                        maxPrice,
                        null,
                        normalizeBooleanFilter(urgentOnly),
                        normalizeBooleanFilter(wasteOnly),
                        normalizeBooleanFilter(normalOnly),
                        normalizeBooleanFilter(discountOnly),
                        buildPageRequest(page, size, sortBy)
                );
    }

    @Override
    public CropResponseDTO getCropByCropIdV2(Long cropId) {
        CropResponseDTO crop = cropRepo.findCropResponseById(cropId);
        if (crop == null) {
            throw new ResourceNotFoundException("Crop not found with ID: " + cropId);
        }
        return crop;
    }

    @Override
    public void deleteCropByIdV2(Long farmerId, Long cropId) {
        requireOwnedCrop(cropId, farmerId);
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
        return cropRepo.searchCropResponses(keyword, buildPageRequest(page, size));
    }

    private void applyImage(Crop crop, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            crop.setImageName(imageFile.getOriginalFilename());
            crop.setImageType(imageFile.getContentType());
            crop.setImageData(imageFile.getBytes());
        }
    }

    private Crop requireOwnedCrop(Long cropId, Long farmerId) {
        Crop existing = cropRepo.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + cropId));
        Long ownerId = existing.getFarmer() != null ? existing.getFarmer().getFarmerId() : null;
        if (!farmerId.equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this crop");
        }
        return existing;
    }

    private PageRequest buildPageRequest(int page, int size) {
        return buildPageRequest(page, size, "newest");
    }

    private PageRequest buildPageRequest(int page, int size, String sortBy) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);
        return PageRequest.of(safePage, safeSize, resolveSort(sortBy));
    }

    private String normalizeFilter(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private Boolean normalizeBooleanFilter(Boolean value) {
        return Boolean.TRUE.equals(value) ? Boolean.TRUE : null;
    }

    private void normalizeCropFlags(Crop crop) {
        if (crop.getStatus() == null || crop.getStatus().isBlank()) {
            crop.setStatus("available");
        } else {
            crop.setStatus(crop.getStatus().trim().toLowerCase());
        }
        if (crop.getDiscountPrice() != null && crop.getDiscountPrice() < 0) {
            crop.setDiscountPrice(0.0);
        }
        if (crop.getIsUrgent() == null) {
            crop.setIsUrgent(false);
        }
        if (crop.getIsWaste() == null) {
            crop.setIsWaste(false);
        }
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "cropID");
        }

        return switch (sortBy.trim().toLowerCase()) {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "cropID");
            case "price_low", "price-asc", "price-low" ->
                    Sort.by(Sort.Order.asc("marketPrice"), Sort.Order.desc("cropID"));
            case "price_high", "price-desc", "price-high" ->
                    Sort.by(Sort.Order.desc("marketPrice"), Sort.Order.desc("cropID"));
            default -> Sort.by(Sort.Direction.DESC, "cropID");
        };
    }
}
