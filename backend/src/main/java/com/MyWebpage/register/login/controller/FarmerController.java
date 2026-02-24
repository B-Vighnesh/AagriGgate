package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.AuthRequestDTO;
import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerRequestDTO;
import com.MyWebpage.register.login.dto.FarmerResponseDTO;
import com.MyWebpage.register.login.dto.FarmerUpdateDTO;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.model.ResetPasswordRequest;
import com.MyWebpage.register.login.response.ApiResponse;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.FarmerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/farmers")
@RequiredArgsConstructor
public class FarmerController {

    private final FarmerService farmerService;

    @GetMapping("/me")
    public FarmerResponseDTO getProfile(
            Authentication auth) {

        Long farmerId =
                Long.parseLong(auth.getName());

        return farmerService.getProfile(farmerId);
    }

    @PutMapping("/me")
    public FarmerResponseDTO updateProfile(
            Authentication auth,
            @RequestBody FarmerUpdateDTO dto) {

        Long farmerId =
                Long.parseLong(auth.getName());

        return farmerService.updateProfile(
                farmerId,
                dto);
    }
}