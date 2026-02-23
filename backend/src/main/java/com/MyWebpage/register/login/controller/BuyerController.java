package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.AuthRequestDTO;
import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.BuyerRequestDTO;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.model.ResetPasswordRequest;
import com.MyWebpage.register.login.security.jwt.JWTService;
import com.MyWebpage.register.login.service.BuyerService;
import com.MyWebpage.register.login.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/buyers")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class BuyerController {

    private final BuyerService buyerService;
    private final EmailService emailService;
    private final JWTService jwtService;

    public BuyerController(BuyerService buyerService, EmailService emailService, JWTService jwtService) {
        this.buyerService = buyerService;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    @PostMapping("/resetpassword")
    public ResponseEntity<String> resetpassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        return buyerService.resetPassword(resetPasswordRequest.getEmail(), resetPasswordRequest.getNewPassword());
    }

    @PostMapping("/register")
    public ResponseEntity<Farmer> registerBuyer(@Valid @RequestBody BuyerRequestDTO dto) {
        Farmer buyer = toBuyer(dto);
        buyer.setRole("BUYER");
        ResponseEntity<Farmer> response = buyerService.register(buyer);
        if (!response.getStatusCode().equals(HttpStatus.OK) || response.getBody() == null) {
            return response;
        }

        String role = "SELLER".equals(response.getBody().getRole()) ? "Farmer" : "Trader";
        String subject = "Welcome to AggriGgate - Registration Successful";
        String msg = "Dear " + role + ",\n\n"
                + "Congratulations! Your registration with AggriGgate was successful.\n\n"
                + "Best regards,\nAggriGgate Team";
        emailService.sendMail(response.getBody().getEmail(), msg, subject);
        return response;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> loginBuyer(@Valid @RequestBody AuthRequestDTO requestDTO) {
        try {
            Farmer buyer = new Farmer();
            buyer.setUsername(requestDTO.getPrincipal());
            buyer.setPassword(requestDTO.getPassword());
            AuthResponseDTO authResponse = buyerService.verify(buyer);
            if ("SELLER".equals(authResponse.getRole())) {
                return new ResponseEntity<>(new AuthResponseDTO(), HttpStatus.UNAUTHORIZED);
            }
            return new ResponseEntity<>(authResponse, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new AuthResponseDTO(), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/{farmerId}")
    public ResponseEntity<Farmer> findBuyerById(@PathVariable Long farmerId) {
        Farmer buyer = buyerService.find(farmerId);
        if (buyer == null || "SELLER".equals(buyer.getRole())) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(buyer, HttpStatus.OK);
    }

    @PutMapping("/{farmerId}")
    public ResponseEntity<String> updateBuyer(@RequestBody Farmer buyer, @PathVariable Long farmerId) {
        buyer.setFarmerId(farmerId);
        Farmer updated = buyerService.update(buyer);
        return updated != null
                ? new ResponseEntity<>("Update successful", HttpStatus.OK)
                : new ResponseEntity<>("Buyer not found", HttpStatus.NOT_FOUND);
    }

    @DeleteMapping
    public ResponseEntity<String> delete(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        return buyerService.delete(resetPasswordRequest.getCurrentPassword(), resetPasswordRequest.getFarmerId());
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ResetPasswordRequest resetPasswordRequest,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            return buyerService.changePassword(
                    email,
                    resetPasswordRequest.getFarmerId(),
                    resetPasswordRequest.getCurrentPassword(),
                    resetPasswordRequest.getNewPassword());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while changing the password.");
        }
    }

    @GetMapping("/welcome")
    public String welcomeBuyer() {
        return "Hi, Buyer!";
    }

    private Farmer toBuyer(BuyerRequestDTO dto) {
        Farmer buyer = new Farmer();
        buyer.setUsername(dto.getUsername());
        buyer.setFirstName(dto.getFirstName());
        buyer.setLastName(dto.getLastName());
        buyer.setEmail(dto.getEmail());
        buyer.setPhoneNo(dto.getPhoneNo());
        buyer.setPassword(dto.getPassword());
        return buyer;
    }
}
