package com.MyWebpage.register.login.otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
@Deprecated
// Legacy repository kept only as a migration reference. Universal OTP now uses OtpTokenRepository.
public interface RegistrationOtpRepository extends JpaRepository<RegistrationOtp, Long> {

    Optional<RegistrationOtp> findTopByEmailOrderByIdDesc(String email);

    void deleteByEmail(String email);

    void deleteByExpiryTimeBefore(LocalDateTime time);
}
