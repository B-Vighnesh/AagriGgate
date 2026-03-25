package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.BuyerRequestDTO;
import com.MyWebpage.register.login.dto.BuyerResponseDTO;
import com.MyWebpage.register.login.service.BuyerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/buyers")
@RequiredArgsConstructor
public class BuyerController {

    private final BuyerService buyerService;

    @GetMapping("/me")
    public BuyerResponseDTO getProfile(Authentication auth) {
        Long farmerId = Long.parseLong(auth.getName());
        return buyerService.getProfile(farmerId);
    }
    @GetMapping("/me/{buyerId}")
    public BuyerResponseDTO getBuyer(Authentication auth) {
        Long farmerId = Long.parseLong(auth.getName());
        return buyerService.getProfile(farmerId);
    }

    @PutMapping("/me")
    public BuyerResponseDTO updateProfile(Authentication auth, @RequestBody BuyerRequestDTO request) {
        Long farmerId = Long.parseLong(auth.getName());
        return buyerService.updateProfile(farmerId, request);
    }
//    @DeleteMapping("/me")
//    public void deleteProfile(Authentication auth) {
//        Long farmerId = Long.parseLong(auth.getName());
//        buyerService.deleteProfile(farmerId);
//    }
}
