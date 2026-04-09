package com.MyWebpage.register.login.approach;

import com.MyWebpage.register.login.chat.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seller/approach")
public class ApproachFarmerController {

    @Autowired
    private ApproachFarmerService approachFarmerService;
    @Autowired
    private ChatService chatService;

    @PostMapping("/accept/{approachId}")
    public ResponseEntity<String> acceptApproach(
            @PathVariable Long approachId,
            Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        boolean success = approachFarmerService.updateApproachStatus(approachId, farmerId, true);
        if (success) {
            ApproachFarmer approachFarmer=approachFarmerService.findById(approachId);
            chatService.createOrGetConversationForApproach(approachId, farmerId);
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
    public ResponseEntity<Page<ApproachRequestDTO>> getRequestsByFarmerId(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Long farmerId = Long.parseLong(authentication.getName());
            return ResponseEntity.ok(approachFarmerService.getRequestsByFarmerId(farmerId, status, page, size));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/requests/me/{cropId}")
    public ResponseEntity<Page<ApproachRequestDTO>> getRequestsByFarmerIdAndCropId(
            @PathVariable Long cropId,
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Long farmerId = Long.parseLong(authentication.getName());
            return ResponseEntity.ok(approachFarmerService.getRequestsByFarmerIdAndCropId(farmerId, cropId, status, page, size));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
