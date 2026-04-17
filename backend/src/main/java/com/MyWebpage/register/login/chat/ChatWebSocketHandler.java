package com.MyWebpage.register.login.chat;

import com.MyWebpage.register.login.chat.dto.ChatSocketRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatRealtimeService chatRealtimeService;
    private final ChatService chatService;
    private final ObjectMapper objectMapper;

    public ChatWebSocketHandler(ChatRealtimeService chatRealtimeService, ChatService chatService, ObjectMapper objectMapper) {
        this.chatRealtimeService = chatRealtimeService;
        this.chatService = chatService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            chatRealtimeService.register(userId, session);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId == null) {
            chatRealtimeService.sendError(session, "Unauthorized chat session");
            return;
        }

        try {
            ChatSocketRequestDTO payload = objectMapper.readValue(message.getPayload(), ChatSocketRequestDTO.class);
            if (payload.getConversationId() == null) {
                chatRealtimeService.sendError(session, "Conversation id is required");
                return;
            }
            chatService.postMessage(payload.getConversationId(), userId, payload.getMessageText());
        } catch (IllegalArgumentException ex) {
            chatRealtimeService.sendError(session, ex.getMessage());
        } catch (Exception ex) {
            chatRealtimeService.sendError(session, "Unable to deliver message");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            chatRealtimeService.unregister(userId, session);
        }
    }
}
