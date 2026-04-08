package com.MyWebpage.register.login.support;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.support.dto.AuthenticatedSupportRequestForm;
import com.MyWebpage.register.login.support.dto.GuestSupportRequestForm;
import com.MyWebpage.register.login.support.dto.SupportRequestDTO;
import com.MyWebpage.register.login.support.dto.SupportRequestImageDTO;
import com.MyWebpage.register.login.support.dto.SupportRequestSummaryDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/support")
public class SupportRequestController {

    private final SupportRequestService supportRequestService;

    public SupportRequestController(SupportRequestService supportRequestService) {
        this.supportRequestService = supportRequestService;
    }

    @PostMapping(path = "/contact", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<SupportRequestSummaryDTO>> createGuestSupportRequest(
            @Valid @ModelAttribute GuestSupportRequestForm form
    ) {
        SupportRequestSummaryDTO supportRequest = supportRequestService.createGuestSupportRequest(
                toGuestSupportRequestDTO(form)
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Support request submitted successfully.", supportRequest));
    }

    @PostMapping(path = "/request", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<SupportRequestSummaryDTO>> createAuthenticatedSupportRequest(
            @Valid @ModelAttribute AuthenticatedSupportRequestForm form,
            Authentication authentication
    ) {
        Long authenticatedFarmerId = resolveAuthenticatedFarmerId(authentication);
        SupportRequestSummaryDTO supportRequest = supportRequestService.createAuthenticatedSupportRequest(
                authenticatedFarmerId,
                toAuthenticatedSupportRequestDTO(form)
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Support request submitted successfully.", supportRequest));
    }

    @GetMapping("/admin/requests")
    public ResponseEntity<ApiResponse<List<SupportRequestSummaryDTO>>> getAllSupportRequests() {
        return ResponseEntity.ok(ApiResponse.success(
                "Support requests fetched",
                supportRequestService.getAllSupportRequests()
        ));
    }

    @GetMapping("/admin/requests/{id}")
    public ResponseEntity<ApiResponse<SupportRequestSummaryDTO>> getSupportRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Support request fetched",
                supportRequestService.getSupportRequestById(id)
        ));
    }

    @GetMapping("/admin/requests/{id}/image")
    public ResponseEntity<ApiResponse<SupportRequestImageDTO>> getSupportRequestImage(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Support request image fetched",
                supportRequestService.getSupportRequestImage(id)
        ));
    }

    @DeleteMapping("/admin/requests/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSupportRequest(@PathVariable Long id) {
        supportRequestService.softDeleteSupportRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Support request deleted successfully.", "OK"));
    }

    private SupportRequestDTO toGuestSupportRequestDTO(GuestSupportRequestForm form) {
        SupportRequestDTO requestDTO = new SupportRequestDTO();
        requestDTO.setName(form.getName());
        requestDTO.setEmail(form.getEmail());
        requestDTO.setMessage(form.getMessage());
        requestDTO.setType(SupportType.CONTACT);
        attachImage(form.getImage(), requestDTO);
        return requestDTO;
    }

    private SupportRequestDTO toAuthenticatedSupportRequestDTO(AuthenticatedSupportRequestForm form) {
        SupportRequestDTO requestDTO = new SupportRequestDTO();
        requestDTO.setType(form.getType());
        requestDTO.setMessage(form.getMessage());
        attachImage(form.getImage(), requestDTO);
        return requestDTO;
    }

    private void attachImage(MultipartFile image, SupportRequestDTO requestDTO) {
        if (image == null || image.isEmpty()) {
            return;
        }
        try {
            requestDTO.setImageData(image.getBytes());
        } catch (IOException exception) {
            throw new IllegalArgumentException("Unable to read uploaded image");
        }
        String originalFilename = image.getOriginalFilename();
        requestDTO.setImageName(StringUtils.cleanPath(originalFilename == null ? "" : originalFilename));
        requestDTO.setImageType(image.getContentType());
    }

    private Long resolveAuthenticatedFarmerId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authenticated user is required");
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Authenticated user is invalid");
        }
    }
}
