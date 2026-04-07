package com.MyWebpage.register.login.approach;

import com.MyWebpage.register.login.crop.Crop;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.crop.CropRepo;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.common.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApproachFarmerServiceImpl implements ApproachFarmerService {

    private static final Logger logger = LoggerFactory.getLogger(ApproachFarmerServiceImpl.class);

    private final ApproachFarmerRepo approachFarmerRepository;
    private final CropRepo cropRepository;
    private final FarmerRepo farmerRepository;
    private final EmailService emailService;

    public ApproachFarmerServiceImpl(
            ApproachFarmerRepo approachFarmerRepository,
            CropRepo cropRepository,
            FarmerRepo farmerRepository,
            EmailService emailService) {
        this.approachFarmerRepository = approachFarmerRepository;
        this.cropRepository = cropRepository;
        this.farmerRepository = farmerRepository;
        this.emailService = emailService;
    }

    @Override
    public ResponseEntity<String> createApproach(Long userId, Long cropId, Double requestedQuantity) {
        try {
            Crop crop = cropRepository.findById(cropId)
                    .orElseThrow(() -> new RuntimeException("Crop not found with ID: " + cropId));
            if ("sold".equalsIgnoreCase(crop.getStatus())) {
                return new ResponseEntity<>("This crop is already sold.", HttpStatus.BAD_REQUEST);
            }
            Long farmerId = crop.getFarmer().getFarmerId();

            boolean isPending = approachFarmerRepository.existsByFarmerIdAndCropIdAndUserIdAndStatus(
                    farmerId, cropId, userId, "pending");
            boolean isAccepted = approachFarmerRepository.existsByFarmerIdAndCropIdAndUserIdAndStatus(
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

            Farmer farmer = farmerRepository.findById(farmerId)
                    .orElseThrow(() -> new RuntimeException("Farmer not found with ID: " + farmerId));
            Farmer user = farmerRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            if (farmerId.equals(userId)) {
                return new ResponseEntity<>("You cannot approach your own crop.", HttpStatus.BAD_REQUEST);
            }

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
            approachFarmerRepository.deleteById(approachId);
            logger.info("Approach deleted: {}", approachId);
            return true;
        }
        return false;
    }

    @Override
    public boolean sendMail(ApproachFarmer approachFarmer) {
        Farmer farmer = farmerRepository.findByEmail(approachFarmer.getUserEmail()).orElse(null);
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
            return approachFarmerRepository.existsByCropIdAndUserIdAndStatus(cropId, userId, "Accepted");
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
