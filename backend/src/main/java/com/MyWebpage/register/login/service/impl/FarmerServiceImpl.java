package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.ApproachFarmerRepo;
import com.MyWebpage.register.login.repository.CropRepo;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.security.jwt.JWTService;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.FarmerService;
import com.MyWebpage.register.login.service.OtpService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class FarmerServiceImpl implements FarmerService {

    private static final Logger logger = LoggerFactory.getLogger(FarmerServiceImpl.class);

    private final FarmerRepo farmerRepo;
    private final JWTService jwtService;
    private final ApproachFarmerRepo approachFarmerRepository;
    private final AuthenticationManager authenticationManager;
    private final CropRepo cropRepo;
    private final OtpService otpService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    public FarmerServiceImpl(
            FarmerRepo farmerRepo,
            JWTService jwtService,
            ApproachFarmerRepo approachFarmerRepository,
            AuthenticationManager authenticationManager,
            CropRepo cropRepo,
            OtpService otpService,
            EmailService emailService) {
        this.farmerRepo = farmerRepo;
        this.jwtService = jwtService;
        this.approachFarmerRepository = approachFarmerRepository;
        this.authenticationManager = authenticationManager;
        this.cropRepo = cropRepo;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public ResponseEntity<Farmer> register(Farmer farmer) {
        if (farmerRepo.findByEmail(farmer.getEmail()) != null) {
            logger.info("Registration conflict for email: {}", farmer.getEmail());
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        boolean isOtpVerified = otpService.isOtpVerified(farmer.getEmail());
        if (!isOtpVerified) {
            logger.info("Registration rejected due to OTP not verified: {}", farmer.getEmail());
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        otpService.setOtpVerifiedMap(farmer.getEmail(), false);
        farmer.setPassword(bCryptPasswordEncoder.encode(farmer.getPassword()));
        Long farmerId = farmerRepo.getNextUserSequence();
        farmer.setUsername(farmer.getFirstName() + farmerId);
        farmerRepo.save(farmer);

        logger.info("Farmer registered: {}", farmer.getFarmerId());
        return new ResponseEntity<>(farmer, HttpStatus.OK);
    }

    @Override
    @Transactional
    public AuthResponseDTO verify(Farmer farmer) {
        String principal = farmer.getUsername();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(principal, farmer.getPassword()));

            if (authentication.isAuthenticated()) {
                Farmer verifiedFarmer = principal.contains("@")
                        ? farmerRepo.findByEmail(principal)
                        : farmerRepo.findByUsername(principal);

                if (verifiedFarmer == null) {
                    throw new BadCredentialsException("Authentication failed for user: " + principal);
                }

                String token = jwtService.generateToken(verifiedFarmer.getUsername(), verifiedFarmer.getRole());
                AuthResponseDTO responseDTO = new AuthResponseDTO();
                responseDTO.setToken(token);
                responseDTO.setRole(verifiedFarmer.getRole());
                responseDTO.setFarmerId(verifiedFarmer.getFarmerId());
                logger.info("Authentication successful for principal: {}", principal);
                return responseDTO;
            }
        } catch (Exception e) {
            logger.error("Registration failed", e);
            throw new BadCredentialsException("Authentication failed for user: " + principal);
        }

        throw new BadCredentialsException("Authentication failed for user: " + principal);
    }

    @Override
    @Transactional
    public ResponseEntity<String> changePassword(String email, Long farmerId, String currentPassword, String newPassword) {
        Farmer farmer = farmerRepo.findByFarmerId(farmerId);
        if (farmer == null) {
            return new ResponseEntity<>("Farmer not found", HttpStatus.NOT_FOUND);
        }

        if (!bCryptPasswordEncoder.matches(currentPassword, farmer.getPassword())) {
            return new ResponseEntity<>("Current password is incorrect", HttpStatus.UNAUTHORIZED);
        }

        farmer.setPassword(bCryptPasswordEncoder.encode(newPassword));
        farmerRepo.save(farmer);
        String subject = "Your Password Has Been Reset Successfully";
        String msg = "Dear User,\n\n"
                + "Your password has been successfully reset.\n\n"
                + "If you did not request this, secure your account immediately.\n\n"
                + "Thank you,\nAggriGgate";
        emailService.sendMail(farmer.getEmail(), msg, subject);
        logger.info("Password changed for farmerId: {}", farmerId);
        return new ResponseEntity<>("Password changed successfully", HttpStatus.OK);
    }

    @Override
    @Transactional
    public ResponseEntity<String> delete(String password, Long farmerId) {
        Farmer farmer = farmerRepo.findByFarmerId(farmerId);
        if (farmer == null) {
            return new ResponseEntity<>("Farmer not found", HttpStatus.NOT_FOUND);
        }

        if (!bCryptPasswordEncoder.matches(password, farmer.getPassword())) {
            return new ResponseEntity<>("Current password is incorrect", HttpStatus.UNAUTHORIZED);
        }

        if ("BUYER".equals(farmer.getRole())) {
            approachFarmerRepository.deleteByUserId(farmerId);
        } else if ("SELLER".equals(farmer.getRole())) {
            approachFarmerRepository.deleteByFarmerId(farmerId);
            cropRepo.deleteByFarmerId(farmerId);
        }

        farmerRepo.deleteByFarmerId(farmerId);
        logger.info("Farmer deleted: {}", farmerId);
        return ResponseEntity.ok("success");
    }

    @Override
    public String logout() {
        return "loggedout";
    }

    @Override
    @Transactional
    public Farmer update(Farmer farmer, String emailFromJwt) {

        Farmer existingFarmer =
                farmerRepo.findByEmail(emailFromJwt)
                        .orElseThrow(() ->
                                new RuntimeException("Farmer not found"));

        if (farmer.getFirstName() != null) {
            existingFarmer.setFirstName(farmer.getFirstName());
        }

        if (farmer.getLastName() != null) {
            existingFarmer.setLastName(farmer.getLastName());
        }

        if (farmer.getPhoneNo() != null) {
            existingFarmer.setPhoneNo(farmer.getPhoneNo());
        }

        if (farmer.getState() != null) {
            existingFarmer.setState(farmer.getState());
        }

        logger.info("Farmer profile updated: {}", existingFarmer.getFarmerId());

        return farmerRepo.save(existingFarmer);
    }

    @Override
    public String login() {
        return "hi";
    }

    @Override
    public Farmer find(Long farmerId) {
        return farmerRepo.findByFarmerId(farmerId);
    }

    @Override
    public Boolean findEmail(String email) {
        return farmerRepo.findByEmail(email) != null;
    }

    @Override
    public Farmer findByEmail(String email) {
        return farmerRepo.findByEmail(email);
    }

    @Override
    public Farmer findByUsername(String username) {
        return farmerRepo.findByUsername(username);
    }

    @Override
    @Transactional
    public ResponseEntity<String> resetPassword(String email, String newPassword) {
        Farmer farmer = farmerRepo.findByEmail(email);
        if (farmer == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        boolean isOtpVerified = otpService.isOtpVerified(email);
        if (!isOtpVerified) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        otpService.setOtpVerifiedMap(email, false);
        farmer.setPassword(bCryptPasswordEncoder.encode(newPassword));
        farmerRepo.save(farmer);
        logger.info("Password reset via OTP for email: {}", email);
        return new ResponseEntity<>("success", HttpStatus.OK);
    }
}
