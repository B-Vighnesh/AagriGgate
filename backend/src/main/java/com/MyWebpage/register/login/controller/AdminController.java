package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.dto.EnquiryRequestDTO;
import com.MyWebpage.register.login.model.Admin;
import com.MyWebpage.register.login.model.Enquiry;
import com.MyWebpage.register.login.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/enquiries")
    public ResponseEntity<Page<Enquiry>> getAllEnquiries(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (adminUsername.equals(username) && adminPassword.equals(password)) {
            return ResponseEntity.ok(adminService.getAllEnquiries(page, size));
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Admin admin) {
        if (adminUsername.equals(admin.getUsername()) && adminPassword.equals(admin.getPassword())) {
            return ResponseEntity.ok("Login successful");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/enquiry")
    public ResponseEntity<String> createEnquiry(@Valid @RequestBody EnquiryRequestDTO enquiryRequestDTO) {
        return adminService.createEnquiry(enquiryRequestDTO);
    }

    @DeleteMapping("/enquiry/{id}")
    public ResponseEntity<String> deleteEnquiry(@PathVariable Long id) {
        return adminService.deleteEnquiry(id);
    }
}
