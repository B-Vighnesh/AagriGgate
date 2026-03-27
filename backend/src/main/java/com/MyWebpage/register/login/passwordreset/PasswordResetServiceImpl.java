package com.MyWebpage.register.login.passwordreset;

import com.MyWebpage.register.login.otp.PasswordResetOtp;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.otp.PasswordResetOtpRepository;
import com.MyWebpage.register.login.common.EmailService;
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
        otpRepository.deleteByEmail(email);

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
                .findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!stored.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (stored.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.deleteByEmail(email);
            throw new RuntimeException("OTP expired");
        }

        stored.setVerified(true);
        otpRepository.save(stored);
    }

    @Override
    public void resetPassword(String email, String newPassword) {
        PasswordResetOtp stored = otpRepository
                .findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!stored.isVerified()) {
            throw new RuntimeException("OTP not verified");
        }

        if (stored.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.deleteByEmail(email);
            throw new RuntimeException("OTP expired");
        }

        Farmer farmer = farmerRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Email not registered"));
        farmer.setPassword(passwordEncoder.encode(newPassword));
        farmerRepo.save(farmer);

        otpRepository.deleteByEmail(email);

        emailService.sendPasswordResetSuccessEmail(farmer);
    }
}
