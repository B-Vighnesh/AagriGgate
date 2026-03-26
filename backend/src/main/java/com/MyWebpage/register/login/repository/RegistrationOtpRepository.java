package com.MyWebpage.register.login.repository;

import com.MyWebpage.register.login.entity.RegistrationOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RegistrationOtpRepository extends JpaRepository<RegistrationOtp, Long> {

    Optional<RegistrationOtp> findTopByEmailOrderByIdDesc(String email);

    void deleteByEmail(String email);

    void deleteByExpiryTimeBefore(LocalDateTime time);
}
