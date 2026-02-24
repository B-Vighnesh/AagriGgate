package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerResponseDTO;
import com.MyWebpage.register.login.dto.FarmerUpdateDTO;
import com.MyWebpage.register.login.mapper.FarmerMapper;
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
import org.springframework.util.StringUtils;

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
    private final FarmerMapper farmerMapper;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    public FarmerServiceImpl(
            FarmerRepo farmerRepo,
            JWTService jwtService,
            ApproachFarmerRepo approachFarmerRepository,
            AuthenticationManager authenticationManager,
            CropRepo cropRepo,
            OtpService otpService,
            EmailService emailService,
            FarmerMapper farmerMapper) {
        this.farmerRepo = farmerRepo;
        this.jwtService = jwtService;
        this.approachFarmerRepository = approachFarmerRepository;
        this.authenticationManager = authenticationManager;
        this.cropRepo = cropRepo;
        this.otpService = otpService;
        this.emailService = emailService;
        this.farmerMapper = farmerMapper;
    }

    @Override
    @Transactional
    public ResponseEntity<Farmer> register(Farmer farmer) {
        if (farmerRepo.findByEmail(farmer.getEmail()).isPresent()) {
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
                        ? farmerRepo.findByEmail(principal).orElse(null)
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
    public ResponseEntity<String> changePassword(String username, Long farmerId, String currentPassword, String newPassword) {
        Farmer farmer = farmerRepo.findByFarmerId(farmerId);
        if (farmer == null) {
            return new ResponseEntity<>("Farmer not found", HttpStatus.NOT_FOUND);
        }

        Farmer authenticatedFarmer = farmerRepo.findByUsername(username);
        if (authenticatedFarmer == null || !authenticatedFarmer.getFarmerId().equals(farmerId)) {
            return new ResponseEntity<>("Unauthorized password change request", HttpStatus.UNAUTHORIZED);
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
    public Farmer update(Farmer farmer) {
        Farmer existingFarmer = farmerRepo.findByFarmerId(farmer.getFarmerId());
        if (existingFarmer == null) {
            return null;
        }

        if (StringUtils.hasText(farmer.getFirstName())) {
            existingFarmer.setFirstName(farmer.getFirstName());
        }
        if (StringUtils.hasText(farmer.getLastName())) {
            existingFarmer.setLastName(farmer.getLastName());
        }
        if (StringUtils.hasText(farmer.getPhoneNo())) {
            existingFarmer.setPhoneNo(farmer.getPhoneNo());
        }
        if (StringUtils.hasText(farmer.getDob())) {
            existingFarmer.setDob(farmer.getDob());
        }
        if (StringUtils.hasText(farmer.getState())) {
            existingFarmer.setState(farmer.getState());
        }
        if (StringUtils.hasText(farmer.getDistrict())) {
            existingFarmer.setDistrict(farmer.getDistrict());
        }
        if (StringUtils.hasText(farmer.getCity())) {
            existingFarmer.setCity(farmer.getCity());
        }
        if (StringUtils.hasText(farmer.getAadharNo())) {
            existingFarmer.setAadharNo(farmer.getAadharNo());
        }

        logger.info("Farmer profile updated by ID: {}", existingFarmer.getFarmerId());
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
        return farmerRepo.findByEmail(email).isPresent();
    }

    @Override
    public Farmer findByEmail(String email) {
        return farmerRepo.findByEmail(email).orElse(null);
    }

    @Override
    public Farmer findByUsername(String username) {
        return farmerRepo.findByUsername(username);
    }

    @Override
    @Transactional
    public ResponseEntity<String> resetPassword(String email, String newPassword) {
        Farmer farmer = farmerRepo.findByEmail(email).orElse(null);
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

    @Override
    @Transactional
    public FarmerResponseDTO updateProfile(FarmerUpdateDTO dto, String username) {
        Farmer existingFarmer = farmerRepo.findByUsername(username);
        if (existingFarmer == null) {
            throw new RuntimeException("Farmer not found");
        }

        if (dto.getFirstName() != null) {
            existingFarmer.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            existingFarmer.setLastName(dto.getLastName());
        }
        if (dto.getPhoneNo() != null) {
            existingFarmer.setPhoneNo(dto.getPhoneNo());
        }
        if (dto.getState() != null) {
            existingFarmer.setState(dto.getState());
        }
        // "village" in DTO is mapped to persisted district field in Farmer entity.
        if (dto.getVillage() != null) {
            existingFarmer.setDistrict(dto.getVillage());
        }

        Farmer savedFarmer = farmerRepo.save(existingFarmer);
        return farmerMapper.toResponse(savedFarmer);
    }
}
