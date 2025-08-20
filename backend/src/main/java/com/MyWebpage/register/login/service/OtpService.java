package com.MyWebpage.register.login.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class OtpService {

    private static final int OTP_EXPIRATION_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 3;

    private Map<String, Integer> otpStore = new HashMap<>();
    private Map<String, LocalDateTime> otpExpiryMap = new HashMap<>();
    private Map<String, Integer> otpAttemptsMap = new HashMap<>();
    private Map<String, Boolean> otpVerifiedMap = new HashMap<>();
private int value;

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public void storeOtp(String email, int otp) {
        otpStore.put(email, otp);
        otpExpiryMap.put(email, LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        otpAttemptsMap.put(email, 0); // Reset attempts
        otpVerifiedMap.put(email, false);
    }

    public boolean verifyOtp(String email, int otp) {
        if (!otpStore.containsKey(email)) {
            return false;
        }

        LocalDateTime expiryTime = otpExpiryMap.get(email);
        if (expiryTime.isBefore(LocalDateTime.now())) {
            clearOtp(email);
            return false;
        }

        int attempts = otpAttemptsMap.getOrDefault(email, 0);
        if (attempts >= MAX_ATTEMPTS) {
            clearOtp(email);
            return false;
        }

        if (otpStore.get(email).equals(otp)) {
            otpVerifiedMap.put(email, true);
            clearOtp(email);
            return true;
        } else {
            otpAttemptsMap.put(email, attempts + 1);
            return false;
        }
    }

    public void clearOtp(String email) {
        otpStore.remove(email);
        otpExpiryMap.remove(email);
        otpAttemptsMap.remove(email);
        otpVerifiedMap.remove(email);
    }

    public boolean isOtpVerified(String email) {
        return otpVerifiedMap.getOrDefault(email, false); // Return false if no entry exists
    }

    public Map<String, LocalDateTime> getOtpExpiryMap() {
        return otpExpiryMap;
    }

    public void setOtpExpiryMap(Map<String, LocalDateTime> otpExpiryMap) {
        this.otpExpiryMap = otpExpiryMap;
    }

    public Map<String, Integer> getOtpStore() {
        return otpStore;
    }

    public void setOtpStore(Map<String, Integer> otpStore) {
        this.otpStore = otpStore;
    }

    public Map<String, Integer> getOtpAttemptsMap() {
        return otpAttemptsMap;
    }

    public void setOtpAttemptsMap(Map<String, Integer> otpAttemptsMap) {
        this.otpAttemptsMap = otpAttemptsMap;
    }

    public Map<String, Boolean> getOtpVerifiedMap() {
        return otpVerifiedMap;
    }

    public void setOtpVerifiedMap(String email, boolean status) {
        this.otpVerifiedMap.put(email, status);
    }
    @Override
    public String toString() {
        return "OtpService{" +
                "otpStore=" + otpStore +
                ", otpExpiryMap=" + otpExpiryMap +
                ", otpAttemptsMap=" + otpAttemptsMap +
                ", otpVerifiedMap=" + otpVerifiedMap +
                ", value=" + value +
                '}';
    }
}
