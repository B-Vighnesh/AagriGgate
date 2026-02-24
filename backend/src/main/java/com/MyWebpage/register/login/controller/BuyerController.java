package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.BuyerRequestDTO;
import com.MyWebpage.register.login.dto.BuyerResponseDTO;
import com.MyWebpage.register.login.service.BuyerService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/buyers")
public class BuyerController {

    private final BuyerService buyerService;

    public BuyerController(BuyerService buyerService) {
        this.buyerService = buyerService;
    }

    @PostMapping("/register")
    public BuyerResponseDTO register(@RequestBody BuyerRequestDTO request) {
        return buyerService.register(request);
    }



    @GetMapping("/details/{buyerId}")
    public BuyerResponseDTO getById(@PathVariable Long buyerId) {
        return buyerService.getById(buyerId);
    }

    @GetMapping("/{buyerId}")
    public BuyerResponseDTO getByIdLegacy(@PathVariable Long buyerId) {
        return buyerService.getById(buyerId);
    }

    @GetMapping("/me")
    public BuyerResponseDTO getCurrentBuyer(Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        return buyerService.getCurrentBuyer(farmerId);
    }

    @PutMapping("/me")
    public BuyerResponseDTO update(Authentication authentication, @RequestBody BuyerRequestDTO request) {
        Long farmerId = Long.parseLong(authentication.getName());
        return buyerService.updateCurrentBuyer(farmerId, request);
    }

    @DeleteMapping("/me")
    public void delete(Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        buyerService.deleteCurrentBuyer(farmerId);
    }
}
