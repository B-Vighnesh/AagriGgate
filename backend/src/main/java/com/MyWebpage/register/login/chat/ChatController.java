package com.MyWebpage.register.login.chat;

import com.MyWebpage.register.login.chat.dto.ChatMessageDTO;
import com.MyWebpage.register.login.chat.dto.ConversationSummaryDTO;
import com.MyWebpage.register.login.chat.dto.DealConfirmationRequestDTO;
import com.MyWebpage.register.login.chat.dto.DealConfirmationResultDTO;
import com.MyWebpage.register.login.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummaryDTO>> getConversations(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "archived", required = false) Boolean archived,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.getConversationsForUser(userId, status, archived));
    }

    @PostMapping("/conversations/from-approach/{approachId}")
    public ResponseEntity<ConversationSummaryDTO> createOrGetConversation(
            @PathVariable Long approachId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.createOrGetConversationForApproach(approachId, userId));
    }

    @GetMapping("/conversations/by-approach/{approachId}")
    public ResponseEntity<ConversationSummaryDTO> getConversationByApproach(
            @PathVariable Long approachId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.getConversationByApproach(approachId, userId));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ConversationSummaryDTO> getConversation(
            @PathVariable Long conversationId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.getConversation(conversationId, userId));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable Long conversationId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.getMessages(conversationId, userId));
    }

    @PostMapping("/conversations/{conversationId}/deal")
    public ResponseEntity<DealConfirmationResultDTO> confirmDeal(
            @PathVariable Long conversationId,
            @RequestBody DealConfirmationRequestDTO request,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.confirmDeal(conversationId, userId, request));
    }

    @PostMapping("/conversations/{conversationId}/fail")
    public ResponseEntity<ConversationSummaryDTO> failConversation(
            @PathVariable Long conversationId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.failConversation(conversationId, userId));
    }

    @PostMapping("/conversations/{conversationId}/archive")
    public ResponseEntity<ConversationSummaryDTO> archiveConversation(
            @PathVariable Long conversationId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.archiveConversation(conversationId, userId));
    }

    @PostMapping("/conversations/{conversationId}/unarchive")
    public ResponseEntity<ConversationSummaryDTO> unarchiveConversation(
            @PathVariable Long conversationId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(chatService.unarchiveConversation(conversationId, userId));
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<String>> softDeleteConversation(
            @PathVariable Long conversationId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        chatService.softDeleteConversation(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success("Conversation deleted successfully.", "OK"));
    }
}
