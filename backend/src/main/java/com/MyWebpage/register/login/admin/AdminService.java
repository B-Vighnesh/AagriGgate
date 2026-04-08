package com.MyWebpage.register.login.admin;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.support.dto.SupportRequestSummaryDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AdminService {
    List<SupportRequestSummaryDTO> getAllSupportRequests();
    ResponseEntity<ApiResponse<String>> deleteSupportRequest(Long id);
}
