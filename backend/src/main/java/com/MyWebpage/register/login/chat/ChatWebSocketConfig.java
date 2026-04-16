package com.MyWebpage.register.login.chat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class ChatWebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final ChatWebSocketAuthInterceptor chatWebSocketAuthInterceptor;
    private final String allowedOrigins;

    public ChatWebSocketConfig(
            ChatWebSocketHandler chatWebSocketHandler,
            ChatWebSocketAuthInterceptor chatWebSocketAuthInterceptor,
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.chatWebSocketHandler = chatWebSocketHandler;
        this.chatWebSocketAuthInterceptor = chatWebSocketAuthInterceptor;
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/api/v1/ws/chat")
                .setAllowedOrigins(resolveAllowedOrigins())
                .addInterceptors(chatWebSocketAuthInterceptor);
    }

    private String[] resolveAllowedOrigins() {
        return java.util.Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }
}
