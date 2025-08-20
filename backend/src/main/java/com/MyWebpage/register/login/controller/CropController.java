package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.model.Crop;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repositor.CropRepo;
import com.MyWebpage.register.login.service.CropService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/crops")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})

public class CropController {

    @Autowired
    private CropService cropService;

@PostMapping("/farmer/addCrop")
public ResponseEntity<Crop> addCrop(
        @RequestPart Crop crop,
        @RequestPart(required = false) MultipartFile imageFile) {

    try {
        System.out.println("Received crop data: " + crop);

        Crop addedCrop = cropService.addCrop(crop, imageFile);
        return new ResponseEntity<>(addedCrop, HttpStatus.CREATED);
    } catch (Exception e) {
        e.printStackTrace();
        return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
    @PutMapping("/farmer/update/{cropId}")
    public ResponseEntity<Crop> updateCrop(
            @PathVariable Long cropId,
            @RequestPart Crop crop,
            @RequestPart(required = false) MultipartFile imageFile) {

        try {
            System.out.println(cropId);
            crop.setCropID(cropId);
            System.out.println("Received crop data: " + crop);

            Crop addedCrop = cropService.updateCrop(crop, imageFile);
            return new ResponseEntity<>(addedCrop, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

@Autowired
CropRepo cropRepository;

    @GetMapping("/viewUrl/{productId}")
    public ResponseEntity<byte[]> viewImage(@PathVariable Long productId) {
        Crop crop=cropService.getCropByCropId(productId);
        byte[] imageFile=crop.getImageData();
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(crop.getImageType()))
                .body(imageFile);
    }

    @GetMapping("/viewCrop")
    public ResponseEntity<List<Crop>> getAllCrops() {

        try {
            List<Crop> crops = cropService.getAllCrops();
            for(Crop crop:crops)
            {
                crop.getFarmer().setAadharNo(null);
                crop.getFarmer().setEmail(null);
                crop.getFarmer().setPhoneNo(null);
            }
            return ResponseEntity.ok(crops);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/farmer/viewCrop/{farmerId}")
    public ResponseEntity<List<Crop>> getCropsByFarmerId(@PathVariable Long farmerId) {
        try {
            List<Crop> crops = cropService.getCropsByFarmerId(farmerId);
                for(Crop crop:crops)
                {
                    crop.getFarmer().setAadharNo(null);
                    crop.getFarmer().setEmail(null);
                    crop.getFarmer().setPhoneNo(null);
                }
            return new ResponseEntity<>(crops, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/crop/{cropId}")
    public ResponseEntity<Crop> getCropByCropId(@PathVariable Long cropId) {
        try {
            Crop crop = cropService.getCropByCropId(cropId);
            if(crop.getCropID()==null)
            {
                return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            crop.getFarmer().setAadharNo(null);
            crop.getFarmer().setEmail(null);
            crop.getFarmer().setPhoneNo(null);
            return new ResponseEntity<>(crop, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/farmer/delete1/{cropId}")
    public ResponseEntity<String> deleteCropById(@PathVariable Long cropId) {
        try {
            cropService.deleteCropById(cropId);
            return new ResponseEntity<>("Crop deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred during deletion", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/farmer/delete2/{farmerId}")
    public ResponseEntity<String> deleteCropByFarmerId(@PathVariable Long farmerId) {
        try {
            cropService.deleteCropByFarmerId(farmerId);
            return new ResponseEntity<>("Crops deleted successfully for farmerId: " + farmerId, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred during deletion", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/crops/{cropName}")
    public ResponseEntity<List<Crop>> getCropsByName(@PathVariable String cropName) {
        try {
            List<Crop> crops = cropService.getCropsByName(cropName);
            for(Crop crop:crops)
            {
                crop.getFarmer().setAadharNo(null);
                crop.getFarmer().setEmail(null);
                crop.getFarmer().setPhoneNo(null);
            }
            return new ResponseEntity<>(crops, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
