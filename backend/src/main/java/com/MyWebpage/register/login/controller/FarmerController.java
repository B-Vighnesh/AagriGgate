package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.AuthRequestDTO;
import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerRequestDTO;
import com.MyWebpage.register.login.dto.FarmerResponseDTO;
import com.MyWebpage.register.login.dto.FarmerUpdateDTO;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.model.ResetPasswordRequest;
import com.MyWebpage.register.login.response.ApiResponse;
import com.MyWebpage.register.login.security.jwt.JWTService;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.FarmerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
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
@RequestMapping("/api/v1/farmers")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FarmerController {

    private final FarmerService farmerService;
    private final EmailService emailService;
    private final JWTService jwtService;

    public FarmerController(FarmerService farmerService, EmailService emailService, JWTService jwtService) {
        this.farmerService = farmerService;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    @GetMapping("/sessionid")
    public String login(HttpServletRequest request) {
        return farmerService.login() + " " + request.getSession().getId();
    }

    @GetMapping("/csrf")
    public CsrfToken getToken(HttpServletRequest request) {
        return (CsrfToken) request.getAttribute("_csrf");
    }

    @GetMapping("/{farmerId}")
    public ResponseEntity<Farmer> getFarmer(@PathVariable Long farmerId) {
        Farmer curFarmer = farmerService.find(farmerId);
        if (curFarmer == null || "BUYER".equals(curFarmer.getRole())) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(curFarmer, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO requestDTO) {
        try {
            Farmer farmer = new Farmer();
            farmer.setUsername(requestDTO.getPrincipal());
            farmer.setPassword(requestDTO.getPassword());
            AuthResponseDTO authResponse = farmerService.verify(farmer);
            if ("BUYER".equals(authResponse.getRole())) {
                return new ResponseEntity<>(new AuthResponseDTO(), HttpStatus.UNAUTHORIZED);
            }
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return new ResponseEntity<>(new AuthResponseDTO(), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Farmer> register(@Valid @RequestBody FarmerRequestDTO dto) {
        Farmer farmer = toFarmer(dto);
        farmer.setRole("SELLER");
        ResponseEntity<Farmer> response = farmerService.register(farmer);

        if (!response.getStatusCode().equals(HttpStatus.OK) || response.getBody() == null) {
            return response;
        }

        String to = response.getBody().getEmail();
        String role = "SELLER".equals(response.getBody().getRole()) ? "Farmer" : "Trader";
        String subject = "Welcome to AggriGgate - Registration Successful";
        String msg = "Dear " + role + ",\n\n"
                + "Congratulations! Your registration with AggriGgate was successful.\n\n"
                + "Best regards,\nAggriGgate Team";
        emailService.sendMail(to, msg, subject);
        return response;
    }

    @PostMapping("/resetpassword")
    public ResponseEntity<String> resetpassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        return farmerService.resetPassword(resetPasswordRequest.getEmail(), resetPasswordRequest.getNewPassword());
    }

    @DeleteMapping
    public ResponseEntity<String> delete(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        return farmerService.delete(resetPasswordRequest.getCurrentPassword(), resetPasswordRequest.getFarmerId());
    }

    @PutMapping("/{farmerId}")
    public ResponseEntity<Farmer> update(@RequestBody Farmer farmer, @PathVariable Long farmerId) {
        farmer.setFarmerId(farmerId);
        Farmer updatedFarmer = farmerService.update(farmer);
        if (updatedFarmer == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(updatedFarmer, HttpStatus.OK);
    }

    @PutMapping("/me")
    public ApiResponse<FarmerResponseDTO> updateProfile(
            @RequestBody FarmerUpdateDTO dto,
            Authentication authentication) {
        String username = authentication.getName();
        FarmerResponseDTO response = farmerService.updateProfile(dto, username);
        return ApiResponse.success("Profile updated", response);
    }

    @GetMapping("/findEmail/{email}")
    public Boolean findEmail(@PathVariable String email) {
        return farmerService.findEmail(email);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ResetPasswordRequest resetPasswordRequest,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtService.extractUsername(token.substring(7));

            return farmerService.changePassword(
                    username,
                    resetPasswordRequest.getFarmerId(),
                    resetPasswordRequest.getCurrentPassword(),
                    resetPasswordRequest.getNewPassword());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while changing the password.");
        }
    }

    private Farmer toFarmer(FarmerRequestDTO dto) {
        Farmer farmer = new Farmer();
        farmer.setUsername(dto.getUsername());
        farmer.setFirstName(dto.getFirstName());
        farmer.setLastName(dto.getLastName());
        farmer.setEmail(dto.getEmail());
        farmer.setState(dto.getState());
        farmer.setPhoneNo(dto.getPhoneNo());
        farmer.setPassword(dto.getPassword());
        return farmer;
    }
}
