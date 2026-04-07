package com.MyWebpage.register.login.crop;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface CropRepo extends JpaRepository<Crop,Long> {
    @Query("""
            SELECT c FROM Crop c
            WHERE c.farmer.farmerId = :farmerId
              AND c.active = true
              AND c.deletedAt IS NULL
              AND c.farmer.active = true
            ORDER BY c.cropID DESC
            """)
    List<Crop> findByFarmerId(@Param("farmerId") Long farmerId);

    @Query("""
            SELECT c FROM Crop c
            WHERE c.farmer.farmerId = :farmerId
              AND c.active = true
              AND c.deletedAt IS NULL
              AND c.farmer.active = true
            """)
    Page<Crop> findPageByFarmerId(@Param("farmerId") Long farmerId, Pageable pageable);

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.crop.CropViewDTO(
                        c.cropID,
                        c.cropName,
                        c.cropType,
                        c.region,
                        c.marketPrice,
                        c.quantity,
                        c.unit,
                        c.description,
                        c.postDate,
                        CASE
                            WHEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, ''))) <> ''
                            THEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, '')))
                            ELSE c.farmer.username
                        END,
                        CASE
                            WHEN :currentUserId IS NOT NULL AND c.farmer.farmerId = :currentUserId
                            THEN true
                            ELSE false
                        END,
                        c.isUrgent,
                        c.isWaste,
                        c.discountPrice,
                        c.status
                    )
                    FROM Crop c
                    WHERE (:farmerId IS NULL OR c.farmer.farmerId = :farmerId)
                      AND c.active = true
                      AND c.deletedAt IS NULL
                      AND c.farmer.active = true
                      AND (:keyword IS NULL
                           OR lower(c.cropName) LIKE lower(concat('%', :keyword, '%')))
                      AND (:region IS NULL OR lower(c.region) LIKE lower(concat('%', :region, '%')))
                      AND (:category IS NULL OR lower(c.cropType) LIKE lower(concat('%', :category, '%')))
                      AND (:maxPrice IS NULL OR c.marketPrice <= :maxPrice)
                      AND (:urgentOnly IS NULL OR c.isUrgent = :urgentOnly)
                      AND (:wasteOnly IS NULL OR c.isWaste = :wasteOnly)
                      AND (:normalOnly IS NULL OR (coalesce(c.isUrgent, false) = false AND coalesce(c.isWaste, false) = false))
                      AND (:discountOnly IS NULL OR coalesce(c.discountPrice, 0) > 0)
                      AND (:farmerName IS NULL
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :farmerName, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(c) FROM Crop c
                    WHERE (:farmerId IS NULL OR c.farmer.farmerId = :farmerId)
                      AND c.active = true
                      AND c.deletedAt IS NULL
                      AND c.farmer.active = true
                      AND (:keyword IS NULL
                           OR lower(c.cropName) LIKE lower(concat('%', :keyword, '%')))
                      AND (:region IS NULL OR lower(c.region) LIKE lower(concat('%', :region, '%')))
                      AND (:category IS NULL OR lower(c.cropType) LIKE lower(concat('%', :category, '%')))
                      AND (:maxPrice IS NULL OR c.marketPrice <= :maxPrice)
                      AND (:urgentOnly IS NULL OR c.isUrgent = :urgentOnly)
                      AND (:wasteOnly IS NULL OR c.isWaste = :wasteOnly)
                      AND (:normalOnly IS NULL OR (coalesce(c.isUrgent, false) = false AND coalesce(c.isWaste, false) = false))
                      AND (:discountOnly IS NULL OR coalesce(c.discountPrice, 0) > 0)
                      AND (:farmerName IS NULL
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :farmerName, '%')))
                    """
    )
    Page<CropViewDTO> findFilteredCropViews(
            @Param("currentUserId") Long currentUserId,
            @Param("farmerId") Long farmerId,
            @Param("keyword") String keyword,
            @Param("region") String region,
            @Param("category") String category,
            @Param("maxPrice") Double maxPrice,
            @Param("farmerName") String farmerName,
            @Param("urgentOnly") Boolean urgentOnly,
            @Param("wasteOnly") Boolean wasteOnly,
            @Param("normalOnly") Boolean normalOnly,
            @Param("discountOnly") Boolean discountOnly,
            Pageable pageable);

    @Query("""
            SELECT new com.MyWebpage.register.login.crop.CropViewDTO(
                c.cropID,
                c.cropName,
                c.cropType,
                c.region,
                c.marketPrice,
                c.quantity,
                c.unit,
                c.description,
                c.postDate,
                CASE
                    WHEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, ''))) <> ''
                    THEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, '')))
                    ELSE c.farmer.username
                END,
                CASE
                    WHEN :currentUserId IS NOT NULL AND c.farmer.farmerId = :currentUserId
                    THEN true
                    ELSE false
                END,
                c.isUrgent,
                c.isWaste,
                c.discountPrice,
                c.status
            )
            FROM Crop c
            WHERE c.cropID = :cropId
              AND c.active = true
              AND c.deletedAt IS NULL
              AND c.farmer.active = true
            """)
    CropViewDTO findCropViewById(@Param("cropId") Long cropId, @Param("currentUserId") Long currentUserId);

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.crop.CropResponseDTO(
                        c.cropID,
                        c.cropName,
                        c.cropType,
                        c.region,
                        c.marketPrice,
                        c.quantity,
                        c.unit,
                        c.description,
                        c.postDate,
                        CASE
                            WHEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, ''))) <> ''
                            THEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, '')))
                            ELSE c.farmer.username
                        END,
                        c.isUrgent,
                        c.isWaste,
                        c.discountPrice,
                        c.status
                    )
                    FROM Crop c
                    WHERE (:farmerId IS NULL OR c.farmer.farmerId = :farmerId)
                      AND c.active = true
                      AND c.deletedAt IS NULL
                      AND c.farmer.active = true
                      AND (:keyword IS NULL
                           OR lower(c.cropName) LIKE lower(concat('%', :keyword, '%')))
                      AND (:region IS NULL OR lower(c.region) LIKE lower(concat('%', :region, '%')))
                      AND (:category IS NULL OR lower(c.cropType) LIKE lower(concat('%', :category, '%')))
                      AND (:maxPrice IS NULL OR c.marketPrice <= :maxPrice)
                      AND (:urgentOnly IS NULL OR c.isUrgent = :urgentOnly)
                      AND (:wasteOnly IS NULL OR c.isWaste = :wasteOnly)
                      AND (:normalOnly IS NULL OR (coalesce(c.isUrgent, false) = false AND coalesce(c.isWaste, false) = false))
                      AND (:discountOnly IS NULL OR coalesce(c.discountPrice, 0) > 0)
                      AND (:farmerName IS NULL
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :farmerName, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(c) FROM Crop c
                    WHERE (:farmerId IS NULL OR c.farmer.farmerId = :farmerId)
                      AND c.active = true
                      AND c.deletedAt IS NULL
                      AND c.farmer.active = true
                      AND (:keyword IS NULL
                           OR lower(c.cropName) LIKE lower(concat('%', :keyword, '%')))
                      AND (:region IS NULL OR lower(c.region) LIKE lower(concat('%', :region, '%')))
                      AND (:category IS NULL OR lower(c.cropType) LIKE lower(concat('%', :category, '%')))
                      AND (:maxPrice IS NULL OR c.marketPrice <= :maxPrice)
                      AND (:urgentOnly IS NULL OR c.isUrgent = :urgentOnly)
                      AND (:wasteOnly IS NULL OR c.isWaste = :wasteOnly)
                      AND (:normalOnly IS NULL OR (coalesce(c.isUrgent, false) = false AND coalesce(c.isWaste, false) = false))
                      AND (:discountOnly IS NULL OR coalesce(c.discountPrice, 0) > 0)
                      AND (:farmerName IS NULL
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :farmerName, '%')))
                    """
    )
    Page<CropResponseDTO> findFilteredCropResponses(
            @Param("farmerId") Long farmerId,
            @Param("keyword") String keyword,
            @Param("region") String region,
            @Param("category") String category,
            @Param("maxPrice") Double maxPrice,
            @Param("farmerName") String farmerName,
            @Param("urgentOnly") Boolean urgentOnly,
            @Param("wasteOnly") Boolean wasteOnly,
            @Param("normalOnly") Boolean normalOnly,
            @Param("discountOnly") Boolean discountOnly,
            Pageable pageable);

    @Query("""
            SELECT new com.MyWebpage.register.login.crop.CropResponseDTO(
                c.cropID,
                c.cropName,
                c.cropType,
                c.region,
                c.marketPrice,
                c.quantity,
                c.unit,
                c.description,
                c.postDate,
                CASE
                    WHEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, ''))) <> ''
                    THEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, '')))
                    ELSE c.farmer.username
                END,
                c.isUrgent,
                c.isWaste,
                c.discountPrice,
                c.status
            )
            FROM Crop c
            WHERE c.cropID = :cropId
              AND c.active = true
              AND c.deletedAt IS NULL
              AND c.farmer.active = true
            """)
    CropResponseDTO findCropResponseById(@Param("cropId") Long cropId);

    @Query("""
            SELECT c FROM Crop c
            WHERE c.cropName = :cropName
              AND c.active = true
              AND c.deletedAt IS NULL
              AND c.farmer.active = true
            """)
    List<Crop> findByCropName(@Param("cropName") String cropName);

    @Query("""
            SELECT c FROM Crop c
            WHERE lower(c.cropName) LIKE lower(concat('%', :keyword, '%'))
              AND c.active = true
              AND c.deletedAt IS NULL
              AND c.farmer.active = true
            """)
    Page<Crop> findByCropNameContaining(@Param("keyword") String keyword, Pageable pageable);

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.crop.CropResponseDTO(
                        c.cropID,
                        c.cropName,
                        c.cropType,
                        c.region,
                        c.marketPrice,
                        c.quantity,
                        c.unit,
                        c.description,
                        c.postDate,
                        CASE
                            WHEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, ''))) <> ''
                            THEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, '')))
                            ELSE c.farmer.username
                        END,
                        c.isUrgent,
                        c.isWaste,
                        c.discountPrice,
                        c.status
                    )
                    FROM Crop c
                    WHERE lower(c.cropName) LIKE lower(concat('%', :keyword, '%'))
                      AND c.active = true
                      AND c.deletedAt IS NULL
                      AND c.farmer.active = true
                    """,
            countQuery = """
                    SELECT COUNT(c) FROM Crop c
                    WHERE lower(c.cropName) LIKE lower(concat('%', :keyword, '%'))
                      AND c.active = true
                      AND c.deletedAt IS NULL
                      AND c.farmer.active = true
                    """
    )
    Page<CropResponseDTO> searchCropResponses(@Param("keyword") String keyword, Pageable pageable);

    @Transactional
    @Modifying
    @Query("""
            UPDATE Crop c
            SET c.active = false, c.deletedAt = :deletedAt
            WHERE c.farmer.farmerId = :farmerId
              AND c.active = true
            """)
    int softDeleteByFarmerId(@Param("farmerId") Long farmerId, @Param("deletedAt") LocalDateTime deletedAt);

    @Transactional
    @Modifying
    @Query("""
            UPDATE Crop c
            SET c.active = false, c.deletedAt = :deletedAt
            WHERE c.cropID = :cropId
              AND c.farmer.farmerId = :farmerId
              AND c.active = true
            """)
    int softDeleteByIdAndFarmerId(@Param("cropId") Long cropId, @Param("farmerId") Long farmerId, @Param("deletedAt") LocalDateTime deletedAt);

    @Transactional
    @Modifying
    @Query("""
            UPDATE Crop c
            SET c.active = false, c.deletedAt = :deletedAt
            WHERE lower(coalesce(c.status, '')) = 'sold'
              AND c.active = true
            """)
    int softDeleteSoldCrops(@Param("deletedAt") LocalDateTime deletedAt);

    @Query("""
            SELECT c FROM Crop c
            WHERE c.cropID = :productId
              AND c.active = true
              AND c.deletedAt IS NULL
              AND c.farmer.active = true
            """)
    Crop findByCropID(@Param("productId") Long productId);
}
