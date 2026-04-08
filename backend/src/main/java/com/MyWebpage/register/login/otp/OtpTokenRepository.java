package com.MyWebpage.register.login.otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    Optional<OtpToken> findTopByPrincipalAndPurposeOrderByIdDesc(String principal, OtpPurpose purpose);

    void deleteByPrincipalAndPurpose(String principal, OtpPurpose purpose);

    void deleteByExpiresAtBefore(LocalDateTime time);
}
