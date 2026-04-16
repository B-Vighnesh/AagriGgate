package com.MyWebpage.register.login.chat;

import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.security.jwt.JWTService;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class ChatWebSocketAuthInterceptor implements HandshakeInterceptor {

    private final JWTService jwtService;
    private final FarmerRepo farmerRepo;

    public ChatWebSocketAuthInterceptor(JWTService jwtService, FarmerRepo farmerRepo) {
        this.jwtService = jwtService;
        this.farmerRepo = farmerRepo;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            String token = null;
            if (request instanceof ServletServerHttpRequest servletRequest) {
                token = servletRequest.getServletRequest().getParameter("token");
                if ((token == null || token.isBlank())) {
                    String authHeader = servletRequest.getServletRequest().getHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        token = authHeader.substring(7);
                    }
                }
            }

            if (token == null || token.isBlank()) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            Long userId = jwtService.extractSubjectId(token);
            var farmer = farmerRepo.findById(userId).orElse(null);
            if (farmer == null || !farmer.isActive()) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            attributes.put("userId", userId);
            return true;
        } catch (Exception ex) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }
}
