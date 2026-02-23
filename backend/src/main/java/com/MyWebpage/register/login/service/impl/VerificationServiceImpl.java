package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.model.VerificationToken;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.repository.VerificationTokenRepository;
import com.MyWebpage.register.login.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VerificationServiceImpl implements VerificationService {

    private final VerificationTokenRepository tokenRepository;
    private final FarmerRepo farmerRepository;

    public VerificationServiceImpl(VerificationTokenRepository tokenRepository, FarmerRepo farmerRepository) {
        this.tokenRepository = tokenRepository;
        this.farmerRepository = farmerRepository;
    }

    @Override
    public ResponseEntity<String> verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token has expired!");
        }

        Farmer farmer = verificationToken.getFarmer();
        farmerRepository.save(farmer);
        tokenRepository.delete(verificationToken);
        return ResponseEntity.ok("Email verified successfully. You can now log in.");
    }
}
