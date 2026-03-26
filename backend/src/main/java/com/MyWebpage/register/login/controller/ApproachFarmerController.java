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
@RequestMapping("/api/v1/buyer/approach")
public class ApproachFarmerController {

    @Autowired
    private ApproachFarmerService approachFarmerService;

    @PostMapping("/create/{cropId}")
    public ResponseEntity<String> createApproach(
            @PathVariable Long cropId,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            return  approachFarmerService.createApproach(userId, cropId);
        } catch (Exception e) {
            if (e.getMessage().contains("Duplicate entry")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating approach record: " + e.getMessage());
        }
    }

    // Endpoint to fetch all ApproachFarmer records
//    @GetMapping("/all")
//    public ResponseEntity<Object> getAllApproaches() {
//        try {
//            List<ApproachFarmer> approaches = approachFarmerService.getAllApproaches();
//            if (approaches == null || approaches.isEmpty()) {
//                return ResponseEntity.status(HttpStatus.NO_CONTENT)
//                        .body("No approach records found.");
//            }
//            return ResponseEntity.ok(approaches);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error fetching approaches: " + e.getMessage());
//        }
//    }
    @GetMapping("/requests/me")
    public ResponseEntity<Object> getRequestsByUserId(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<ApproachFarmer> requests = approachFarmerService.getRequestsByUserId(userId);
            if (requests == null || requests.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body("No requests found for User ID: " + userId);
            }
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching requests: " + e.getMessage());
        }
    }
    @GetMapping("/requests/me/{cropId}")
    public ResponseEntity<Boolean> isApproachAccepted(
            @PathVariable Long cropId,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            boolean isAccepted = approachFarmerService.isApproachAccepted(userId, cropId);
            if(isAccepted)
            return ResponseEntity.ok(isAccepted);
            else
                return ResponseEntity.badRequest().body(false);
        } catch (Exception e) {
           return ResponseEntity.badRequest().body(false);
        }
    }
    @DeleteMapping("/delete/{approachId}")
    public ResponseEntity<String> deleteApproach(
            @PathVariable Long approachId,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            boolean isDeleted = approachFarmerService.deleteApproach(approachId, userId);
            if (isDeleted) {
                return ResponseEntity.ok("Approach record deleted successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Approach record not found for ID: " + approachId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting approach record: " + e.getMessage());
        }
    }
}
