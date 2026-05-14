package com.MyWebpage.register.login.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    List<ChatMessage> findByConversationIdAndSenderIdAndIsReadFalseAndDeliveryStatusOrderByCreatedAtAsc(
            Long conversationId,
            Long senderId,
            MessageStatus deliveryStatus
    );

    @Query("""
            select m from ChatMessage m
            where m.conversationId = :conversationId
              and m.senderId = :senderId
              and m.isRead = false
            order by m.createdAt asc
            """)
    List<ChatMessage> findUnreadIncomingMessages(
            @Param("conversationId") Long conversationId,
            @Param("senderId") Long senderId
    );
}
