package com.MyWebpage.register.login.common.navbar;

import com.MyWebpage.register.login.approach.ApproachFarmerService;
import com.MyWebpage.register.login.chat.ChatService;
import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/navbar")
public class NavbarController {

    private final ChatService chatService;
    private final ApproachFarmerService approachFarmerService;
    private final NotificationService notificationService;
    private final FarmerRepo farmerRepo;

    public NavbarController(
            ChatService chatService,
            ApproachFarmerService approachFarmerService,
            NotificationService notificationService,
            FarmerRepo farmerRepo) {
        this.chatService = chatService;
        this.approachFarmerService = approachFarmerService;
        this.notificationService = notificationService;
        this.farmerRepo = farmerRepo;
    }

    @GetMapping("/counts")
    public ResponseEntity<ApiResponse<NavbarCountsDTO>> getNavbarCounts(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        Farmer user = farmerRepo.findByFarmerId(userId);
        String role = user == null || user.getRole() == null ? "" : user.getRole().trim().toUpperCase();

        long unreadRequests = switch (role) {
            case "BUYER" -> safeLong(approachFarmerService.getAcceptedCount(userId));
            case "SELLER" -> safeLong(approachFarmerService.getPendingCount(userId));
            default -> 0L;
        };

        NavbarCountsDTO dto = new NavbarCountsDTO(
                chatService.countUnreadMessages(userId),
                unreadRequests,
                notificationService.countUnread(userId)
        );
        return ResponseEntity.ok(ApiResponse.success("Navbar counts fetched", dto));
    }

    private long safeLong(Long value) {
        return value == null ? 0L : value;
    }
}
