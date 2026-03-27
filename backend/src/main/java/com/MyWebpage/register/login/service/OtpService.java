package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.otp.RegistrationOtp;
import com.MyWebpage.register.login.otp.RegistrationOtpRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class OtpService {

    private static final int OTP_EXPIRATION_MINUTES = 5;
    private final RegistrationOtpRepository registrationOtpRepository;

    public void storeOtp(String email, int otp) {
        registrationOtpRepository.deleteByEmail(email);

        RegistrationOtp registrationOtp = new RegistrationOtp();
        registrationOtp.setEmail(email);
        registrationOtp.setOtp(String.valueOf(otp));
        registrationOtp.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        registrationOtp.setVerified(false);
        registrationOtpRepository.save(registrationOtp);
    }

    public boolean verifyOtp(String email, int otp) {
        Optional<RegistrationOtp> latestOtp = registrationOtpRepository.findTopByEmailOrderByIdDesc(email);
        if (latestOtp.isEmpty()) {
            return false;
        }

        RegistrationOtp registrationOtp = latestOtp.get();
        if (registrationOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            clearOtp(email);
            return false;
        }

        if (registrationOtp.getOtp().equals(String.valueOf(otp))) {
            registrationOtp.setVerified(true);
            registrationOtpRepository.save(registrationOtp);
            return true;
        }

        return false;
    }

    public void clearOtp(String email) {
        registrationOtpRepository.deleteByEmail(email);
    }

    public boolean isOtpVerified(String email) {
        Optional<RegistrationOtp> latestOtp = registrationOtpRepository.findTopByEmailOrderByIdDesc(email);
        if (latestOtp.isEmpty()) {
            return false;
        }

        RegistrationOtp registrationOtp = latestOtp.get();
        if (registrationOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            clearOtp(email);
            return false;
        }

        return registrationOtp.isVerified();
    }

    public void setOtpVerifiedMap(String email, boolean status) {
        Optional<RegistrationOtp> latestOtp = registrationOtpRepository.findTopByEmailOrderByIdDesc(email);
        if (latestOtp.isPresent()) {
            RegistrationOtp registrationOtp = latestOtp.get();
            registrationOtp.setVerified(status);
            registrationOtpRepository.save(registrationOtp);
        }
    }
}
