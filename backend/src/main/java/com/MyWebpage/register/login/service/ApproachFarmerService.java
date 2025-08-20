package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.model.ApproachFarmer;
import com.MyWebpage.register.login.model.Crop;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repositor.ApproachFarmerRepo;
import com.MyWebpage.register.login.repositor.CropRepo;
import com.MyWebpage.register.login.repositor.FarmerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApproachFarmerService {

    @Autowired
    private ApproachFarmerRepo approachFarmerRepository;

    @Autowired
    private CropRepo cropRepository;

    @Autowired
    private FarmerRepo farmerRepository;
    @Autowired
    private EmailService emailService;
    public ResponseEntity<String> createApproach(Long farmerId, Long cropId, Long userId) {
        try {
            boolean isPending = approachFarmerRepository.existsByFarmerIdAndCropIdAndUserIdAndStatus(
                    farmerId, cropId, userId, "pending"
            );
            boolean isAccepted = approachFarmerRepository.existsByFarmerIdAndCropIdAndUserIdAndStatus(
                    farmerId, cropId, userId, "Accepted"
            );

            if (isPending) {
                
                return new ResponseEntity<>("Cannot create a new approach. A pending approach already exists for this Farmer", HttpStatus.BAD_REQUEST);
            }
            if(isAccepted)
            {
                return new ResponseEntity<>("Cannot create a new approach. A approach already accepted your request for Crop.Please check your email for further process",HttpStatus.BAD_REQUEST);

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
            return new ResponseEntity<>("Success", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Server Busy", HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    public ApproachFarmer findById(Long approachId)
    {
        return approachFarmerRepository.findById(approachId).orElse(new ApproachFarmer());
    }
    public boolean updateApproachStatus(Long approachId, boolean accept) {
        Optional<ApproachFarmer> optionalApproach = approachFarmerRepository.findById(approachId);

        if (optionalApproach.isPresent()) {
            ApproachFarmer approach = optionalApproach.get();
            approach.setAccept(accept);
            if(accept)
            {
                approach.setStatus("Accepted");
            }
            else {
                approach.setStatus("Rejected");
            }
            approachFarmerRepository.save(approach);
            return true;
        }
        return false;
    }
    public List<ApproachFarmer> getAllApproaches() {
        return approachFarmerRepository.findAll();
    }
    public List<ApproachFarmer> getRequestsByFarmerId(Long farmerId) {
        return approachFarmerRepository.findAll()
                .stream()
                .filter(request -> request.getFarmerId().equals(farmerId))
                .collect(Collectors.toList());
    }
    public List<ApproachFarmer> getRequestsByFarmerIdAndCropId(Long farmerId, Long cropId) {
        return  approachFarmerRepository.findByFarmerIdAndCropId(farmerId, cropId);
    }
    public List<ApproachFarmer> getRequestsByUserId(Long userId) {
        return approachFarmerRepository.findByUserId(userId);
    }

    public boolean deleteApproach(Long approachId) {
        if (approachFarmerRepository.existsById(approachId)) {
            approachFarmerRepository.deleteById(approachId);
            return true;
        }
        return false;
    }

    public boolean sendMail(ApproachFarmer approachFarmer) {
       Farmer farmer=farmerRepository.findByEmail(approachFarmer.getUserEmail());
       if(farmer==null)
       {
           return false;
       }
        try {
            String msg = String.format(
                    "Dear User,\n\n" +
                            "Here are the details of the farmer you have approached:\n\n" +
                            "Farmer Name: %s\n" +
                            "Farmer Phone Number: %s\n" +
                            "Farmer Email: %s\n" +
                            "Farmer Location: %s\n\n" +
                            "Thank you for using our platform.\n\n" +
                            "Best regards,\n" +
                            "Your Service Team",
                    approachFarmer.getFarmerName(),
                    approachFarmer.getFarmerPhoneNo(),
                    approachFarmer.getFarmerEmail(),
                    approachFarmer.getFarmerLocation()
            );

            emailService.sendMail(approachFarmer.getUserEmail(), msg);

            return true;

        } catch (Exception e) {

            return false;
        }
    }
    public boolean isApproachAccepted(Long userId, Long cropId) {
        try {
            boolean isAccepted = approachFarmerRepository.existsByCropIdAndUserIdAndStatus(
                     cropId, userId, "Accepted"
            );
            if (isAccepted) {
              return true;
            }

            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while checking the approach status: " + e.getMessage(), e);
        }
    }


}
