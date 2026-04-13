package com.MyWebpage.register.login.chat;

import com.MyWebpage.register.login.chat.dto.ChatSocketEventDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class ChatRealtimeService {

    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<Long, CopyOnWriteArraySet<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();

    public ChatRealtimeService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void register(Long userId, WebSocketSession session) {
        sessionsByUser.computeIfAbsent(userId, ignored -> new CopyOnWriteArraySet<>()).add(session);
    }

    public void unregister(Long userId, WebSocketSession session) {
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);
        if (sessions == null) {
            return;
        }
        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUser.remove(userId);
        }
    }

    public void sendToConversation(Conversation conversation, String type, Object data, String message) {
        if (conversation == null) {
            return;
        }
        sendToUser(conversation.getBuyerId(), new ChatSocketEventDTO(type, data, message));
        if (!conversation.getBuyerId().equals(conversation.getFarmerId())) {
            sendToUser(conversation.getFarmerId(), new ChatSocketEventDTO(type, data, message));
        }
    }

    public void sendToUser(Long userId, String type, Object data, String message) {
        sendToUser(userId, new ChatSocketEventDTO(type, data, message));
    }

    public void sendError(WebSocketSession session, String message) {
        send(session, new ChatSocketEventDTO("ERROR", null, message));
    }

    private void sendToUser(Long userId, ChatSocketEventDTO payload) {
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        for (WebSocketSession session : sessions) {
            send(session, payload);
        }
    }

    private void send(WebSocketSession session, ChatSocketEventDTO payload) {
        if (session == null || !session.isOpen()) {
            return;
        }
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        } catch (IOException ignored) {
            // Delivery failures are tolerated because messages are already persisted.
        }
    }
}
