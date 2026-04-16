package com.MyWebpage.register.login.chat;

import com.MyWebpage.register.login.chat.dto.ChatMessageDTO;
import com.MyWebpage.register.login.chat.dto.ConversationSummaryDTO;
import com.MyWebpage.register.login.chat.dto.DealConfirmationRequestDTO;
import com.MyWebpage.register.login.chat.dto.DealConfirmationResultDTO;

import java.util.List;

public interface ChatService {
    ConversationSummaryDTO createOrGetConversationForApproach(Long approachId, Long actorId);
    ConversationSummaryDTO getConversation(Long conversationId, Long actorId);
    ConversationSummaryDTO getConversationByApproach(Long approachId, Long actorId);
    List<ConversationSummaryDTO> getConversationsForUser(Long actorId);
    List<ConversationSummaryDTO> getConversationsForUser(Long actorId, String status, Boolean archived);
    List<ChatMessageDTO> getMessages(Long conversationId, Long actorId);
    ChatMessageDTO postMessage(Long conversationId, Long senderId, String messageText);
    DealConfirmationResultDTO confirmDeal(Long conversationId, Long actorId, DealConfirmationRequestDTO request);
    ConversationSummaryDTO archiveConversation(Long conversationId, Long actorId);
    ConversationSummaryDTO unarchiveConversation(Long conversationId, Long actorId);
    ConversationSummaryDTO failConversation(Long conversationId, Long actorId);
    ConversationSummaryDTO blockUser(Long actorId, Long targetUserId, String reason);
    ConversationSummaryDTO unblockUser(Long actorId, Long targetUserId);
    void reportUser(Long actorId, Long targetUserId, String reason, String message, String imageUrl);
    void softDeleteConversation(Long conversationId, Long actorId);
}
