package com.MyWebpage.register.login.support;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.support.dto.SupportRequestDTO;
import com.MyWebpage.register.login.support.dto.SupportRequestImageDTO;
import com.MyWebpage.register.login.support.dto.SupportRequestSummaryDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SupportRequestService {

    private final SupportRequestRepository supportRequestRepository;
    private final FarmerRepo farmerRepo;

    public SupportRequestService(SupportRequestRepository supportRequestRepository, FarmerRepo farmerRepo) {
        this.supportRequestRepository = supportRequestRepository;
        this.farmerRepo = farmerRepo;
    }

    @Transactional
    public SupportRequestSummaryDTO createGuestSupportRequest(SupportRequestDTO requestDTO) {
        String normalizedEmail = normalizeEmail(requestDTO.getEmail());
        if (supportRequestRepository.countByEmailAndIsDeletedFalse(normalizedEmail) >= 5) {
            throw new GuestSupportLimitExceededException();
        }

        SupportRequest request = new SupportRequest();
        request.setUserId(null);
        request.setName(normalizeText(requestDTO.getName()));
        request.setEmail(normalizedEmail);
        request.setType(SupportType.CONTACT);
        request.setSubject(normalizeText(requestDTO.getSubject()));
        request.setMessage(requireMessage(requestDTO.getMessage()));
        request.setImageData(requestDTO.getImageData());
        request.setImageName(normalizeText(requestDTO.getImageName()));
        request.setImageType(normalizeText(requestDTO.getImageType()));
        request.setStatus(SupportStatus.OPEN);
        request.setIsDeleted(false);

        return toSummary(supportRequestRepository.save(request));
    }

    @Transactional
    public SupportRequestSummaryDTO createAuthenticatedSupportRequest(Long authenticatedFarmerId, SupportRequestDTO requestDTO) {
        if (requestDTO.getType() == SupportType.CONTACT) {
            throw new SupportValidationException(Map.of(
                    "type", "must be one of COMPLAINT, FEEDBACK, ENQUIRY"
            ));
        }

        Farmer farmer = Optional.ofNullable(farmerRepo.findByFarmerId(authenticatedFarmerId))
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        SupportRequest request = new SupportRequest();
        request.setUserId(farmer.getFarmerId());
        request.setName(resolveName(farmer));
        request.setEmail(normalizeText(farmer.getEmail()));
        request.setType(requestDTO.getType());
        request.setSubject(normalizeText(requestDTO.getSubject()));
        request.setMessage(requireMessage(requestDTO.getMessage()));
        request.setImageData(requestDTO.getImageData());
        request.setImageName(normalizeText(requestDTO.getImageName()));
        request.setImageType(normalizeText(requestDTO.getImageType()));
        request.setStatus(SupportStatus.OPEN);
        request.setIsDeleted(false);

        return toSummary(supportRequestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<SupportRequestSummaryDTO> getAllSupportRequests() {
        return supportRequestRepository.findAllSummaries();
    }

    @Transactional(readOnly = true)
    public SupportRequestSummaryDTO getSupportRequestById(Long id) {
        return supportRequestRepository.findSummaryById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support request not found"));
    }

    @Transactional(readOnly = true)
    public SupportRequestImageDTO getSupportRequestImage(Long id) {
        return supportRequestRepository.findImageById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support request image not found"));
    }

    @Transactional
    public void softDeleteSupportRequest(Long id) {
        int updatedRows = supportRequestRepository.softDeleteById(id, LocalDateTime.now());
        if (updatedRows == 0) {
            throw new ResourceNotFoundException("Support request not found");
        }
    }

    private SupportRequestSummaryDTO toSummary(SupportRequest request) {
        return new SupportRequestSummaryDTO(
                request.getId(),
                request.getUserId(),
                request.getName(),
                request.getEmail(),
                request.getType(),
                request.getSubject(),
                request.getMessage(),
                request.getStatus(),
                request.getIsDeleted(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    private String normalizeEmail(String email) {
        String normalized = normalizeText(email);
        return normalized == null ? null : normalized.toLowerCase();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String requireMessage(String message) {
        String normalizedMessage = normalizeText(message);
        if (normalizedMessage == null) {
            throw new SupportValidationException(Map.of(
                    "message", "must not be blank"
            ));
        }
        return normalizedMessage;
    }

    private String resolveName(Farmer farmer) {
        String firstName = normalizeText(farmer.getFirstName());
        String lastName = normalizeText(farmer.getLastName());
        StringBuilder builder = new StringBuilder();
        if (firstName != null) {
            builder.append(firstName);
        }
        if (lastName != null) {
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(lastName);
        }
        String fullName = builder.toString().trim();
        if (!fullName.isEmpty()) {
            return fullName;
        }
        return normalizeText(farmer.getUsername());
    }
}
