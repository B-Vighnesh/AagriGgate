package com.MyWebpage.register.login.crop;

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
    public ResponseEntity<Crop> addCropV1(
            Authentication authentication,
            @RequestPart("crop") Crop crop,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(cropService.addCropV1(farmerId, crop, imageFile));
    }

    @PutMapping(value = "/farmer/{cropId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Crop> updateCropV1(
            Authentication authentication,
            @PathVariable Long cropId,
            @RequestPart("crop") Crop crop,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.updateCropV1(farmerId, cropId, crop, imageFile));
    }

    // Legacy V1 endpoints kept for backward compatibility with older clients.
    @GetMapping("/legacy")
    public ResponseEntity<Page<CropViewDTO>> getAllCropsV1(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String farmerName,
            @RequestParam(required = false) Boolean urgentOnly,
            @RequestParam(required = false) Boolean wasteOnly,
            @RequestParam(required = false) Boolean normalOnly,
            @RequestParam(required = false) Boolean discountOnly,
            @RequestParam(defaultValue = "newest") String sortBy) {
        Long currentUserId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.getAllCropsV1(currentUserId, page, size, keyword, region, category, maxPrice, farmerName, urgentOnly, wasteOnly, normalOnly, discountOnly, sortBy));
    }

    @GetMapping("/farmer/me/legacy")
    public ResponseEntity<Page<CropViewDTO>> getMyCropsV1(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean urgentOnly,
            @RequestParam(required = false) Boolean wasteOnly,
            @RequestParam(required = false) Boolean normalOnly,
            @RequestParam(required = false) Boolean discountOnly,
            @RequestParam(defaultValue = "newest") String sortBy) {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.getCropsByFarmerIdV1(farmerId, farmerId, page, size, keyword, region, category, maxPrice, urgentOnly, wasteOnly, normalOnly, discountOnly, sortBy));
    }

    @GetMapping("/legacy/{cropId}")
    public ResponseEntity<CropViewDTO> getCropByCropIdV1(
            Authentication authentication,
            @PathVariable Long cropId) {
        Long currentUserId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.getCropByCropIdV1(currentUserId, cropId));
    }

    @GetMapping("/legacy/{cropId}/image")
    public ResponseEntity<byte[]> getCropImageByCropIdV1(@PathVariable Long cropId) {
        Crop crop = cropService.getCropEntityById(cropId);
        if (crop == null || crop.getImageData() == null || crop.getImageData().length == 0) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (crop.getImageType() != null && !crop.getImageType().isBlank()) {
            mediaType = MediaType.parseMediaType(crop.getImageType());
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(crop.getImageData());
    }

    @DeleteMapping("/legacy/{cropId}")
    public ResponseEntity<String> deleteCropByIdV1(
            @PathVariable Long cropId,
            Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        cropService.deleteCropByIdV1(farmerId, cropId);
        return ResponseEntity.ok("Crop deleted successfully");
    }
}
