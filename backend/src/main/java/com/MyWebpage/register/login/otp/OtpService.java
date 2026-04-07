package com.MyWebpage.register.login.otp;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class OtpService {

    private static final int DEFAULT_OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 5;
    private final OtpTokenRepository otpTokenRepository;

    public String issueOtp(String principal, OtpPurpose purpose) {
        String normalizedPrincipal = normalizePrincipal(principal);
        String otp = generateOtp(DEFAULT_OTP_LENGTH);
        otpTokenRepository.deleteByPrincipalAndPurpose(normalizedPrincipal, purpose);

        OtpToken token = new OtpToken();
        token.setPrincipal(normalizedPrincipal);
        token.setPurpose(purpose);
        token.setCode(otp);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        token.setVerified(false);
        token.setCreatedAt(LocalDateTime.now());
        otpTokenRepository.save(token);

        return otp;
    }

    public boolean verifyOtp(String principal, OtpPurpose purpose, String otp) {
        Optional<OtpToken> latestOtp = otpTokenRepository.findByPrincipalAndPurpose(
                normalizePrincipal(principal),
                purpose
        );
        if (latestOtp.isEmpty()) {
            return false;
        }

        OtpToken otpToken = latestOtp.get();
        if (otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            clearOtp(principal, purpose);
            return false;
        }

        if (otpToken.getCode().equals(otp)) {
            otpToken.setVerified(true);
            otpTokenRepository.save(otpToken);
            return true;
        }

        return false;
    }

    public boolean verifyAndConsumeOtp(String principal, OtpPurpose purpose, String otp) {
        boolean verified = verifyOtp(principal, purpose, otp);
        if (verified) {
            clearOtp(principal, purpose);
        }
        return verified;
    }

    public void clearOtp(String principal, OtpPurpose purpose) {
        otpTokenRepository.deleteByPrincipalAndPurpose(normalizePrincipal(principal), purpose);
    }

    public boolean isOtpVerified(String principal, OtpPurpose purpose) {
        Optional<OtpToken> latestOtp = otpTokenRepository.findByPrincipalAndPurpose(
                normalizePrincipal(principal),
                purpose
        );
        if (latestOtp.isEmpty()) {
            return false;
        }

        OtpToken otpToken = latestOtp.get();
        if (otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            clearOtp(principal, purpose);
            return false;
        }

        return otpToken.isVerified();
    }

    public void setOtpVerified(String principal, OtpPurpose purpose, boolean status) {
        Optional<OtpToken> latestOtp = otpTokenRepository.findByPrincipalAndPurpose(
                normalizePrincipal(principal),
                purpose
        );
        if (latestOtp.isPresent()) {
            OtpToken otpToken = latestOtp.get();
            otpToken.setVerified(status);
            otpTokenRepository.save(otpToken);
        }
    }

    private String normalizePrincipal(String principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Principal is required");
        }
        return principal.trim().toLowerCase(Locale.ROOT);
    }

    private String generateOtp(int length) {
        int lowerBound = (int) Math.pow(10, length - 1);
        int upperBound = (int) Math.pow(10, length) - lowerBound;
        return String.valueOf(lowerBound + new Random().nextInt(upperBound));
    }
}
