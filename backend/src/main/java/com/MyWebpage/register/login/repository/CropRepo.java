package com.MyWebpage.register.login.repository;

import com.MyWebpage.register.login.model.Crop;
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
                    SELECT c FROM Crop c
                    WHERE (:farmerId IS NULL OR c.farmer.farmerId = :farmerId)
                      AND (:keyword IS NULL
                           OR lower(c.cropName) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(c.cropType) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(c.region) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :keyword, '%')))
                      AND (:region IS NULL OR lower(c.region) LIKE lower(concat('%', :region, '%')))
                      AND (:category IS NULL OR lower(c.cropType) LIKE lower(concat('%', :category, '%')))
                      AND (:maxPrice IS NULL OR c.marketPrice <= :maxPrice)
                      AND (:farmerName IS NULL
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :farmerName, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(c) FROM Crop c
                    WHERE (:farmerId IS NULL OR c.farmer.farmerId = :farmerId)
                      AND (:keyword IS NULL
                           OR lower(c.cropName) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(c.cropType) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(c.region) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :keyword, '%')))
                      AND (:region IS NULL OR lower(c.region) LIKE lower(concat('%', :region, '%')))
                      AND (:category IS NULL OR lower(c.cropType) LIKE lower(concat('%', :category, '%')))
                      AND (:maxPrice IS NULL OR c.marketPrice <= :maxPrice)
                      AND (:farmerName IS NULL
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :farmerName, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :farmerName, '%')))
                    """
    )
    Page<Crop> findFilteredCrops(
            @Param("farmerId") Long farmerId,
            @Param("keyword") String keyword,
            @Param("region") String region,
            @Param("category") String category,
            @Param("maxPrice") Double maxPrice,
            @Param("farmerName") String farmerName,
            Pageable pageable);

    List<Crop> findByCropName(String cropName);

    Page<Crop> findByCropNameContaining(String keyword, Pageable pageable);

    Page<Crop> findByCropNameContainingIgnoreCase(String keyword, Pageable pageable);

    @Transactional
    @Modifying
    @Query("DELETE FROM Crop c WHERE c.farmer.farmerId = :farmerId")
    void deleteByFarmerId(@Param("farmerId") Long farmerId);

    Crop findByCropID(Long productId);
}
