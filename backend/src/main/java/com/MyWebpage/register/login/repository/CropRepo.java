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

    List<Crop> findByCropName(String cropName);

    Page<Crop> findByCropNameContaining(String keyword, Pageable pageable);

    Page<Crop> findByCropNameContainingIgnoreCase(String keyword, Pageable pageable);

    @Transactional
    @Modifying
    @Query("DELETE FROM Crop c WHERE c.farmer.farmerId = :farmerId")
    void deleteByFarmerId(@Param("farmerId") Long farmerId);

    Crop findByCropID(Long productId);
}
