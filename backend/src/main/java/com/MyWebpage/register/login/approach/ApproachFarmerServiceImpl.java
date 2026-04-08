package com.MyWebpage.register.login.approach;

import com.MyWebpage.register.login.crop.Crop;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.crop.CropQueryService;
import com.MyWebpage.register.login.farmer.FarmerQueryService;
import com.MyWebpage.register.login.common.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ApproachFarmerServiceImpl implements ApproachFarmerService {

    private static final Logger logger = LoggerFactory.getLogger(ApproachFarmerServiceImpl.class);

    private final ApproachFarmerRepo approachFarmerRepository;
    private final CropQueryService cropQueryService;
    private final FarmerQueryService farmerQueryService;
    private final EmailService emailService;

    public ApproachFarmerServiceImpl(
            ApproachFarmerRepo approachFarmerRepository,
            CropQueryService cropQueryService,
            FarmerQueryService farmerQueryService,
            EmailService emailService) {
        this.approachFarmerRepository = approachFarmerRepository;
        this.cropQueryService = cropQueryService;
        this.farmerQueryService = farmerQueryService;
        this.emailService = emailService;
    }

    @Override
    public ResponseEntity<String> createApproach(Long userId, Long cropId, Double requestedQuantity) {
        try {
            Crop crop = cropQueryService.requireAvailableCropForBuyer(cropId, userId);
            Long farmerId = crop.getFarmer().getFarmerId();

            boolean isPending = approachFarmerRepository.existsByFarmerIdAndCropIdAndUserIdAndStatusAndActiveTrue(
                    farmerId, cropId, userId, "pending");
            boolean isAccepted = approachFarmerRepository.existsByFarmerIdAndCropIdAndUserIdAndStatusAndActiveTrue(
                    farmerId, cropId, userId, "Accepted");

            if (isPending) {
                return new ResponseEntity<>(
                        "Cannot create a new approach. A pending approach already exists for this Farmer",
                        HttpStatus.BAD_REQUEST);
            }
            if (isAccepted) {
                return new ResponseEntity<>(
                        "Cannot create a new approach. A approach already accepted your request for Crop.Please check your email for further process",
                        HttpStatus.BAD_REQUEST);
            }

            Farmer farmer = farmerQueryService.requireActiveFarmer(farmerId);
            Farmer user = farmerQueryService.requireActiveFarmer(userId);

            ApproachFarmer approachFarmer = new ApproachFarmer();
            approachFarmer.setCropId(crop.getCropID());
            approachFarmer.setCropName(crop.getCropName());
            approachFarmer.setFarmerId(farmer.getFarmerId());
            approachFarmer.setFarmerName(farmer.getFirstName() + " " + farmer.getLastName());
            approachFarmer.setFarmerPhoneNo(farmer.getPhoneNo());
            approachFarmer.setFarmerEmail(farmer.getEmail());
            approachFarmer.setFarmerLocation(farmer.getState() + ", " + farmer.getDistrict());
            approachFarmer.setUserId(user.getFarmerId());
            approachFarmer.setUserName(user.getFirstName() + " " + user.getLastName());
            approachFarmer.setUserPhoneNo(user.getPhoneNo());
            approachFarmer.setUserEmail(user.getEmail());
            approachFarmer.setRequestedQuantity(normalizeRequestedQuantity(requestedQuantity, crop));
            approachFarmer.setStatus("pending");
            approachFarmer.setActive(true);
            approachFarmer.setDeletedAt(null);

            approachFarmerRepository.save(approachFarmer);
            logger.info("Approach created: {}", approachFarmer.getApproachId());
            return new ResponseEntity<>("Success", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Failed to create approach", e);
            return new ResponseEntity<>("Server Busy", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ApproachFarmer findById(Long approachId) {
        return approachFarmerRepository.findById(approachId).orElse(new ApproachFarmer());
    }

    @Override
    public boolean updateApproachStatus(Long approachId, Long farmerId, boolean accept) {
        Optional<ApproachFarmer> optionalApproach = approachFarmerRepository.findById(approachId);
        if (optionalApproach.isPresent()) {
            ApproachFarmer approach = optionalApproach.get();
            if (!farmerId.equals(approach.getFarmerId())) {
                return false;
            }
            if (!"pending".equalsIgnoreCase(approach.getStatus())) {
                return false;
            }
            approach.setAccept(accept);
            approach.setStatus(accept ? "Accepted" : "Rejected");
            approachFarmerRepository.save(approach);
            logger.info("Approach status updated: {} -> {}", approachId, approach.getStatus());
            return true;
        }
        return false;
    }

    @Override
    public List<ApproachFarmer> getAllApproaches() {
        return approachFarmerRepository.findAll()
                .stream()
                .sorted((a, b) -> Long.compare(
                        b.getApproachId() == null ? 0L : b.getApproachId(),
                        a.getApproachId() == null ? 0L : a.getApproachId()
                ))
                .toList();
    }

    @Override
    public Page<ApproachRequestDTO> getRequestsByFarmerId(Long farmerId, String status, int page, int size) {
        return approachFarmerRepository.findRequestViewsByFarmerId(
                farmerId,
                normalizeStatus(status),
                buildPageRequest(page, size)
        );
    }

    @Override
    public Page<ApproachRequestDTO> getRequestsByFarmerIdAndCropId(Long farmerId, Long cropId, String status, int page, int size) {
        return approachFarmerRepository.findRequestViewsByFarmerIdAndCropId(
                farmerId,
                cropId,
                normalizeStatus(status),
                buildPageRequest(page, size)
        );
    }

    @Override
    public Page<ApproachRequestDTO> getRequestsByUserId(Long userId, String status, int page, int size) {
        return approachFarmerRepository.findRequestViewsByUserId(
                userId,
                normalizeStatus(status),
                buildPageRequest(page, size)
        );
    }

    @Override
    public boolean deleteApproach(Long approachId, Long userId) {
        Optional<ApproachFarmer> optionalApproach = approachFarmerRepository.findById(approachId);
        if (optionalApproach.isPresent() && userId.equals(optionalApproach.get().getUserId())) {
            approachFarmerRepository.softDeleteByApproachIdAndUserId(approachId, userId, LocalDateTime.now());
            logger.info("Approach deleted: {}", approachId);
            return true;
        }
        return false;
    }
    @Override
    public boolean deleteApproach(Long farmerId, String role) {
        if ("ROLE_BUYER".equals(role)){
            approachFarmerRepository.softDeleteByUserId(farmerId, LocalDateTime.now());
        } else if ("ROLE_SELLER".equals(role)) {
            approachFarmerRepository.softDeleteByFarmerId(farmerId, LocalDateTime.now());
        }
        return false;
    }
    @Override
    public boolean softDeleteApproach(Long farmerId, String role) {
        if ("ROLE_BUYER".equals(role)){
            approachFarmerRepository.softDeleteByUserId(farmerId, LocalDateTime.now());
        } else if ("ROLE_SELLER".equals(role)) {
            approachFarmerRepository.softDeleteByFarmerId(farmerId, LocalDateTime.now());
        }
        return false;
    }

    @Override
    public boolean softDeleteApproachByCropId(Long cropId) {
        approachFarmerRepository.softDeleteByCropId(cropId, LocalDateTime.now());
        return true;
    }

    @Override
    public boolean hasRejectedApproach(Long userId, Long cropId) {
        return approachFarmerRepository.existsByCropIdAndUserIdAndStatusIgnoreCaseAndActiveTrue(cropId, userId, "Rejected");
    }

    @Override
    public void softDeleteExistingApproach(Long userId, Long cropId) {
        approachFarmerRepository.findByUserIdAndCropIdAndActiveTrue(userId, cropId)
                .ifPresent(existing ->
                        approachFarmerRepository.softDeleteByApproachIdAndUserId(existing.getApproachId(), userId, LocalDateTime.now()));
    }

    @Override
    public boolean sendMail(ApproachFarmer approachFarmer) {
        Farmer farmer = farmerQueryService.findActiveByEmail(approachFarmer.getUserEmail());
        if (farmer == null) {
            return false;
        }
        try {
            emailService.sendApproachAcceptedEmail(approachFarmer);
            logger.info("Approach mail sent for approachId: {}", approachFarmer.getApproachId());
            return true;
        } catch (Exception e) {
            logger.error("Failed to send approach mail", e);
            return false;
        }
    }

    @Override
    public boolean isApproachAccepted(Long userId, Long cropId) {
        try {
            return approachFarmerRepository.existsByCropIdAndUserIdAndStatusAndActiveTrue(cropId, userId, "Accepted");
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while checking the approach status: " + e.getMessage(), e);
        }
    }

    private PageRequest buildPageRequest(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "approachId"));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank() || "All".equalsIgnoreCase(status)) {
            return null;
        }
        return status.trim();
    }

    private Double normalizeRequestedQuantity(Double requestedQuantity, Crop crop) {
        double quantity = requestedQuantity == null ? 1.0 : requestedQuantity;
        if (quantity <= 0) {
            throw new IllegalArgumentException("Requested quantity must be greater than zero.");
        }
        if (crop.getQuantity() != null && quantity > crop.getQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available crop quantity.");
        }
        return quantity;
    }
}
