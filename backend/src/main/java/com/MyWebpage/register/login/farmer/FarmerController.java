package com.MyWebpage.register.login.farmer;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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
    public FarmerResponseDTO getProfile(Authentication auth) {
        Long farmerId = Long.parseLong(auth.getName());
        return farmerService.getProfile(farmerId);
    }

    @PutMapping("/me")
    public FarmerResponseDTO updateProfile(Authentication auth, @RequestBody FarmerUpdateDTO dto) {
        Long farmerId = Long.parseLong(auth.getName());
        return farmerService.updateProfile(farmerId, dto);
    }
}
