package com.MyWebpage.register.login.chat;

import org.springframework.data.jpa.repository.JpaRepository;

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
}
