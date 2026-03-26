package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.model.ApproachFarmer;
import com.MyWebpage.register.login.service.ApproachFarmerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seller/approach")
public class ApproachFarmerController2 {

    @Autowired
    private ApproachFarmerService approachFarmerService;

    @PostMapping("/accept/{approachId}")
    public ResponseEntity<String> acceptApproach(
            @PathVariable Long approachId,
            Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        boolean success = approachFarmerService.updateApproachStatus(approachId, farmerId, true);
        if (success) {
            ApproachFarmer approachFarmer=approachFarmerService.findById(approachId);
            boolean a=approachFarmerService.sendMail(approachFarmer);
            if(a) {
                return ResponseEntity.ok("Approach accepted successfully.");
            }
            else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User has been terminated");
        }
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("serverError");
    }


    @PostMapping("/reject/{approachId}")
    public ResponseEntity<String> rejectApproach(
            @PathVariable Long approachId,
            Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        boolean success = approachFarmerService.updateApproachStatus(approachId, farmerId, false);
        if (success) {
            return ResponseEntity.ok("Approach rejected successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Approach with ID " + approachId + " not found.");
        }
    }
    @GetMapping("/requests/me")
    public ResponseEntity<Object> getRequestsByFarmerId(Authentication authentication) {
        try {
            Long farmerId = Long.parseLong(authentication.getName());
            List<ApproachFarmer> requests = approachFarmerService.getRequestsByFarmerId(farmerId);
            if (requests == null || requests.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No requests found for Farmer ID: " + farmerId);
            }
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching requests: " + e.getMessage());
        }
    }

    @GetMapping("/requests/me/{cropId}")
    public ResponseEntity<Object> getRequestsByFarmerIdAndCropId(
            @PathVariable Long cropId,
            Authentication authentication) {
        try {
            Long farmerId = Long.parseLong(authentication.getName());
            List<ApproachFarmer> requests = approachFarmerService.getRequestsByFarmerIdAndCropId(farmerId, cropId);
            if (requests == null || requests.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body("No requests found for Farmer ID: " + farmerId + " and Crop ID: " + cropId);
            }
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching requests: " + e.getMessage());
        }
    }

}
