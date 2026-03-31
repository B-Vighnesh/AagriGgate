
package com.MyWebpage.register.login.security.jwt;

import com.MyWebpage.register.login.security.AppRoles;
import com.MyWebpage.register.login.security.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    private static final Duration FARMER_TOKEN_TTL = Duration.ofHours(2);

    private final JwtProperties jwtProperties;

    public JWTService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generateToken(Long farmerId, String role) {
        return generateToken(String.valueOf(farmerId), role, FARMER_TOKEN_TTL, Map.of());
    }

    public String generateAdminToken(String adminUsername, Duration ttl) {
        return generateToken(
                String.valueOf(-1L),
                AppRoles.ADMIN,
                ttl,
                Map.of("adminUsername", adminUsername)
        );
    }

    public Long extractFarmerId(String token) {
        return Long.parseLong(extractUsername(token));
    }

    public Long extractSubjectId(String token) {
        return Long.parseLong(extractUsername(token));
    }

    public Long extractId(String token) {
        return extractSubjectId(token);
    }

    public String extractAdminUsername(String token) {
        return extractClaim(token, claims -> claims.get("adminUsername", String.class));
    }

    public String generateToken(String subject, String role, Duration ttl, Map<String, Object> extraClaims) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("farmerId", subject);
        claims.putAll(extraClaims);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ttl.toMillis()))
                .signWith(getKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getKey() {

        String secretKey = jwtProperties.getSecret();
        if (!StringUtils.hasText(secretKey)) {
            throw new IllegalStateException("JWT secret is not configured.");
        }

        byte[] keyBytes = Decoders.BASE64.decode(secretKey);

        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits.");
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean validateToken(String token, UserDetails userDetails) {

        try {

            final String userName = extractUsername(token);

            return userName.equals(userDetails.getUsername())
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;

        }
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {

        final Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
