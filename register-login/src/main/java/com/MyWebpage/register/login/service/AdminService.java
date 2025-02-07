package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.model.Enquiry;
import com.MyWebpage.register.login.repositor.EnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    @Autowired
    private EnquiryRepository enquiryRepository;

    public ResponseEntity<String> createEnquiry(Enquiry enquiry) {
        if (enquiry.getMessage() == null || enquiry.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body("Message is required.");
        }
        enquiryRepository.save(enquiry);
        System.out.println("hii gggg");
        return ResponseEntity.ok("Enquiry submitted successfully!");
    }

    public ResponseEntity<List<Enquiry>> getAllEnquiries() {
        List<Enquiry> enquiries = enquiryRepository.findAll();
        return ResponseEntity.ok(enquiries);
    }

    public ResponseEntity<String> deleteEnquiry(Long id) {

        Optional<Enquiry> enquiry = enquiryRepository.findById(id);
        if (enquiry.isPresent()) {
            enquiryRepository.deleteById(id);
            return ResponseEntity.ok("Enquiry deleted successfully!");
        } else {
            return ResponseEntity.status(404).body("Enquiry not found.");
        }
    }
}
