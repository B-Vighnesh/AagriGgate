package com.MyWebpage.register.login.approach;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ApproachFarmerRepo extends JpaRepository<ApproachFarmer, Long> {
    @Query("""
            SELECT a FROM ApproachFarmer a
            WHERE a.farmerId = :farmerId
              AND a.cropId = :cropId
              AND a.active = true
              AND a.deletedAt IS NULL
            ORDER BY a.approachId DESC
            """)
    List<ApproachFarmer> findByFarmerIdAndCropIdOrderByApproachIdDesc(Long farmerId, Long cropId);

    @Query("""
            SELECT a FROM ApproachFarmer a
            WHERE a.userId = :userId
              AND a.active = true
              AND a.deletedAt IS NULL
            ORDER BY a.approachId DESC
            """)
    List<ApproachFarmer> findByUserIdOrderByApproachIdDesc(Long userId);

    @Query("""
            SELECT a FROM ApproachFarmer a
            WHERE a.farmerId = :farmerId
              AND a.active = true
              AND a.deletedAt IS NULL
            ORDER BY a.approachId DESC
            """)
    List<ApproachFarmer> findByFarmerIdOrderByApproachIdDesc(Long farmerId);
    boolean existsByFarmerIdAndCropIdAndUserIdAndActiveTrue(Long farmerId, Long cropId, Long userId);


    boolean existsByFarmerIdAndCropIdAndUserIdAndStatusAndActiveTrue(Long farmerId, Long cropId, Long userId, String pending);

    Optional<ApproachFarmer> findByUserIdAndCropIdAndActiveTrue(Long userId, Long cropId);

    boolean existsByCropIdAndUserIdAndStatusAndActiveTrue(Long cropId, Long userId, String accepted);
    boolean existsByCropIdAndUserIdAndStatusIgnoreCaseAndActiveTrue(Long cropId, Long userId, String status);

    @Transactional
    @Modifying
    @Query("""
            UPDATE ApproachFarmer a
            SET a.active = false, a.deletedAt = :deletedAt
            WHERE a.userId = :farmerId
              AND a.active = true
            """)
    int softDeleteByUserId(@Param("farmerId") Long farmerId, @Param("deletedAt") LocalDateTime deletedAt);

    @Transactional
    @Modifying
    @Query("""
            UPDATE ApproachFarmer a
            SET a.active = false, a.deletedAt = :deletedAt
            WHERE a.farmerId = :farmerId
              AND a.active = true
            """)
    int softDeleteByFarmerId(@Param("farmerId") Long farmerId, @Param("deletedAt") LocalDateTime deletedAt);

    @Transactional
    @Modifying
    @Query("""
            UPDATE ApproachFarmer a
            SET a.active = false, a.deletedAt = :deletedAt
            WHERE a.approachId = :approachId
              AND a.userId = :userId
              AND a.active = true
            """)
    int softDeleteByApproachIdAndUserId(@Param("approachId") Long approachId, @Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);

    @Transactional
    @Modifying
    @Query("""
            UPDATE ApproachFarmer a
            SET a.active = false, a.deletedAt = :deletedAt
            WHERE a.cropId = :cropId
              AND a.active = true
            """)
    int softDeleteByCropId(@Param("cropId") Long cropId, @Param("deletedAt") LocalDateTime deletedAt);

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.approach.ApproachRequestDTO(
                        a.approachId,
                        a.cropId,
                        a.cropName,
                        a.farmerId,
                        a.farmerName,
                        a.userId,
                        a.userName,
                        a.requestedQuantity,
                        a.status
                    )
                    FROM ApproachFarmer a
                    WHERE a.farmerId = :farmerId
                      AND a.active = true
                      AND a.deletedAt IS NULL
                      AND EXISTS (SELECT 1 FROM Farmer f WHERE f.farmerId = a.farmerId AND f.active = true)
                      AND EXISTS (SELECT 1 FROM Farmer u WHERE u.farmerId = a.userId AND u.active = true)
                      AND EXISTS (SELECT 1 FROM Crop c WHERE c.cropID = a.cropId AND c.active = true AND c.deletedAt IS NULL AND c.farmer.active = true)
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """,
            countQuery = """
                    SELECT COUNT(a)
                    FROM ApproachFarmer a
                    WHERE a.farmerId = :farmerId
                      AND a.active = true
                      AND a.deletedAt IS NULL
                      AND EXISTS (SELECT 1 FROM Farmer f WHERE f.farmerId = a.farmerId AND f.active = true)
                      AND EXISTS (SELECT 1 FROM Farmer u WHERE u.farmerId = a.userId AND u.active = true)
                      AND EXISTS (SELECT 1 FROM Crop c WHERE c.cropID = a.cropId AND c.active = true AND c.deletedAt IS NULL AND c.farmer.active = true)
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
                    SELECT new com.MyWebpage.register.login.approach.ApproachRequestDTO(
                        a.approachId,
                        a.cropId,
                        a.cropName,
                        a.farmerId,
                        a.farmerName,
                        a.userId,
                        a.userName,
                        a.requestedQuantity,
                        a.status
                    )
                    FROM ApproachFarmer a
                    WHERE a.farmerId = :farmerId
                      AND a.cropId = :cropId
                      AND a.active = true
                      AND a.deletedAt IS NULL
                      AND EXISTS (SELECT 1 FROM Farmer f WHERE f.farmerId = a.farmerId AND f.active = true)
                      AND EXISTS (SELECT 1 FROM Farmer u WHERE u.farmerId = a.userId AND u.active = true)
                      AND EXISTS (SELECT 1 FROM Crop c WHERE c.cropID = a.cropId AND c.active = true AND c.deletedAt IS NULL AND c.farmer.active = true)
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """,
            countQuery = """
                    SELECT COUNT(a)
                    FROM ApproachFarmer a
                    WHERE a.farmerId = :farmerId
                      AND a.cropId = :cropId
                      AND a.active = true
                      AND a.deletedAt IS NULL
                      AND EXISTS (SELECT 1 FROM Farmer f WHERE f.farmerId = a.farmerId AND f.active = true)
                      AND EXISTS (SELECT 1 FROM Farmer u WHERE u.farmerId = a.userId AND u.active = true)
                      AND EXISTS (SELECT 1 FROM Crop c WHERE c.cropID = a.cropId AND c.active = true AND c.deletedAt IS NULL AND c.farmer.active = true)
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
                    SELECT new com.MyWebpage.register.login.approach.ApproachRequestDTO(
                        a.approachId,
                        a.cropId,
                        a.cropName,
                        a.farmerId,
                        a.farmerName,
                        a.userId,
                        a.userName,
                        a.requestedQuantity,
                        a.status
                    )
                    FROM ApproachFarmer a
                    WHERE a.userId = :userId
                      AND a.active = true
                      AND a.deletedAt IS NULL
                      AND EXISTS (SELECT 1 FROM Farmer f WHERE f.farmerId = a.farmerId AND f.active = true)
                      AND EXISTS (SELECT 1 FROM Farmer u WHERE u.farmerId = a.userId AND u.active = true)
                      AND EXISTS (SELECT 1 FROM Crop c WHERE c.cropID = a.cropId AND c.active = true AND c.deletedAt IS NULL AND c.farmer.active = true)
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """,
            countQuery = """
                    SELECT COUNT(a)
                    FROM ApproachFarmer a
                    WHERE a.userId = :userId
                      AND a.active = true
                      AND a.deletedAt IS NULL
                      AND EXISTS (SELECT 1 FROM Farmer f WHERE f.farmerId = a.farmerId AND f.active = true)
                      AND EXISTS (SELECT 1 FROM Farmer u WHERE u.farmerId = a.userId AND u.active = true)
                      AND EXISTS (SELECT 1 FROM Crop c WHERE c.cropID = a.cropId AND c.active = true AND c.deletedAt IS NULL AND c.farmer.active = true)
                      AND (:status IS NULL OR lower(a.status) = lower(:status))
                    """
    )
    Page<ApproachRequestDTO> findRequestViewsByUserId(
            @Param("userId") Long userId,
            @Param("status") String status,
            Pageable pageable
    );
}
