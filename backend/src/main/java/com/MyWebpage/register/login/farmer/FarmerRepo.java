package com.MyWebpage.register.login.farmer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface FarmerRepo extends JpaRepository<Farmer,Long> {

    Farmer findByFarmerId(Long farmerId);

    void deleteById(Long farmerId);
    @Query(value = "select next_val from farmer_sequence", nativeQuery = true)
    Long getNextUserSequence();
    Farmer findByUsername(String username);

    void deleteByUsername(String username);

    Optional<Farmer> findByEmail(String email);

    Optional<Farmer> findByEmailAndActiveTrue(String email);

    void deleteByFarmerId(Long farmerId);

    boolean existsByEmail(@Email @NotBlank String email);

    boolean existsByEmailAndActiveTrue(@Email @NotBlank String email);

    Farmer findByUsernameAndActiveTrue(String principal);

    @Query("select f.farmerId from Farmer f where f.active = true")
    List<Long> findActiveUserIds();

    @Query("select f.farmerId from Farmer f where f.active = true and lower(f.district) = lower(:district)")
    List<Long> findActiveUserIdsByDistrict(@Param("district") String district);

    @Query("select f.farmerId from Farmer f where f.active = true and lower(f.state) = lower(:state)")
    List<Long> findActiveUserIdsByState(@Param("state") String state);
}
