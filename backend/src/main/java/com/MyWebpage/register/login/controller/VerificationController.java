package com.MyWebpage.register.login.controller;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.model.VerificationToken;
import com.MyWebpage.register.login.repositor.FarmerRepo;
import com.MyWebpage.register.login.repositor.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/users")
public class VerificationController {

    @Autowired
    private VerificationTokenRepository tokenRepository;


    @Autowired
    private FarmerRepo farmerRepository;

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
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
