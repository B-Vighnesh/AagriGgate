package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.model.ApproachFarmer;
import com.MyWebpage.register.login.model.Crop;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.ApproachFarmerRepo;
import com.MyWebpage.register.login.repository.CropRepo;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.service.ApproachFarmerService;
import com.MyWebpage.register.login.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    public ResponseEntity<String> createApproach(Long farmerId, Long cropId, Long userId) {
        try {
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

            Crop crop = cropRepository.findById(cropId)
                    .orElseThrow(() -> new RuntimeException("Crop not found with ID: " + cropId));
            Farmer farmer = farmerRepository.findById(farmerId)
                    .orElseThrow(() -> new RuntimeException("Farmer not found with ID: " + farmerId));
            Farmer user = farmerRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

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
    public boolean updateApproachStatus(Long approachId, boolean accept) {
        Optional<ApproachFarmer> optionalApproach = approachFarmerRepository.findById(approachId);
        if (optionalApproach.isPresent()) {
            ApproachFarmer approach = optionalApproach.get();
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
    public List<ApproachFarmer> getRequestsByFarmerId(Long farmerId) {
        return approachFarmerRepository.findByFarmerIdOrderByApproachIdDesc(farmerId);
    }

    @Override
    public List<ApproachFarmer> getRequestsByFarmerIdAndCropId(Long farmerId, Long cropId) {
        return approachFarmerRepository.findByFarmerIdAndCropIdOrderByApproachIdDesc(farmerId, cropId);
    }

    @Override
    public List<ApproachFarmer> getRequestsByUserId(Long userId) {
        return approachFarmerRepository.findByUserIdOrderByApproachIdDesc(userId);
    }

    @Override
    public boolean deleteApproach(Long approachId) {
        if (approachFarmerRepository.existsById(approachId)) {
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
}
