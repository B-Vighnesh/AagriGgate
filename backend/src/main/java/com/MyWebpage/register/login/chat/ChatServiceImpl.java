package com.MyWebpage.register.login.chat;

import com.MyWebpage.register.login.approach.ApproachFarmer;
import com.MyWebpage.register.login.approach.ApproachFarmerRepo;
import com.MyWebpage.register.login.chat.dto.ChatMessageDTO;
import com.MyWebpage.register.login.chat.dto.ConversationSummaryDTO;
import com.MyWebpage.register.login.chat.dto.DealConfirmationRequestDTO;
import com.MyWebpage.register.login.chat.dto.DealConfirmationResultDTO;
import com.MyWebpage.register.login.crop.Crop;
import com.MyWebpage.register.login.crop.CropDealService;
import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ApproachFarmerRepo approachFarmerRepo;
    private final CropDealService cropDealService;
    private final ChatRealtimeService chatRealtimeService;

    public ChatServiceImpl(
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            ApproachFarmerRepo approachFarmerRepo,
            CropDealService cropDealService,
            ChatRealtimeService chatRealtimeService) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.approachFarmerRepo = approachFarmerRepo;
        this.cropDealService = cropDealService;
        this.chatRealtimeService = chatRealtimeService;
    }

    @Override
    public ConversationSummaryDTO createOrGetConversationForApproach(Long approachId, Long actorId) {
        return toSummary(ensureConversationForAcceptedApproach(approachId, actorId));
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationSummaryDTO getConversation(Long conversationId, Long actorId) {
        return toSummary(requireParticipantConversation(conversationId, actorId));
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationSummaryDTO getConversationByApproach(Long approachId, Long actorId) {
        Conversation conversation = conversationRepository.findByApproachId(approachId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        validateParticipant(conversation, actorId);
        return toSummary(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationSummaryDTO> getConversationsForUser(Long actorId) {
        return conversationRepository.findByBuyerIdOrFarmerIdOrderByLastMessageAtDescUpdatedAtDesc(actorId, actorId)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessages(Long conversationId, Long actorId) {
        Conversation conversation = requireParticipantConversation(conversationId, actorId);
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getConversationId())
                .stream()
                .map(this::toMessageDto)
                .toList();
    }

    @Override
    public ChatMessageDTO postMessage(Long conversationId, Long senderId, String messageText) {
        if (messageText == null || messageText.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }
        Conversation conversation = requireParticipantConversation(conversationId, senderId);
        if (conversation.getStatus() != ConversationStatus.ACTIVE || !Boolean.TRUE.equals(conversation.getActive())) {
            throw new IllegalArgumentException("This conversation is closed");
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setConversationId(conversation.getConversationId());
        chatMessage.setSenderId(senderId);
        chatMessage.setMessageText(messageText.trim());
        chatMessage.setMessageType(MessageType.USER);
        chatMessage = chatMessageRepository.save(chatMessage);

        touchConversation(conversation, chatMessage.getCreatedAt());
        Conversation savedConversation = conversationRepository.save(conversation);
        ChatMessageDTO dto = toMessageDto(chatMessage);
        chatRealtimeService.sendToConversation(savedConversation, "CHAT_MESSAGE", dto, null);
        chatRealtimeService.sendToConversation(savedConversation, "CONVERSATION_UPDATE", toSummary(savedConversation), null);
        return dto;
    }

    @Override
    public DealConfirmationResultDTO confirmDeal(Long conversationId, Long actorId, DealConfirmationRequestDTO request) {
        Conversation conversation = requireParticipantConversation(conversationId, actorId);
        if (conversation.getStatus() != ConversationStatus.ACTIVE || !Boolean.TRUE.equals(conversation.getActive())) {
            throw new IllegalArgumentException("This conversation is closed");
        }

        double agreedQuantity = resolveDealQuantity(conversation, request);
        boolean quantityChanged = conversation.getPendingDealQuantity() == null
                || Double.compare(conversation.getPendingDealQuantity(), agreedQuantity) != 0;

        if (quantityChanged) {
            conversation.setPendingDealQuantity(agreedQuantity);
            conversation.setBuyerDealConfirmed(false);
            conversation.setFarmerDealConfirmed(false);
        }

        if (actorId.equals(conversation.getBuyerId())) {
            conversation.setBuyerDealConfirmed(true);
        } else if (actorId.equals(conversation.getFarmerId())) {
            conversation.setFarmerDealConfirmed(true);
        }

        ChatMessage systemMessage;
        DealConfirmationResultDTO result = new DealConfirmationResultDTO();
        result.setAgreedQuantity(agreedQuantity);

        if (Boolean.TRUE.equals(conversation.getBuyerDealConfirmed()) && Boolean.TRUE.equals(conversation.getFarmerDealConfirmed())) {
            Crop updatedCrop = cropDealService.confirmDealQuantity(conversation.getListingId(), agreedQuantity);
            conversation.setStatus(ConversationStatus.COMPLETED);
            conversation.setActive(false);
            conversation.setCompletedAt(LocalDateTime.now());
            touchConversation(conversation, LocalDateTime.now());

            ApproachFarmer approach = approachFarmerRepo.findById(conversation.getApproachId())
                    .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
            approach.setStatus("Completed");
            approachFarmerRepo.save(approach);

            systemMessage = createSystemMessage(conversation.getConversationId(),
                    "Deal confirmed for " + agreedQuantity + " units. Listing updated successfully.");

            result.setCompleted(true);
            result.setRemainingQuantity(updatedCrop.getQuantity());
            result.setListingStatus(updatedCrop.getStatus());
            result.setMessage("Deal confirmed and listing updated.");
        } else {
            touchConversation(conversation, LocalDateTime.now());
            String proposer = actorId.equals(conversation.getBuyerId()) ? conversation.getBuyerName() : conversation.getFarmerName();
            systemMessage = createSystemMessage(conversation.getConversationId(),
                    proposer + " confirmed deal quantity " + agreedQuantity + ". Waiting for the other side.");
            result.setCompleted(false);
            result.setRemainingQuantity(null);
            result.setListingStatus(null);
            result.setMessage("Deal confirmation saved. Waiting for the other user.");
        }

        Conversation savedConversation = conversationRepository.save(conversation);
        ChatMessage savedSystemMessage = chatMessageRepository.save(systemMessage);
        ChatMessageDTO messageDto = toMessageDto(savedSystemMessage);
        ConversationSummaryDTO summaryDTO = toSummary(savedConversation);

        chatRealtimeService.sendToConversation(savedConversation, "CHAT_MESSAGE", messageDto, null);
        chatRealtimeService.sendToConversation(savedConversation, "CONVERSATION_UPDATE", summaryDTO, result.getMessage());

        result.setConversation(summaryDTO);
        return result;
    }

    public Conversation ensureConversationForAcceptedApproach(Long approachId, Long actorId) {
        Conversation existing = conversationRepository.findByApproachId(approachId).orElse(null);
        if (existing != null) {
            validateParticipant(existing, actorId);
            return existing;
        }

        ApproachFarmer approach = approachFarmerRepo.findById(approachId)
                .orElseThrow(() -> new ResourceNotFoundException("Accepted request not found"));
        if (!approach.isActive() || approach.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Accepted request not found");
        }
        if (!"accepted".equalsIgnoreCase(approach.getStatus())) {
            throw new IllegalArgumentException("Conversation is available only after farmer acceptance");
        }
        if (!Objects.equals(actorId, approach.getFarmerId()) && !Objects.equals(actorId, approach.getUserId())) {
            throw new IllegalArgumentException("You cannot access this conversation");
        }

        Conversation conversation = new Conversation();
        conversation.setApproachId(approach.getApproachId());
        conversation.setBuyerId(approach.getUserId());
        conversation.setBuyerName(approach.getUserName());
        conversation.setFarmerId(approach.getFarmerId());
        conversation.setFarmerName(approach.getFarmerName());
        conversation.setListingId(approach.getCropId());
        conversation.setListingName(approach.getCropName());
        conversation.setRequestedQuantity(approach.getRequestedQuantity() == null ? 1.0 : approach.getRequestedQuantity());
        conversation.setStatus(ConversationStatus.ACTIVE);
        conversation.setActive(true);
        conversation = conversationRepository.save(conversation);

        ChatMessage welcomeMessage = createSystemMessage(
                conversation.getConversationId(),
                "Conversation started. You can now negotiate and confirm the final deal here."
        );
        chatMessageRepository.save(welcomeMessage);
        return conversation;
    }

    private Conversation requireParticipantConversation(Long conversationId, Long actorId) {
        Conversation conversation = conversationRepository
                .findByConversationIdAndBuyerIdOrConversationIdAndFarmerId(conversationId, actorId, conversationId, actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        validateParticipant(conversation, actorId);
        return conversation;
    }

    private void validateParticipant(Conversation conversation, Long actorId) {
        if (!Objects.equals(conversation.getBuyerId(), actorId) && !Objects.equals(conversation.getFarmerId(), actorId)) {
            throw new IllegalArgumentException("You cannot access this conversation");
        }
    }

    private double resolveDealQuantity(Conversation conversation, DealConfirmationRequestDTO request) {
        if (request == null) {
            return conversation.getRequestedQuantity();
        }
        if (request.isUseRequestedQuantity()) {
            return conversation.getRequestedQuantity();
        }
        double quantity = request.getQuantity() == null ? 0.0 : request.getQuantity();
        if (quantity <= 0) {
            throw new IllegalArgumentException("Updated quantity must be greater than zero");
        }
        return quantity;
    }

    private void touchConversation(Conversation conversation, LocalDateTime timestamp) {
        conversation.setLastMessageAt(timestamp);
        conversation.setUpdatedAt(timestamp);
    }

    private ChatMessage createSystemMessage(Long conversationId, String message) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setConversationId(conversationId);
        chatMessage.setSenderId(null);
        chatMessage.setMessageType(MessageType.SYSTEM);
        chatMessage.setMessageText(message);
        chatMessage.setCreatedAt(LocalDateTime.now());
        return chatMessage;
    }

    private ConversationSummaryDTO toSummary(Conversation conversation) {
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
        return dto;
    }

    private ChatMessageDTO toMessageDto(ChatMessage chatMessage) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setMessageId(chatMessage.getMessageId());
        dto.setConversationId(chatMessage.getConversationId());
        dto.setSenderId(chatMessage.getSenderId());
        dto.setMessageText(chatMessage.getMessageText());
        dto.setMessageType(chatMessage.getMessageType().name());
        dto.setCreatedAt(chatMessage.getCreatedAt());
        return dto;
    }
}
