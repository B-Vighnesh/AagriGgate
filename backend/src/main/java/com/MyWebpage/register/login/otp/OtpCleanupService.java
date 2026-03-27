package com.MyWebpage.register.login.otp;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpCleanupService {

    private final RegistrationOtpRepository registrationOtpRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final LoginOtpRepository loginOtpRepository;

    // Periodically purge expired OTP rows so stale records do not accumulate.
    @Scheduled(cron = "0 */15 * * * *")
    public void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        registrationOtpRepository.deleteByExpiryTimeBefore(now);
        passwordResetOtpRepository.deleteByExpiryTimeBefore(now);
        loginOtpRepository.deleteByExpiryTimeBefore(now);
    }
}
