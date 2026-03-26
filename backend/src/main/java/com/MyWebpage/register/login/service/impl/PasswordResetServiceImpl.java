package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.entity.PasswordResetOtp;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.repository.PasswordResetOtpRepository;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.PasswordResetService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private final PasswordResetOtpRepository otpRepository;
    private final FarmerRepo farmerRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public void sendOtp(String email) {
        Farmer farmer = farmerRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not registered"));

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(email);
        resetOtp.setOtp(otp);
        resetOtp.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        resetOtp.setVerified(false);

        otpRepository.save(resetOtp);
        emailService.sendPasswordResetOtpEmail(farmer, otp);
    }

    @Override
    public void verifyOtp(String email, String otp) {
        PasswordResetOtp stored = otpRepository
                .findTopByEmailOrderByExpiryTimeDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!stored.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (stored.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        stored.setVerified(true);
        otpRepository.save(stored);
    }

    @Override
    public void resetPassword(String email, String newPassword) {
        PasswordResetOtp stored = otpRepository
                .findTopByEmailOrderByExpiryTimeDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!stored.isVerified()) {
            throw new RuntimeException("OTP not verified");
        }

        if (stored.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        Farmer farmer = farmerRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Email not registered"));
        farmer.setPassword(passwordEncoder.encode(newPassword));
        farmerRepo.save(farmer);

        // Invalidate OTP so it cannot be reused.
        stored.setVerified(false);
        otpRepository.save(stored);

        emailService.sendPasswordResetSuccessEmail(farmer);
    }
}
