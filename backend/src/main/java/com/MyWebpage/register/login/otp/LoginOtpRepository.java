package com.MyWebpage.register.login.otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface LoginOtpRepository extends JpaRepository<LoginOtp, Long> {

    Optional<LoginOtp> findTopByFarmerIdOrderByIdDesc(Long farmerId);

    void deleteByFarmerId(Long farmerId);

    void deleteByExpiryTimeBefore(LocalDateTime time);
}
