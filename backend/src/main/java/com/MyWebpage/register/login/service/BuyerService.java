package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.model.Farmer;
import org.springframework.http.ResponseEntity;

public interface BuyerService {
    ResponseEntity<Farmer> register(Farmer buyer);
    AuthResponseDTO verify(Farmer buyer);
    ResponseEntity<String> resetPassword(String email, String newPassword);
    Farmer find(Long farmerId);
    Farmer update(Farmer buyer);
    ResponseEntity<String> delete(String password, Long farmerId);
    ResponseEntity<String> changePassword(String email, Long farmerId, String currentPassword, String newPassword);
}
