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

@Repository
public interface CropRepo extends JpaRepository<Crop,Long> {
    @Query("SELECT c FROM Crop c WHERE c.farmer.farmerId = :farmerId ORDER BY c.cropID DESC")
    List<Crop> findByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT c FROM Crop c WHERE c.farmer.farmerId = :farmerId")
    Page<Crop> findPageByFarmerId(@Param("farmerId") Long farmerId, Pageable pageable);

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.dto.CropViewDTO(
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
            SELECT new com.MyWebpage.register.login.dto.CropViewDTO(
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
            """)
    CropViewDTO findCropViewById(@Param("cropId") Long cropId, @Param("currentUserId") Long currentUserId);

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.dto.CropResponseDTO(
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
            SELECT new com.MyWebpage.register.login.dto.CropResponseDTO(
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
            """)
    CropResponseDTO findCropResponseById(@Param("cropId") Long cropId);

    List<Crop> findByCropName(String cropName);

    Page<Crop> findByCropNameContaining(String keyword, Pageable pageable);

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.dto.CropResponseDTO(
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
                    """,
            countQuery = """
                    SELECT COUNT(c) FROM Crop c
                    WHERE lower(c.cropName) LIKE lower(concat('%', :keyword, '%'))
                    """
    )
    Page<CropResponseDTO> searchCropResponses(@Param("keyword") String keyword, Pageable pageable);

    @Transactional
    @Modifying
    @Query("DELETE FROM Crop c WHERE c.farmer.farmerId = :farmerId")
    void deleteByFarmerId(@Param("farmerId") Long farmerId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Crop c WHERE lower(coalesce(c.status, '')) = 'sold'")
    int deleteSoldCrops();

    Crop findByCropID(Long productId);
}
