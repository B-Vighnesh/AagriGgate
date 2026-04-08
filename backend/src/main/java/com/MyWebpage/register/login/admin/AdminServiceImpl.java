package com.MyWebpage.register.login.admin;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.support.SupportRequestService;
import com.MyWebpage.register.login.support.dto.SupportRequestSummaryDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);

    private final SupportRequestService supportRequestService;

    public AdminServiceImpl(SupportRequestService supportRequestService) {
        this.supportRequestService = supportRequestService;
    }

    @Override
    public List<SupportRequestSummaryDTO> getAllSupportRequests() {
        return supportRequestService.getAllSupportRequests();
    }

    @Override
    public ResponseEntity<ApiResponse<String>> deleteSupportRequest(Long id) {
        supportRequestService.softDeleteSupportRequest(id);
        logger.info("Support request deleted: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Support request deleted successfully.", "OK"));
    }
}
