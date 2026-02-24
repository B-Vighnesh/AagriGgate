package com.MyWebpage.register.login.service.impl;

import com.MyWebpage.register.login.dto.AuthRequestDTO;
import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerRequestDTO;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.ApproachFarmerRepo;
import com.MyWebpage.register.login.repository.CropRepo;
import com.MyWebpage.register.login.repository.FarmerRepo;
import com.MyWebpage.register.login.security.jwt.JWTService;
import com.MyWebpage.register.login.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final FarmerRepo farmerRepo;
    private final ApproachFarmerRepo approachFarmerRepository;
    private final CropRepo cropRepo;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JWTService jwtService;

    @Override
    public AuthResponseDTO register(
            FarmerRequestDTO dto,
            String role) {

        if (farmerRepo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email exists");
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
        String generatedUsername = dto.getUsername();
        if (generatedUsername == null || generatedUsername.isBlank()) {
            generatedUsername = dto.getFirstName() + farmerId;
        }
        farmer.setUsername(generatedUsername);

        farmer = farmerRepo.save(farmer);

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

    @Override
    public void resetPassword(String email, String newPassword) {
        Farmer farmer = farmerRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Farmer not found"));
        farmer.setPassword(passwordEncoder.encode(newPassword));
        farmerRepo.save(farmer);
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
}
