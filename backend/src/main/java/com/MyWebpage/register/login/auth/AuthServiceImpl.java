package com.MyWebpage.register.login.auth;

import com.MyWebpage.register.login.approach.ApproachFarmerService;
import com.MyWebpage.register.login.auth.dto.AuthRequestDTO;
import com.MyWebpage.register.login.auth.dto.AuthResponseDTO;
import com.MyWebpage.register.login.auth.dto.DeleteAccountRequestDTO;
import com.MyWebpage.register.login.auth.dto.OtpLoginRequestDTO;
import com.MyWebpage.register.login.cart.CartItemRepo;
import com.MyWebpage.register.login.crop.CropService;
import com.MyWebpage.register.login.farmer.FarmerRequestDTO;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.favorite.FavoriteRepo;
import com.MyWebpage.register.login.market.saved.SavedMarketRepository;
import com.MyWebpage.register.login.news.repository.SavedNewsRepository;
import com.MyWebpage.register.login.notification.repository.NotificationRepository;
import com.MyWebpage.register.login.notification.repository.UserNotificationPreferenceRepository;
import com.MyWebpage.register.login.security.jwt.JWTService;
import com.MyWebpage.register.login.common.EmailService;
import com.MyWebpage.register.login.otp.OtpPurpose;
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

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final FarmerRepo farmerRepo;

    private final ApproachFarmerService approachFarmerService;
    private final CropService cropService;
    private final CartItemRepo cartItemRepo;
    private final FavoriteRepo favoriteRepo;
    private final SavedNewsRepository savedNewsRepository;
    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferenceRepository notificationPreferenceRepository;
    private final SavedMarketRepository savedMarketRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JWTService jwtService;
    private final EmailService emailService;
    private final OtpService otpService;

    @Override
    public AuthResponseDTO register(
            FarmerRequestDTO dto,
            String role) {

        if (farmerRepo.existsByEmailAndActiveTrue(dto.getEmail())) {
            throw new RuntimeException("Email exists");
        }
        if (!otpService.isOtpVerified(dto.getEmail(), resolveRegistrationPurpose(role))) {
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
        farmer.setActive(true);
        farmer.setDeletedAt(null);

        Long farmerId = farmerRepo.getNextUserSequence();
        String generatedUsername = generateUsername(dto.getFirstName(), farmerId);
        farmer.setUsername(generatedUsername);

        farmer = farmerRepo.save(farmer);
        otpService.clearOtp(dto.getEmail(), resolveRegistrationPurpose(role));
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
        String otp = otpService.issueOtp(loginOtpPrincipal(farmer.getFarmerId()), OtpPurpose.LOGIN);
        emailService.sendLoginOtpEmail(farmer, otp);
    }

    @Override
    public void sendDeletionOtp(Long farmerId) {
        Farmer farmer = farmerRepo.findById(farmerId).orElseThrow();
        ensureAccountActive(farmer);
        String otp = otpService.issueOtp(farmer.getFarmerId().toString(), OtpPurpose.DELETION);
        emailService.sendDeletionOtpEmail(farmer, otp);
    }

    @Override
    public AuthResponseDTO loginWithOtp(
            OtpLoginRequestDTO dto) {

        Farmer farmer = findFarmerByPrincipal(dto.getPrincipal());
        boolean verified = otpService.verifyAndConsumeOtp(
                loginOtpPrincipal(farmer.getFarmerId()),
                OtpPurpose.LOGIN,
                dto.getOtp()
        );
        if (!verified) {
            throw new IllegalArgumentException("Invalid OTP");
        }

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
        ensureAccountActive(farmer);

        if (!passwordEncoder.matches(currentPassword, farmer.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        farmer.setPassword(passwordEncoder.encode(newPassword));

        farmerRepo.save(farmer);
        emailService.sendPasswordChangedEmail(farmer);
    }

    @Override
    public void deleteAccount(Long farmerId, String password) {

    }

    @Override
    public void softDeleteAccount(Long farmerId, String password) {

    }

    @Deprecated
    @Override
    public void deleteAccount(
            Long farmerId,
            String password, String role) {

        Farmer farmer = farmerRepo.findById(farmerId).orElseThrow();
        ensureAccountActive(farmer);

        if (!passwordEncoder.matches(password, farmer.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        approachFarmerService.deleteApproach(farmerId, role);
        cropService.deleteCropByFarmerIdV2(farmerId);
        farmerRepo.delete(farmer);
    }

    @Override
    public void softDeleteAccount(Long farmerId, DeleteAccountRequestDTO request, String role) {
        Farmer farmer = farmerRepo.findById(farmerId).orElseThrow();
        ensureAccountActive(farmer);
        if(!otpService.verifyAndConsumeOtp(farmerId.toString(),OtpPurpose.DELETION, request.getOtp()))
        {
            throw new IllegalArgumentException("Invalid otp");

        }
        if (!passwordEncoder.matches(request.getPassword(), farmer.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        farmer.setActive(false);
        farmer.setDeletedAt(LocalDateTime.now());
        cartItemRepo.deleteByBuyerId(farmerId);
        favoriteRepo.deleteByBuyerId(farmerId);
        savedNewsRepository.deleteByUserId(farmerId);
        notificationRepository.deleteByUserId(farmerId);
        notificationPreferenceRepository.deleteByUserId(farmerId);
        savedMarketRepository.deleteByUserId(farmerId);
        approachFarmerService.softDeleteApproach(farmerId, role);
        cropService.softDeleteCropByFarmerIdV1(farmerId);
        farmerRepo.save(farmer);
    }

    @Override
    public void findUser(String email) {
        if(farmerRepo.existsByEmailAndActiveTrue(email))
        {
            throw new RuntimeException("User already exists");
        }
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
        ensureAccountActive(farmer);
        return farmer;
    }

    private void ensureAccountActive(Farmer farmer) {
        if (!farmer.isActive()) {
            throw new IllegalArgumentException("user not found");
        }
    }

    private String loginOtpPrincipal(Long farmerId) {
        return String.valueOf(farmerId);
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

    private OtpPurpose resolveRegistrationPurpose(String role) {
        if ("BUYER".equalsIgnoreCase(role) || "buyer".equalsIgnoreCase(role)) {
            return OtpPurpose.BUYER_REGISTRATION;
        }
        return OtpPurpose.SELLER_REGISTRATION;
    }
}
