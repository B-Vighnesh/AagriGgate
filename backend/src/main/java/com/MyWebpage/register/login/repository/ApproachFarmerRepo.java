package com.MyWebpage.register.login.repository;
import com.MyWebpage.register.login.model.ApproachFarmer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApproachFarmerRepo extends JpaRepository<ApproachFarmer, Long> {
    List<ApproachFarmer> findByFarmerIdAndCropIdOrderByApproachIdDesc(Long farmerId, Long cropId);

    List<ApproachFarmer> findByUserIdOrderByApproachIdDesc(Long userId);
    
    List<ApproachFarmer> findByFarmerIdOrderByApproachIdDesc(Long farmerId);
        boolean existsByFarmerIdAndCropIdAndUserId(Long farmerId, Long cropId, Long userId);


    boolean existsByFarmerIdAndCropIdAndUserIdAndStatus(Long farmerId, Long cropId, Long userId, String pending);

    Optional<ApproachFarmer> findByUserIdAndCropId(Long userId, Long cropId);

    boolean existsByCropIdAndUserIdAndStatus(Long cropId, Long userId, String accepted);

    void deleteByUserId(Long farmerId);

    void deleteByFarmerId(Long farmerId);
}
