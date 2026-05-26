package com.MyWebpage.register.login.crop;

import com.MyWebpage.register.login.cart.CartService;
import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.crop.ImageStorage.ImageResult;
import com.MyWebpage.register.login.crop.ImageStorage.ImageStorageService;
import com.MyWebpage.register.login.crop.ImageStorage.ProductionImageStorageService;
import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.approach.ApproachFarmerService;
import com.MyWebpage.register.login.favorite.FavoriteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.HttpStatus;

@Service
@Transactional
public class CropServiceImpl implements CropService {

    private static final Logger logger = LoggerFactory.getLogger(CropServiceImpl.class);
    private final ProductionImageStorageService productionImageStorageService;
    private final CropRepo cropRepo;
    private final FarmerRepo farmerRepo;
    private final ApproachFarmerService approachFarmerService;
    private final FavoriteService favoriteService;
    private final CartService cartService;
    private final CropMapper cropMapper;
    public CropServiceImpl(ProductionImageStorageService productionImageStorageService, CropRepo cropRepo, FarmerRepo farmerRepo, ApproachFarmerService approachFarmerService, FavoriteService favoriteService, CartService cartService, CropMapper cropMapper) {
        this.productionImageStorageService = productionImageStorageService;
        this.cropRepo = cropRepo;
        this.farmerRepo = farmerRepo;
        this.approachFarmerService = approachFarmerService;
        this.favoriteService = favoriteService;
        this.cartService = cartService;
        this.cropMapper = cropMapper;
    }

    @Override
    public ApiResponse<CropResponseDTO> addCropV1(Long farmerId, CropRequestDTO dto, MultipartFile imageFile) {
        Farmer farmer = farmerRepo.findByFarmerId(farmerId);
        if (farmer == null) throw new ResourceNotFoundException("Farmer not found with ID: " + farmerId);

        Crop crop = cropMapper.toEntity(dto);
        crop.setFarmer(farmer);
        crop.setPostDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        normalizeCropFlags(crop);
        clearImageFields(crop);
        ImageResult imageResult = productionImageStorageService.store(imageFile);
        crop.setImageKey(imageResult.getKey());
        System.out.println(imageResult);
        ImageResult thumbResult = productionImageStorageService.storeThumbnail(imageFile);
        crop.setThumbnailKey(thumbResult.getKey());
        crop.setImageName(imageResult.getName());
        crop.setImageType(imageResult.getType());
        Crop saved = cropRepo.save(crop);
        logger.info("[v1] Added crop {} for farmer {}", saved.getCropID(), farmerId);
        return ApiResponse.success("Crop added successfully", cropMapper.toResponse(saved));
    }

    @Override
    public ApiResponse<CropResponseDTO> updateCropV1(Long farmerId, Long cropId, UpdateCropRequest dto, MultipartFile imageFile) {
        Crop existing = requireOwnedCrop(cropId, farmerId);
        existing.setCropName(dto.getCropName());
        existing.setCropType(dto.getCropType());
        existing.setRegion(dto.getRegion());
        existing.setState(dto.getState());
        existing.setDistrict(dto.getDistrict());
        existing.setMarketPrice(dto.getMarketPrice());
        existing.setQuantity(dto.getQuantity());
        existing.setUnit(dto.getUnit());
        existing.setDescription(dto.getDescription());
        existing.setStatus(dto.getStatus());
        existing.setDiscountPrice(dto.getDiscountPrice());
        existing.setUrgent(dto.isUrgent());
        existing.setWaste(dto.isWaste());

        if (imageFile != null && !imageFile.isEmpty()) {
            if (existing.getImageKey() != null) {
                productionImageStorageService.delete(existing.getImageKey());
            }
            if (existing.getThumbnailKey() != null) {
                productionImageStorageService.deleteThumbnail(existing.getThumbnailKey());
            }
            ImageResult result = productionImageStorageService.store(imageFile);
            existing.setImageKey(result.getKey());

            ImageResult thumbResult = productionImageStorageService.storeThumbnail(imageFile);
            existing.setThumbnailKey(thumbResult.getKey());
        }

        Crop saved = cropRepo.save(existing);
        logger.info("[v1] Updated crop {} for farmer {}", cropId, farmerId);
        return ApiResponse.success("Crop updated successfully", cropMapper.toResponse(saved));
    }

    @Override
    public ApiResponse<Page<CropViewDTO>> getAllCropsV1(Long currentUserId, int page, int size,
                                                        String keyword, String region, String state, String district,
                                                        String category, Double maxPrice, String farmerName,
                                                        Boolean urgentOnly, Boolean wasteOnly, Boolean normalOnly,
                                                        Boolean discountOnly, String sortBy) {
        Page<CropViewDTO> result = cropRepo.findAllFilteredCropViews(
                currentUserId,
                normalizeFilter(keyword),
                normalizeFilter(region),
                normalizeFilter(state),
                normalizeFilter(district),
                normalizeFilter(category),
                maxPrice,
                normalizeFilter(farmerName),
                normalizeBooleanFilter(urgentOnly),
                normalizeBooleanFilter(wasteOnly),
                normalizeBooleanFilter(normalOnly),
                normalizeBooleanFilter(discountOnly),
                buildPageRequest(page, size, sortBy)
        );
        return ApiResponse.success("Crops fetched", result);
    }

