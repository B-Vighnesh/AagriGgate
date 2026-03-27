package com.MyWebpage.register.login.admin;

import com.MyWebpage.register.login.enquiry.EnquiryRequestDTO;
import com.MyWebpage.register.login.enquiry.Enquiry;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

public interface AdminService {
    ResponseEntity<String> createEnquiry(EnquiryRequestDTO enquiryRequestDTO);
    Page<Enquiry> getAllEnquiries(int page, int size);
    ResponseEntity<String> deleteEnquiry(Long id);
}
