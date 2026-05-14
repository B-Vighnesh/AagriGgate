package com.MyWebpage.register.login.crop;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.crop.ImageStorage.ImageResult;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/crops")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    @PostMapping(value = "/farmer/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CropResponseDTO>> addCropV1(
            Authentication authentication,
            @RequestPart("crop") @Valid CropRequestDTO dto,
            @RequestPart(value = "imageFile") MultipartFile imageFile) throws IOException {
        if (imageFile == null || imageFile.isEmpty()) {
            System.out.println("NULL or EMPTY");
            System.out.println("imageFile == null: " + (imageFile == null));
            System.out.println("imageFile.isEmpty(): " + imageFile.isEmpty());
            System.out.println("Size: " + imageFile.getSize());
            System.out.println("Original filename: " + imageFile.getOriginalFilename());
        }
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(cropService.addCropV1(farmerId, dto, imageFile));
    }

    @PutMapping(value = "/farmer/{cropId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CropResponseDTO>> updateCropV1(
            Authentication authentication,
            @PathVariable Long cropId,
            @RequestPart("crop") @Valid UpdateCropRequest dto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.updateCropV1(farmerId, cropId, dto, imageFile));
    }

    @GetMapping("/legacy")
    public ResponseEntity<ApiResponse<Page<CropViewDTO>>> getAllCropsV1(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String farmerName,
            @RequestParam(required = false) Boolean urgentOnly,
            @RequestParam(required = false) Boolean wasteOnly,
            @RequestParam(required = false) Boolean normalOnly,
            @RequestParam(required = false) Boolean discountOnly,
            @RequestParam(defaultValue = "newest") String sortBy) {
        Long currentUserId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.getAllCropsV1(
                currentUserId, page, size, keyword, region, state, district,
                category, maxPrice, farmerName, urgentOnly, wasteOnly,
                normalOnly, discountOnly, sortBy));
    }

    @GetMapping("/farmer/me/legacy")
    public ResponseEntity<ApiResponse<Page<CropViewDTO>>> getMyCropsV1(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean urgentOnly,
            @RequestParam(required = false) Boolean wasteOnly,
            @RequestParam(required = false) Boolean normalOnly,
            @RequestParam(required = false) Boolean discountOnly,
            @RequestParam(defaultValue = "newest") String sortBy) {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.getCropsByFarmerIdV1(
                farmerId, farmerId, page, size, keyword, region, state, district,
                category, maxPrice, urgentOnly, wasteOnly, normalOnly, discountOnly, sortBy));
    }

    @GetMapping("/legacy/{cropId}")
    public ResponseEntity<ApiResponse<CropViewDTO>> getCropByCropIdV1(
            Authentication authentication,
            @PathVariable Long cropId) {
        Long currentUserId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.getCropByCropIdV1(currentUserId, cropId));
    }


    @GetMapping("/legacy/{cropId}/thumbnail")
    public ResponseEntity<byte[]> getCropThumbnail(@PathVariable Long cropId) {
        ImageResult result = cropService.getCropThumbnail(cropId);
        if (result == null || result.getData() == null || result.getData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = result.getType() != null ? result.getType() : "image/jpeg";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(result.getData());
    }

    @GetMapping("/legacy/{cropId}/image")
    public ResponseEntity<byte[]> getCropImage(@PathVariable Long cropId) {
        ImageResult result = cropService.getCropImage(cropId);
        if (result == null || result.getData() == null || result.getData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = result.getType() != null ? result.getType() : "image/jpeg";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(result.getData());
    }

    @DeleteMapping("/legacy/{cropId}")
    public ResponseEntity<ApiResponse<Void>> deleteCropByIdV1(
            @PathVariable Long cropId, Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.deleteCropByIdV1(farmerId, cropId));
    }
}
