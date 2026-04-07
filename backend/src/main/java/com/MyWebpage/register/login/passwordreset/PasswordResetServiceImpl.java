package com.MyWebpage.register.login.passwordreset;

import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.common.EmailService;
import com.MyWebpage.register.login.otp.OtpPurpose;
import com.MyWebpage.register.login.otp.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private final FarmerRepo farmerRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpService otpService;

    @Override
    public void sendOtp(String email) {
        Farmer farmer = farmerRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not registered"));

        String otp = otpService.issueOtp(email, OtpPurpose.PASSWORD_RESET);
        emailService.sendPasswordResetOtpEmail(farmer, otp);
    }

    @Override
    public void verifyOtp(String email, String otp) {
        boolean verified = otpService.verifyOtp(email, OtpPurpose.PASSWORD_RESET, otp);
        if (!verified) {
            throw new RuntimeException("Invalid OTP");
        }
    }

    @Override
    public void resetPassword(String email, String newPassword) {
        if (!otpService.isOtpVerified(email, OtpPurpose.PASSWORD_RESET)) {
            throw new RuntimeException("OTP not verified");
        }

        Farmer farmer = farmerRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Email not registered"));
        farmer.setPassword(passwordEncoder.encode(newPassword));
        farmerRepo.save(farmer);

        otpService.clearOtp(email, OtpPurpose.PASSWORD_RESET);

        emailService.sendPasswordResetSuccessEmail(farmer);
    }
}
