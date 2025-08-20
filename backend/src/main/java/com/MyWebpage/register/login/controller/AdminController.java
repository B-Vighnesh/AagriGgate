package com.MyWebpage.register.login.controller;
import com.MyWebpage.register.login.model.Admin;
import com.MyWebpage.register.login.model.Enquiry;
import com.MyWebpage.register.login.repositor.EnquiryRepository;
import com.MyWebpage.register.login.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/enquiries")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})

public class AdminController {

    @Autowired
    private EnquiryRepository enquiryRepository;
    private final String ADMIN_USERNAME = "Vighnesh";
    private final String ADMIN_PASSWORD = "1234";
    @Autowired
    AdminService adminService;
    // Create a new enquiry
    @GetMapping("/getAll")
    public ResponseEntity<List<Enquiry>> getAllEnquiries(@RequestBody Admin admin) {
        System.out.println("hii iam e");
        if (admin.getUsername().equals(ADMIN_USERNAME) && admin.getPassword().equals(ADMIN_PASSWORD)) {
            System.out.println("hii iam ee");
            return adminService.getAllEnquiries();
        }
        else{
            System.out.println("hii iam eee");
            return new ResponseEntity<>(List.of(new Enquiry()),HttpStatus.UNAUTHORIZED);
        }
    }
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Admin admin) {
        if (admin.getUsername().equals(ADMIN_USERNAME) && admin.getPassword().equals(ADMIN_PASSWORD)) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
    @PostMapping("/enquiry")
    public ResponseEntity<String> createEnquiry(@RequestBody Enquiry enquiry) {
        return adminService.createEnquiry(enquiry);


    }

    // Get all enquiries


    // Delete an enquiry by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEnquiry(@PathVariable Long id) {
        return adminService.deleteEnquiry(id);
    }
}
