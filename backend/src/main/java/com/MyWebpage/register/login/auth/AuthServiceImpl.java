package com.MyWebpage.register.login.auth;

import com.MyWebpage.register.login.farmer.FarmerRequestDTO;
import com.MyWebpage.register.login.otp.OtpLoginRequestDTO;
import com.MyWebpage.register.login.otp.LoginOtp;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.approach.ApproachFarmerRepo;
import com.MyWebpage.register.login.crop.CropRepo;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.otp.LoginOtpRepository;
import com.MyWebpage.register.login.security.jwt.JWTService;
import com.MyWebpage.register.login.common.EmailService;
import com.MyWebpage.register.login.otp.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final FarmerRepo farmerRepo;
    private final ApproachFarmerRepo approachFarmerRepository;
    private final CropRepo cropRepo;
    private final LoginOtpRepository loginOtpRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JWTService jwtService;
    private final EmailService emailService;
    private final OtpService otpService;

    @Override
    public AuthResponseDTO register(
            FarmerRequestDTO dto,
            String role) {

        if (farmerRepo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email exists");
        }
        if (!otpService.isOtpVerified(dto.getEmail())) {
            throw new RuntimeException("OTP not verified");
        }

        Farmer farmer = new Farmer();
        farmer.setFirstName(dto.getFirstName());
        farmer.setLastName(dto.getLastName());
        farmer.setEmail(dto.getEmail());
        farmer.setPhoneNo(dto.getPhoneNo());
        farmer.setState(dto.getState());
        farmer.setPassword(passwordEncoder.encode(dto.getPassword()));
        farmer.setRole(role);

        Long farmerId = farmerRepo.getNextUserSequence();
        String generatedUsername = generateUsername(dto.getFirstName(), farmerId);
        farmer.setUsername(generatedUsername);

        farmer = farmerRepo.save(farmer);
        otpService.clearOtp(dto.getEmail());
        emailService.sendWelcomeEmail(farmer);

        String token =
                jwtService.generateToken(
                        farmer.getFarmerId(),
                        farmer.getRole());

        return buildResponse(farmer, token);
    }

    @Override
    public AuthResponseDTO login(
            AuthRequestDTO dto) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getPrincipal(), dto.getPassword()));
        if (!authentication.isAuthenticated()) {
            throw new RuntimeException("Authentication failed");
        }

        Farmer farmer = dto.getPrincipal().contains("@")
                ? farmerRepo.findByEmail(dto.getPrincipal()).orElse(null)
                : farmerRepo.findByUsername(dto.getPrincipal());
        if (farmer == null) {
            throw new RuntimeException("User not found");
        }

        String token =
                jwtService.generateToken(
                        farmer.getFarmerId(),
                        farmer.getRole());

        return buildResponse(farmer, token);
    }

    @Override
    public void sendLoginOtp(
            String principal) {

        Farmer farmer = findFarmerByPrincipal(principal);
        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        loginOtpRepository.deleteByFarmerId(farmer.getFarmerId());

        LoginOtp loginOtp = new LoginOtp();
        loginOtp.setFarmerId(farmer.getFarmerId());
        loginOtp.setOtp(otp);
        loginOtp.setExpiryTime(LocalDateTime.now().plusMinutes(10));

        loginOtpRepository.save(loginOtp);
        emailService.sendLoginOtpEmail(farmer, otp);
    }

    @Override
    public AuthResponseDTO loginWithOtp(
            OtpLoginRequestDTO dto) {

        Farmer farmer = findFarmerByPrincipal(dto.getPrincipal());
        LoginOtp loginOtp = loginOtpRepository.findTopByFarmerIdOrderByIdDesc(farmer.getFarmerId())
                .orElseThrow(() -> new IllegalArgumentException("OTP not found"));

        if (loginOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            loginOtpRepository.deleteByFarmerId(farmer.getFarmerId());
            throw new IllegalArgumentException("OTP expired");
        }

        if (!loginOtp.getOtp().equals(dto.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        loginOtpRepository.deleteByFarmerId(farmer.getFarmerId());

        String token = jwtService.generateToken(
                farmer.getFarmerId(),
                farmer.getRole());

        return buildResponse(farmer, token);
    }

    @Override
    public void changePassword(
            Long farmerId,
            String currentPassword,
            String newPassword) {

        Farmer farmer = farmerRepo.findById(farmerId).orElseThrow();

        if (!passwordEncoder.matches(currentPassword, farmer.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        farmer.setPassword(passwordEncoder.encode(newPassword));

        farmerRepo.save(farmer);
        emailService.sendPasswordChangedEmail(farmer);
    }

    @Override
    public void deleteAccount(
            Long farmerId,
            String password) {

        Farmer farmer = farmerRepo.findById(farmerId).orElseThrow();

        if (!passwordEncoder.matches(password, farmer.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if ("BUYER".equals(farmer.getRole())) {
            approachFarmerRepository.deleteByUserId(farmerId);
        } else if ("SELLER".equals(farmer.getRole())) {
            approachFarmerRepository.deleteByFarmerId(farmerId);
            cropRepo.deleteByFarmerId(farmerId);
        }

        farmerRepo.delete(farmer);
    }

    private AuthResponseDTO buildResponse(
            Farmer farmer,
            String token) {

        AuthResponseDTO dto = new AuthResponseDTO();

        dto.setToken(token);
        dto.setFarmerId(farmer.getFarmerId());
        dto.setRole(farmer.getRole());

        return dto;
    }

    private Farmer findFarmerByPrincipal(String principal) {
        Farmer farmer = principal.contains("@")
                ? farmerRepo.findByEmail(principal).orElse(null)
                : farmerRepo.findByUsername(principal);
        if (farmer == null) {
            throw new IllegalArgumentException("User not found");
        }
        return farmer;
    }

    private String generateUsername(String firstName, Long farmerId) {
        String normalizedFirstName = normalizeNamePrefix(firstName);
        String encodedId = Long.toString(farmerId, 36).toLowerCase(Locale.ROOT);

        int maxPrefixLength = Math.max(0, 10 - encodedId.length());
        String prefix = normalizedFirstName.substring(0, Math.min(normalizedFirstName.length(), maxPrefixLength));

        String username = prefix + encodedId;
        if (username.isEmpty()) {
            return encodedId;
        }
        return username.length() <= 10 ? username : username.substring(0, 10);
    }

    private String normalizeNamePrefix(String firstName) {
        if (firstName == null) {
            return "ag";
        }

        String cleaned = firstName
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");

        return cleaned.isBlank() ? "ag" : cleaned;
    }
}
