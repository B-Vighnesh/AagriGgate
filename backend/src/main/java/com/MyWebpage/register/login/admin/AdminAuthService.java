package com.MyWebpage.register.login.admin;

import com.MyWebpage.register.login.security.AppRoles;
import com.MyWebpage.register.login.security.config.AdminCredentialsProperties;
import com.MyWebpage.register.login.security.jwt.JWTService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
public class AdminAuthService {

    private static final Duration ADMIN_TOKEN_TTL = Duration.ofMinutes(30);

    private final AdminCredentialsProperties adminCredentialsProperties;
    private final JWTService jwtService;

    public AdminAuthService(AdminCredentialsProperties adminCredentialsProperties, JWTService jwtService) {
        this.adminCredentialsProperties = adminCredentialsProperties;
        this.jwtService = jwtService;
    }

    public AdminAuthResponse login(Admin request) {
        if (request == null
                || !adminCredentialsProperties.getUsername().equals(request.getUsername())
                || !adminCredentialsProperties.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid admin credentials");
        }

        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plus(ADMIN_TOKEN_TTL);

        AdminAuthResponse response = new AdminAuthResponse();
        response.setToken(jwtService.generateAdminToken(adminCredentialsProperties.getUsername(), ADMIN_TOKEN_TTL));
        response.setRole(AppRoles.ADMIN);
        response.setExpiresInSeconds(ADMIN_TOKEN_TTL.toSeconds());
        response.setExpiresAt(expiresAt.toString());
        return response;
    }
}
