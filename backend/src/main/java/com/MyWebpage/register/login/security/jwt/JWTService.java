
package com.MyWebpage.register.login.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    @Value("${jwt.secret}")
    private String secretkey;

    public String generateToken(Long farmerId, String role) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("farmerId", farmerId);

        return Jwts.builder()
                .claims(claims)
                .subject(String.valueOf(farmerId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 2 * 60 * 60 * 1000))
                .signWith(getKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getKey() {

        if (!StringUtils.hasText(secretkey)) {
            throw new IllegalStateException("JWT secret is not configured.");
        }

        byte[] keyBytes = Decoders.BASE64.decode(secretkey);

        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits.");
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractFarmerId(String token) {
        return Long.parseLong(extractAllClaims(token).getSubject());
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
