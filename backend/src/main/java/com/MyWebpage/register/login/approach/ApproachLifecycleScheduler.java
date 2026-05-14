package com.MyWebpage.register.login.approach;

import com.MyWebpage.register.login.chat.ChatMessage;
import com.MyWebpage.register.login.chat.ChatMessageRepository;
import com.MyWebpage.register.login.chat.ChatRealtimeService;
import com.MyWebpage.register.login.chat.Conversation;
import com.MyWebpage.register.login.chat.ConversationRepository;
import com.MyWebpage.register.login.chat.ConversationStatus;
import com.MyWebpage.register.login.chat.MessageType;
import com.MyWebpage.register.login.chat.MessageStatus;
import com.MyWebpage.register.login.chat.dto.ChatMessageDTO;
import com.MyWebpage.register.login.chat.dto.ConversationSummaryDTO;
import com.MyWebpage.register.login.notification.enums.MessageSeverity;
import com.MyWebpage.register.login.notification.enums.NotificationReferenceType;
import com.MyWebpage.register.login.notification.enums.NotificationTargetType;
import com.MyWebpage.register.login.notification.event.NotificationEvent;
import com.MyWebpage.register.login.notification.event.NotificationEventReference;
import com.MyWebpage.register.login.notification.event.NotificationEventTarget;
import com.MyWebpage.register.login.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class ApproachLifecycleScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ApproachLifecycleScheduler.class);

    private final ApproachFarmerRepo approachFarmerRepo;
    private final ApproachFarmerService approachFarmerService;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRealtimeService chatRealtimeService;
    private final NotificationService notificationService;

    public ApproachLifecycleScheduler(
            ApproachFarmerRepo approachFarmerRepo,
            ApproachFarmerService approachFarmerService,
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            ChatRealtimeService chatRealtimeService,
            NotificationService notificationService) {
        this.approachFarmerRepo = approachFarmerRepo;
        this.approachFarmerService = approachFarmerService;
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatRealtimeService = chatRealtimeService;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "${approach.inactivity-check-cron:0 0 * * * *}", zone = "Asia/Kolkata")
    @Transactional
    public void processInactiveAcceptedRequests() {
        LocalDateTime now = LocalDateTime.now();
        sendInactivityNotifications(now.minusHours(48), now);
        expireInactiveRequests(now.minusHours(24), now);
    }

    private void sendInactivityNotifications(LocalDateTime notifyBefore, LocalDateTime now) {
        List<ApproachFarmer> approaches = approachFarmerRepo.findAcceptedRequestsNeedingInactivityNotification(notifyBefore);
        for (ApproachFarmer approach : approaches) {
            Set<Long> targetUsers = resolveInactiveUsers(approach);
            for (Long targetUserId : targetUsers) {
                NotificationEvent event = new NotificationEvent();
                event.setEventType("REQUEST_INACTIVITY");
                event.setCategoryName("REQUEST_INACTIVITY");
                event.setSeverity(MessageSeverity.MEDIUM);
                event.setTitle("Request inactive for 48 hours");
                event.setMessage(buildInactivityMessage(approach, targetUserId));
                event.setTarget(new NotificationEventTarget(NotificationTargetType.USER, String.valueOf(targetUserId)));
                event.setReference(new NotificationEventReference(NotificationReferenceType.REQUEST, approach.getApproachId()));
                event.setCreatedAt(now);
                notificationService.publishEvent(event);
            }
            approachFarmerService.markApproachNotified(approach.getApproachId(), now);
            logger.info("Inactivity notification sent for approach {}", approach.getApproachId());
        }
    }

    private void expireInactiveRequests(LocalDateTime expireBefore, LocalDateTime now) {
        List<ApproachFarmer> approaches = approachFarmerRepo.findAcceptedRequestsNeedingExpiration(expireBefore);
        for (ApproachFarmer approach : approaches) {
            approachFarmerService.markApproachExpired(approach.getApproachId(), now);

            conversationRepository.findByApproachId(approach.getApproachId()).ifPresent(conversation -> {
                if (conversation.getStatus() == ConversationStatus.ACTIVE && Boolean.TRUE.equals(conversation.getActive())) {
                    conversation.setStatus(ConversationStatus.EXPIRED);
                    conversation.setActive(false);
                    conversation.setExpiredAt(now);
                    conversation.setUpdatedAt(now);
                    Conversation savedConversation = conversationRepository.save(conversation);

                    ChatMessage systemMessage = new ChatMessage();
                    systemMessage.setConversationId(savedConversation.getConversationId());
                    systemMessage.setSenderId(null);
                    systemMessage.setMessageType(MessageType.SYSTEM);
                    systemMessage.setMessageText("Request expired after inactivity. The chat is now closed.");
                    systemMessage.setCreatedAt(now);
                    systemMessage.setIsRead(false);
                    systemMessage.setDeliveryStatus(MessageStatus.DELIVERED);
                    ChatMessage savedMessage = chatMessageRepository.save(systemMessage);

                    chatRealtimeService.sendToConversation(savedConversation, "CHAT_MESSAGE", toRealtimeMessage(savedMessage), null);
                    chatRealtimeService.sendToUser(savedConversation.getBuyerId(), "CONVERSATION_UPDATE",
                            toConversationSummary(savedConversation, savedConversation.getBuyerId()),
                            "Request expired after inactivity.");
                    if (!savedConversation.getBuyerId().equals(savedConversation.getFarmerId())) {
                        chatRealtimeService.sendToUser(savedConversation.getFarmerId(), "CONVERSATION_UPDATE",
                                toConversationSummary(savedConversation, savedConversation.getFarmerId()),
                                "Request expired after inactivity.");
                    }
                }
            });
            logger.info("Inactive approach expired: {}", approach.getApproachId());
        }
    }

    private Set<Long> resolveInactiveUsers(ApproachFarmer approach) {
        Set<Long> targets = new LinkedHashSet<>();
        if (approach.getLastMessageAt() == null || approach.getLastMessageSenderId() == null) {
            targets.add(approach.getUserId());
            targets.add(approach.getFarmerId());
            return targets;
        }
        if (approach.getLastMessageSenderId().equals(approach.getUserId())) {
            targets.add(approach.getFarmerId());
            return targets;
        }
        if (approach.getLastMessageSenderId().equals(approach.getFarmerId())) {
            targets.add(approach.getUserId());
            return targets;
        }
        targets.add(approach.getUserId());
        targets.add(approach.getFarmerId());
        return targets;
    }

    private String buildInactivityMessage(ApproachFarmer approach, Long targetUserId) {
        boolean targetIsBuyer = targetUserId != null && targetUserId.equals(approach.getUserId());
        String counterpart = targetIsBuyer ? approach.getFarmerName() : approach.getUserName();
        return "Your accepted request for " + approach.getCropName()
                + " has been inactive for 48 hours. Reply to " + counterpart
                + " within 24 hours to keep the request active.";
    }

    private ChatMessageDTO toRealtimeMessage(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setConversationId(message.getConversationId());
        dto.setSenderId(message.getSenderId());
        dto.setMessageText(message.getMessageText());
        dto.setMessageType(message.getMessageType().name());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setIsRead(message.getIsRead());
        dto.setReadAt(message.getReadAt());
        dto.setDeliveryStatus(message.getDeliveryStatus() == null ? null : message.getDeliveryStatus().name());
        return dto;
    }

    private ConversationSummaryDTO toConversationSummary(Conversation conversation, Long actorId) {
        ConversationSummaryDTO dto = new ConversationSummaryDTO();
        dto.setConversationId(conversation.getConversationId());
        dto.setApproachId(conversation.getApproachId());
        dto.setBuyerId(conversation.getBuyerId());
        dto.setBuyerName(conversation.getBuyerName());
        dto.setFarmerId(conversation.getFarmerId());
        dto.setFarmerName(conversation.getFarmerName());
        dto.setListingId(conversation.getListingId());
        dto.setListingName(conversation.getListingName());
        dto.setRequestedQuantity(conversation.getRequestedQuantity());
        dto.setPendingDealQuantity(conversation.getPendingDealQuantity());
        dto.setBuyerDealConfirmed(conversation.getBuyerDealConfirmed());
        dto.setFarmerDealConfirmed(conversation.getFarmerDealConfirmed());
        dto.setStatus(conversation.getStatus().name());
        dto.setActive(conversation.getActive());
        dto.setLastMessageAt(conversation.getLastMessageAt());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());
        dto.setCompletedAt(conversation.getCompletedAt());
        dto.setArchived(Boolean.FALSE);
        dto.setBuyerUnreadCount(conversation.getBuyerUnreadCount());
        dto.setFarmerUnreadCount(conversation.getFarmerUnreadCount());
        dto.setUnreadCount(actorId != null && actorId.equals(conversation.getBuyerId())
                ? conversation.getBuyerUnreadCount()
                : conversation.getFarmerUnreadCount());
        dto.setLastMessageSenderId(conversation.getLastMessageSenderId());
        dto.setLastMessagePreview(conversation.getLastMessagePreview());
        dto.setBlockedByMe(Boolean.FALSE);
        dto.setBlockedMe(Boolean.FALSE);
        return dto;
    }
}
