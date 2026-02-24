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

import com.MyWebpage.register.login.dto.BuyerRequestDTO;
import com.MyWebpage.register.login.dto.BuyerResponseDTO;
import com.MyWebpage.register.login.service.BuyerService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/buyers")
public class BuyerController {

    private final BuyerService buyerService;

    public BuyerController(BuyerService buyerService) {
        this.buyerService = buyerService;
    }

    @PostMapping("/register")
    public BuyerResponseDTO register(
            @RequestBody BuyerRequestDTO request) {

        return buyerService.register(request);
    }

    @GetMapping("/{buyerId}")
    public BuyerResponseDTO getById(
            @PathVariable Long buyerId) {

        return buyerService.getById(buyerId);
    }

    @GetMapping("/me")
    public BuyerResponseDTO getCurrentBuyer(
            Authentication authentication) {

        return buyerService.getCurrentBuyer(
                authentication.getName()
        );
    }

    @PutMapping("/me")
    public BuyerResponseDTO update(
            Authentication authentication,
            @RequestBody BuyerRequestDTO request) {

        return buyerService.updateCurrentBuyer(
                authentication.getName(),
                request
        );
    }

    @DeleteMapping("/me")
    public void delete(Authentication authentication) {

        buyerService.deleteCurrentBuyer(
                authentication.getName()
        );
    }

}