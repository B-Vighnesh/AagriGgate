package com.MyWebpage.register.login.service;

import org.springframework.http.ResponseEntity;

public interface VerificationService {
    ResponseEntity<String> verifyEmail(String token);
}
