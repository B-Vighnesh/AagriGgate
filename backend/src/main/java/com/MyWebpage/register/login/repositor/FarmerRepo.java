package com.MyWebpage.register.login.repositor;

import com.MyWebpage.register.login.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmerRepo extends JpaRepository<Farmer,Long> {

    Farmer findByFarmerId(Long farmerId);

    void deleteById(Long farmerId);
    @Query(value = "select next_val from farmer_sequence", nativeQuery = true)
    Long getNextUserSequence();
    Farmer findByUsername(String username);

    void deleteByUsername(String username);

    Farmer findByEmail(String email);

    void deleteByFarmerId(Long farmerId);
}
