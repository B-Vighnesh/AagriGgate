package com.MyWebpage.register.login.repositor;

import com.MyWebpage.register.login.model.Crop;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRepo extends JpaRepository<Crop,Long> {
    @Query("SELECT c FROM Crop c WHERE c.farmer.farmerId = :farmerId")
    List<Crop> findByFarmerId(Long farmerId);

    List<Crop> findByCropName(String cropName);
    @Transactional
    @Modifying
    @Query("DELETE FROM Crop c WHERE c.farmer.farmerId = :farmerId")
    void deleteByFarmerId(@Param("farmerId") Long farmerId);

    Crop findByCropID(Long productId);
}