    @Override
    public ApiResponse<Page<CropViewDTO>> getCropsByFarmerIdV1(Long currentUserId, Long farmerId,
                                                               int page, int size, String keyword, String region, String state, String district,
                                                               String category, Double maxPrice, Boolean urgentOnly, Boolean wasteOnly,
                                                               Boolean normalOnly, Boolean discountOnly, String sortBy) {
        Page<CropViewDTO> result = cropRepo.findFilteredCropViews(
                currentUserId,
                farmerId,
                normalizeFilter(keyword),
                normalizeFilter(region),
                normalizeFilter(state),
                normalizeFilter(district),
                normalizeFilter(category),
                maxPrice,
                null,
                normalizeBooleanFilter(urgentOnly),
                normalizeBooleanFilter(wasteOnly),
                normalizeBooleanFilter(normalOnly),
                normalizeBooleanFilter(discountOnly),
                buildPageRequest(page, size, sortBy)
        );
        return ApiResponse.success("Crops fetched", result);
    }

    @Override
    public ApiResponse<CropViewDTO> getCropByCropIdV1(Long currentUserId, Long cropId) {
        CropViewDTO crop = cropRepo.findCropViewById(cropId, currentUserId);
        if (crop == null) throw new ResourceNotFoundException("Crop not found with ID: " + cropId);
        return ApiResponse.success("Crop fetched", crop);
    }

    @Override
    public ApiResponse<Void> deleteCropByIdV1(Long farmerId, Long cropId) {
        Crop existing=requireOwnedCrop(cropId, farmerId);
        if (existing.getImageKey() != null) {
            productionImageStorageService.delete(existing.getImageKey());
        }
        if (existing.getThumbnailKey() != null) {
            productionImageStorageService.deleteThumbnail(existing.getThumbnailKey());
        }
        approachFarmerService.softDeleteApproachByCropId(cropId);
        favoriteService.removeFavorite(cropId);
        cartService.removeFromCart(cropId);
        cropRepo.softDeleteByIdAndFarmerId(cropId, farmerId, LocalDateTime.now());
        return ApiResponse.success("Crop deleted successfully", null);
    }

    @Override
    public ImageResult getCropThumbnail(Long cropId) {
        List<Object[]> rows = cropRepo.findImageKeysByCropId(cropId);
        if (rows == null || rows.isEmpty()) return null;
        Object[] row = rows.get(0);
        if (row == null || row.length == 0) return null;
        String thumbnailKey = (String) row[1];
        if (thumbnailKey == null || thumbnailKey.isBlank()) {
            String imageKey = (String) row[0];
            if (imageKey == null || imageKey.isBlank()) return null;
            return productionImageStorageService.retrieve(null, null, null, imageKey);
        }
        return productionImageStorageService.retrieveThumbnail(null, null, null, thumbnailKey);
    }

    @Override
    public ImageResult getCropImage(Long cropId) {
        List<Object[]> rows = cropRepo.findImageKeysByCropId(cropId);
        if (rows == null || rows.isEmpty()) return null;

        Object[] row = rows.get(0);
        if (row == null || row.length == 0) return null;

        String imageKey = (String) row[0];
        if (imageKey == null || imageKey.isBlank()) return null;

        return productionImageStorageService.retrieve(null, null, null, imageKey);
    }

    @Override
    public Crop getCropEntityById(Long cropId) {
        return cropRepo.findById(cropId).orElse(null);
    }

    @Override
    public void softDeleteCropByFarmerIdV1(Long farmerId) {
        approachFarmerService.softDeleteApproach(farmerId, "ROLE_SELLER");
        favoriteService.removeFavoritesForFarmerCrops(farmerId);
        cartService.removeCartItemsForFarmerCrops(farmerId);
        cropRepo.softDeleteByFarmerId(farmerId, LocalDateTime.now());
    }

    @Override
    public void deleteCropByFarmerIdV2(Long farmerId) {
        logger.info("[v2] Deleting all crops for farmer {}", farmerId);
        approachFarmerService.softDeleteApproach(farmerId, "ROLE_SELLER");
        favoriteService.removeFavoritesForFarmerCrops(farmerId);
        cartService.removeCartItemsForFarmerCrops(farmerId);
        cropRepo.softDeleteByFarmerId(farmerId, LocalDateTime.now());
    }


    private Crop requireOwnedCrop(Long cropId, Long farmerId) {
        Crop existing = cropRepo.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + cropId));
        if (!existing.isActive() || existing.getDeletedAt() != null || existing.getFarmer() == null || !existing.getFarmer().isActive()) {
            throw new ResourceNotFoundException("Crop not found with ID: " + cropId);
        }
        Long ownerId = existing.getFarmer() != null ? existing.getFarmer().getFarmerId() : null;
        if (!farmerId.equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this crop");
        }
        return existing;
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
        crop.setActive(true);
        crop.setDeletedAt(null);

    }

    private void clearImageFields(Crop crop) {
        crop.setImageData(null);
        crop.setImageName(null);
        crop.setImageType(null);
        crop.setImageKey(null);
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
