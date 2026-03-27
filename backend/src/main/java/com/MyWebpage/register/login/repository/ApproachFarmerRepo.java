package com.MyWebpage.register.login.repository;

import com.MyWebpage.register.login.dto.ApproachRequestDTO;
import com.MyWebpage.register.login.model.ApproachFarmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.dto.ApproachRequestDTO(
                        a.approachId,
                        a.cropId,
                        a.cropName,
                        a.farmerId,
                        a.farmerName,
                        a.userId,
                        a.userName,
                        a.status
                    )
                    FROM ApproachFarmer a
                    WHERE a.farmerId = :farmerId
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """,
            countQuery = """
                    SELECT COUNT(a)
                    FROM ApproachFarmer a
                    WHERE a.farmerId = :farmerId
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """
    )
    Page<ApproachRequestDTO> findRequestViewsByFarmerId(
            @Param("farmerId") Long farmerId,
            @Param("status") String status,
            Pageable pageable
    );

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.dto.ApproachRequestDTO(
                        a.approachId,
                        a.cropId,
                        a.cropName,
                        a.farmerId,
                        a.farmerName,
                        a.userId,
                        a.userName,
                        a.status
                    )
                    FROM ApproachFarmer a
                    WHERE a.farmerId = :farmerId
                      AND a.cropId = :cropId
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """,
            countQuery = """
                    SELECT COUNT(a)
                    FROM ApproachFarmer a
                    WHERE a.farmerId = :farmerId
                      AND a.cropId = :cropId
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """
    )
    Page<ApproachRequestDTO> findRequestViewsByFarmerIdAndCropId(
            @Param("farmerId") Long farmerId,
            @Param("cropId") Long cropId,
            @Param("status") String status,
            Pageable pageable
    );

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.dto.ApproachRequestDTO(
                        a.approachId,
                        a.cropId,
                        a.cropName,
                        a.farmerId,
                        a.farmerName,
                        a.userId,
                        a.userName,
                        a.status
                    )
                    FROM ApproachFarmer a
                    WHERE a.userId = :userId
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """,
            countQuery = """
                    SELECT COUNT(a)
                    FROM ApproachFarmer a
                    WHERE a.userId = :userId
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """
    )
    Page<ApproachRequestDTO> findRequestViewsByUserId(
            @Param("userId") Long userId,
            @Param("status") String status,
            Pageable pageable
    );
}
