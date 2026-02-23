package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.model.ApproachFarmer;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ApproachFarmerService {
    ResponseEntity<String> createApproach(Long farmerId, Long cropId, Long userId);
    ApproachFarmer findById(Long approachId);
    boolean updateApproachStatus(Long approachId, boolean accept);
    List<ApproachFarmer> getAllApproaches();
    List<ApproachFarmer> getRequestsByFarmerId(Long farmerId);
    List<ApproachFarmer> getRequestsByFarmerIdAndCropId(Long farmerId, Long cropId);
    List<ApproachFarmer> getRequestsByUserId(Long userId);
    boolean deleteApproach(Long approachId);
    boolean sendMail(ApproachFarmer approachFarmer);
    boolean isApproachAccepted(Long userId, Long cropId);
}
