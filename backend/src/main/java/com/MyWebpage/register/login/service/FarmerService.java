package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.AuthResponseDTO;
import com.MyWebpage.register.login.dto.FarmerResponseDTO;
import com.MyWebpage.register.login.dto.FarmerUpdateDTO;
import com.MyWebpage.register.login.model.Farmer;
import org.springframework.http.ResponseEntity;

public interface FarmerService {
    ResponseEntity<Farmer> register(Farmer farmer);
    AuthResponseDTO verify(Farmer farmer);
    ResponseEntity<String> changePassword(String email, Long farmerId, String currentPassword, String newPassword);
    ResponseEntity<String> delete(String password, Long farmerId);
    String logout();
    Farmer update(Farmer farmer);
    String login();
    Farmer find(Long farmerId);
    Boolean findEmail(String email);
    Farmer findByEmail(String email);
    Farmer findByUsername(String username);
    ResponseEntity<String> resetPassword(String email, String newPassword);
    FarmerResponseDTO updateProfile(FarmerUpdateDTO dto, String email);
}
