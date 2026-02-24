package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.dto.AuthRequestDTO;
import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerRequestDTO;
import com.MyWebpage.register.login.mapper.FarmerMapper;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.security.jwt.JWTService;
import com.MyWebpage.register.login.service.AuthService;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final FarmerRepo farmerRepo;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JWTService jwtService;

    private final FarmerMapper farmerMapper;

    private final EmailService emailService;

    private final OtpService otpService;

    @Override
    public AuthResponseDTO register(
            FarmerRequestDTO dto,
            String role) {

        if (farmerRepo.existsByEmail(dto.getEmail()))
            throw new RuntimeException("Email exists");

        if (!otpService.isOtpVerified(dto.getEmail()))
            throw new RuntimeException("OTP not verified");

        Farmer farmer =
                farmerMapper.toEntity(dto);

        farmer.setRole(role);

        farmer.setPassword(
                passwordEncoder.encode(
                        dto.getPassword()));

        farmer =
                farmerRepo.save(farmer);

        String token =
                jwtService.generateToken(
                        farmer.getFarmerId(),
                        role);

        return buildResponse(farmer, token);
    }

    @Override
    public AuthResponseDTO login(
            AuthRequestDTO dto) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                dto.getPrincipal(),
                                dto.getPassword()));

        Farmer farmer =
                farmerRepo.findByUsername(
                        dto.getPrincipal());

        String token =
                jwtService.generateToken(
                        farmer.getFarmerId(),
                        farmer.getRole());

        return buildResponse(farmer, token);
    }

    @Override
    public void changePassword(
            Long farmerId,
            ChangePasswordDTO dto) {

        Farmer farmer =
                farmerRepo.findById(farmerId)
                        .orElseThrow();

        if (!passwordEncoder.matches(
                dto.getCurrentPassword(),
                farmer.getPassword()))
            throw new RuntimeException("Invalid password");

        farmer.setPassword(
                passwordEncoder.encode(
                        dto.getNewPassword()));

        farmerRepo.save(farmer);
    }

    @Override
    public void deleteAccount(
            Long farmerId,
            String password) {

        Farmer farmer =
                farmerRepo.findById(farmerId)
                        .orElseThrow();

        if (!passwordEncoder.matches(
                password,
                farmer.getPassword()))
            throw new RuntimeException("Invalid password");

        farmerRepo.delete(farmer);
    }

    private AuthResponseDTO buildResponse(
            Farmer farmer,
            String token) {

        AuthResponseDTO dto =
                new AuthResponseDTO();

        dto.setToken(token);

        dto.setFarmerId(
                farmer.getFarmerId());

        dto.setRole(
                farmer.getRole());

        return dto;
    }
}