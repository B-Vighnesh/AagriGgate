package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.CropRequestDTO;
import com.MyWebpage.register.login.dto.CropResponseDTO;
import com.MyWebpage.register.login.model.Crop;
import com.MyWebpage.register.login.response.ApiResponse;
import com.MyWebpage.register.login.service.CropService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/crops")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
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
    public ResponseEntity<Page<Crop>> getAllCropsV1(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(cropService.getAllCropsV1(page, size));
    }

    @GetMapping("/farmer/{farmerId}/legacy")
    public ResponseEntity<List<Crop>> getCropsByFarmerIdV1(
            @PathVariable Long farmerId,
            Authentication authentication) {
        Long authenticatedFarmerId = Long.parseLong(authentication.getName());
        if (!authenticatedFarmerId.equals(farmerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(cropService.getCropsByFarmerIdV1(farmerId));
    }

    @GetMapping("/farmer/me/legacy")
    public ResponseEntity<List<Crop>> getMyCropsV1(Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cropService.getCropsByFarmerIdV1(farmerId));
    }

    @GetMapping("/legacy/{cropId}")
    public ResponseEntity<Crop> getCropByCropIdV1(@PathVariable Long cropId) {
        return ResponseEntity.ok(cropService.getCropByCropIdV1(cropId));
    }

    @GetMapping("/legacy/{cropId}/image")
    public ResponseEntity<byte[]> getCropImageByCropIdV1(@PathVariable Long cropId) {
        Crop crop = cropService.getCropByCropIdV1(cropId);
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

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CropResponseDTO>>> getAllCropsV2(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Crops fetched", cropService.getAllCropsV2(page, size)));
    }

    @PostMapping(value = "/v2/farmer/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CropResponseDTO>> addCropV2(
            Authentication authentication,
            @Valid @RequestPart("crop") CropRequestDTO crop,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Crop added", cropService.addCropV2(farmerId, crop, imageFile)));
    }

    @PutMapping(value = "/v2/farmer/{cropId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CropResponseDTO>> updateCropV2(
            Authentication authentication,
            @PathVariable Long cropId,
            @Valid @RequestPart("crop") CropRequestDTO crop,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Crop updated", cropService.updateCropV2(farmerId, cropId, crop, imageFile)));
    }

    @GetMapping("/v2/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<List<CropResponseDTO>>> getCropsByFarmerIdV2(
            @PathVariable Long farmerId,
            Authentication authentication) {
        Long authenticatedFarmerId = Long.parseLong(authentication.getName());
        if (!authenticatedFarmerId.equals(farmerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(ApiResponse.success("Farmer crops fetched", cropService.getCropsByFarmerIdV2(farmerId)));
    }

    @GetMapping("/v2/farmer/me")
    public ResponseEntity<ApiResponse<List<CropResponseDTO>>> getMyCropsV2(Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Farmer crops fetched", cropService.getCropsByFarmerIdV2(farmerId)));
    }

    @GetMapping("/v2/{cropId}")
    public ResponseEntity<ApiResponse<CropResponseDTO>> getCropByCropIdV2(@PathVariable Long cropId) {
        return ResponseEntity.ok(ApiResponse.success("Crop fetched", cropService.getCropByCropIdV2(cropId)));
    }

    @DeleteMapping("/v2/{cropId}")
    public ResponseEntity<ApiResponse<String>> deleteCropByIdV2(
            @PathVariable Long cropId,
            Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        cropService.deleteCropByIdV2(farmerId, cropId);
        return ResponseEntity.ok(ApiResponse.success("Crop deleted successfully", "OK"));
    }

    @DeleteMapping("/v2/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<String>> deleteCropByFarmerIdV2(
            @PathVariable Long farmerId,
            Authentication authentication) {
        Long authenticatedFarmerId = Long.parseLong(authentication.getName());
        if (!authenticatedFarmerId.equals(farmerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        cropService.deleteCropByFarmerIdV2(farmerId);
        return ResponseEntity.ok(ApiResponse.success("Farmer crops deleted successfully", "OK"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CropResponseDTO>>> searchCropsV2(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Crop search result", cropService.searchCropsV2(keyword, page, size)));
    }
}
