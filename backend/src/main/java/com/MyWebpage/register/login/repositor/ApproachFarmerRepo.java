package com.MyWebpage.register.login.repositor;
import com.MyWebpage.register.login.model.ApproachFarmer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApproachFarmerRepo extends JpaRepository<ApproachFarmer, Long> {
    List<ApproachFarmer> findByFarmerIdAndCropId(Long farmerId, Long cropId);

    List<ApproachFarmer> findByUserId(Long userId);
        boolean existsByFarmerIdAndCropIdAndUserId(Long farmerId, Long cropId, Long userId);


    boolean existsByFarmerIdAndCropIdAndUserIdAndStatus(Long farmerId, Long cropId, Long userId, String pending);

    Optional<ApproachFarmer> findByUserIdAndCropId(Long userId, Long cropId);

    boolean existsByCropIdAndUserIdAndStatus(Long cropId, Long userId, String accepted);

    void deleteByUserId(Long farmerId);

    void deleteByFarmerId(Long farmerId);
}
