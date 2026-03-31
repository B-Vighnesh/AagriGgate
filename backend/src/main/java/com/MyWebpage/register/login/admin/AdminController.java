package com.MyWebpage.register.login.admin;

import com.MyWebpage.register.login.common.ApiResponse;
import com.MyWebpage.register.login.enquiry.Enquiry;
import com.MyWebpage.register.login.enquiry.EnquiryRequestDTO;
import com.MyWebpage.register.login.news.dto.request.NewsRequest;
import com.MyWebpage.register.login.news.dto.request.TrustedSourceRequest;
import com.MyWebpage.register.login.news.dto.response.NewsResponse;
import com.MyWebpage.register.login.news.entity.TrustedSource;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsStatus;
import com.MyWebpage.register.login.news.enums.NewsType;
import com.MyWebpage.register.login.news.service.NewsService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {

    private final AdminService adminService;
    private final AdminAuthService adminAuthService;
    private final NewsService newsService;

    public AdminController(AdminService adminService, AdminAuthService adminAuthService, NewsService newsService) {
        this.adminService = adminService;
        this.adminAuthService = adminAuthService;
        this.newsService = newsService;
    }

    @GetMapping("/enquiries")
    public ResponseEntity<Page<Enquiry>> getAllEnquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getAllEnquiries(page, size));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminAuthResponse>> login(@RequestBody Admin admin) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Admin login successful", adminAuthService.login(admin)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure(exception.getMessage(), null));
        }
    }

    @PostMapping("/enquiry")
    public ResponseEntity<String> createEnquiry(@Valid @RequestBody EnquiryRequestDTO enquiryRequestDTO) {
        return adminService.createEnquiry(enquiryRequestDTO);
    }

    @DeleteMapping("/enquiry/{id}")
    public ResponseEntity<String> deleteEnquiry(@PathVariable Long id) {
        return adminService.deleteEnquiry(id);
    }

    @PostMapping("/news")
    public ResponseEntity<ApiResponse<NewsResponse>> createNews(@Valid @RequestBody NewsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("News created", newsService.createNews(request, "ADMIN")));
    }

    @PutMapping("/news/{id}")
    public ResponseEntity<ApiResponse<NewsResponse>> updateNews(@PathVariable Long id, @Valid @RequestBody NewsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("News updated", newsService.updateNews(id, request)));
    }

    @DeleteMapping("/news/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNews(@PathVariable Long id) {
        newsService.softDeleteNews(id);
        return ResponseEntity.ok(ApiResponse.success("News deleted", "OK"));
    }

    @GetMapping("/news")
    public ResponseEntity<ApiResponse<Page<NewsResponse>>> getAllNews(
            @RequestParam(required = false) NewsStatus status,
            @RequestParam(required = false) NewsCategory category,
            @RequestParam(required = false) NewsType newsType,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        return ResponseEntity.ok(ApiResponse.success("Admin news fetched", newsService.getAdminNews(status, category, newsType, keyword, page, size, sortBy)));
    }

    @PatchMapping("/news/{id}/archive")
    public ResponseEntity<ApiResponse<String>> archiveNews(@PathVariable Long id) {
        newsService.archiveNews(id);
        return ResponseEntity.ok(ApiResponse.success("News archived", "OK"));
    }

    @PatchMapping("/news/{id}/restore")
    public ResponseEntity<ApiResponse<NewsResponse>> restoreNews(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("News restored", newsService.restoreNews(id)));
    }

    @PostMapping("/sources")
    public ResponseEntity<ApiResponse<TrustedSource>> createTrustedSource(@Valid @RequestBody TrustedSourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Trusted source created", newsService.createTrustedSource(request)));
    }

    @GetMapping("/sources")
    public ResponseEntity<ApiResponse<java.util.List<TrustedSource>>> getAllSources() {
        return ResponseEntity.ok(ApiResponse.success("Trusted sources fetched", newsService.getAllTrustedSources()));
    }

    @PutMapping("/sources/{id}")
    public ResponseEntity<ApiResponse<TrustedSource>> updateTrustedSource(@PathVariable Long id, @Valid @RequestBody TrustedSourceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Trusted source updated", newsService.updateTrustedSource(id, request)));
    }

    @DeleteMapping("/sources/{id}")
    public ResponseEntity<ApiResponse<TrustedSource>> deactivateTrustedSource(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Trusted source deactivated", newsService.deactivateTrustedSource(id)));
    }

    @PostMapping("/sources/{id}/trigger-fetch")
    public ResponseEntity<ApiResponse<String>> triggerFetch(@PathVariable Long id) {
        int savedCount = newsService.triggerTrustedSourceFetch(id);
        return ResponseEntity.ok(ApiResponse.success("Trusted source fetch triggered", "Saved " + savedCount + " new items"));
    }
}
