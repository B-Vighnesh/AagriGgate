package com.MyWebpage.register.login.approach;

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
    ApproachRequestDTO getRequestByFarmerId(Long farmerId, Long approachId);
    ApproachRequestDTO getRequestByUserId(Long userId, Long approachId);
    boolean deleteApproach(Long approachId, Long userId);

    boolean deleteApproach(Long farmerId, String role);

    boolean softDeleteApproach(Long farmerId, String role);

    boolean softDeleteApproachByCropId(Long cropId);

    boolean hasRejectedApproach(Long userId, Long cropId);

    void softDeleteExistingApproach(Long userId, Long cropId);

    boolean sendMail(ApproachFarmer approachFarmer);
    boolean isApproachAccepted(Long userId, Long cropId);
}
