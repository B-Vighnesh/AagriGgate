package com.MyWebpage.register.login.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByApproachId(Long approachId);
    Optional<Conversation> findByConversationIdAndBuyerIdOrConversationIdAndFarmerId(Long conversationId, Long buyerId, Long sameConversationId, Long farmerId);
    List<Conversation> findByBuyerIdOrFarmerIdOrderByLastMessageAtDescUpdatedAtDesc(Long buyerId, Long farmerId);
    List<Conversation> findByBuyerIdAndFarmerIdOrBuyerIdAndFarmerIdOrderByLastMessageAtDescUpdatedAtDesc(
            Long buyerId,
            Long farmerId,
            Long reverseBuyerId,
            Long reverseFarmerId
    );
    @Query("""
        SELECT COUNT(c)
        FROM Conversation c
        WHERE c.active = true
        AND c.status = com.MyWebpage.register.login.chat.ConversationStatus.ACTIVE
        AND (
            (c.buyerId = :actorId AND c.buyerUnreadCount > 0)
            OR
            (c.farmerId = :actorId AND c.farmerUnreadCount > 0)
        )
        """)
    long countUnreadConversations(@Param("actorId") Long actorId);
}
