package com.MyWebpage.register.login.verification;

import org.springframework.http.ResponseEntity;

public interface VerificationService {
    ResponseEntity<String> verifyEmail(String token);
}
