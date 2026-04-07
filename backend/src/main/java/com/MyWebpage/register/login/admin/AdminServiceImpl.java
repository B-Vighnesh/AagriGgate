package com.MyWebpage.register.login.admin;

import com.MyWebpage.register.login.enquiry.EnquiryRequestDTO;
import com.MyWebpage.register.login.enquiry.Enquiry;
import com.MyWebpage.register.login.enquiry.EnquiryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);

    private final EnquiryRepository enquiryRepository;

    public AdminServiceImpl(EnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    @Override
    public ResponseEntity<String> createEnquiry(EnquiryRequestDTO enquiryRequestDTO) {
        Enquiry enquiry = new Enquiry();
        enquiry.setMessage(enquiryRequestDTO.getMessage());
        enquiryRepository.save(enquiry);
        logger.info("Enquiry created: {}", enquiry.getId());
        return ResponseEntity.ok("Enquiry submitted successfully!");
    }

    @Override
    public Page<Enquiry> getAllEnquiries(int page, int size) {
        return enquiryRepository.findByActiveTrue(PageRequest.of(page, size));
    }

    @Override
    public ResponseEntity<String> deleteEnquiry(Long id) {
        if (enquiryRepository.softDeleteById(id, LocalDateTime.now()) > 0) {
            logger.info("Enquiry deleted: {}", id);
            return ResponseEntity.ok("Enquiry deleted successfully!");
        }
        return ResponseEntity.status(404).body("Enquiry not found.");
    }
}
