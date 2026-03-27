package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.ApproachRequestDTO;
import com.MyWebpage.register.login.model.ApproachFarmer;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ApproachFarmerService {
    ResponseEntity<String> createApproach(Long userId, Long cropId, Double requestedQuantity);
    ApproachFarmer findById(Long approachId);
    boolean updateApproachStatus(Long approachId, Long farmerId, boolean accept);
    List<ApproachFarmer> getAllApproaches();
    Page<ApproachRequestDTO> getRequestsByFarmerId(Long farmerId, String status, int page, int size);
    Page<ApproachRequestDTO> getRequestsByFarmerIdAndCropId(Long farmerId, Long cropId, String status, int page, int size);
    Page<ApproachRequestDTO> getRequestsByUserId(Long userId, String status, int page, int size);
    boolean deleteApproach(Long approachId, Long userId);
    boolean sendMail(ApproachFarmer approachFarmer);
    boolean isApproachAccepted(Long userId, Long cropId);
}
