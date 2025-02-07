package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.FarmerService;
import com.MyWebpage.register.login.service.OtpService;
import org.eclipse.angus.mail.util.MailConnectException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSendException;
import org.springframework.web.bind.annotation.*;

import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private final OtpService otpService;

    @Autowired
    private FarmerService farmerService;
    @Autowired
    public AuthController(OtpService otpService) {
        this.otpService = otpService;
    }
    @GetMapping("/isTokenValid")
    public ResponseEntity<Boolean> isTokenValid()
    {
        return new ResponseEntity<>(true,HttpStatus.OK);
    }
    @PostMapping("/reset-otp/{principal}")
    public ResponseEntity<String> send2Otp(@PathVariable String principal) {
        try {
            Farmer foundFarmer;
            if (principal.contains("@")) {
                foundFarmer = farmerService.findByEmail(principal);
            } else {
                foundFarmer = farmerService.findByUsername(principal);
            }
            String email = foundFarmer.getEmail();
            int otp = emailService.sendVerificationEmail(email);
            otpService.storeOtp(email, otp);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent to email!");
            response.put("success", true);

            return new ResponseEntity<>(email, HttpStatus.OK);
        }
        catch(MailSendException e)
        {
            System.out.println(e);
            return new ResponseEntity<>("server busy", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        catch(Exception e)
        {
            System.out.println("not found"+e);
            return new ResponseEntity<>("not found", HttpStatus.NOT_FOUND);
        }
    }
    @PostMapping("/send-otp/{email}")
    public ResponseEntity<Map<String, Object>> send1Otp(@PathVariable String email) {
        try{

            int otp = emailService.sendVerificationEmail1(email);
        otpService.storeOtp(email, otp);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent to email!");
        response.put("success", true);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
        catch(Exception e)
        {
            Map<String, Object> response = new HashMap<>();
            System.out.println("hii");
            response.put("message", "not found");
            response.put("success", false);
            System.out.println(e);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestParam String email, @RequestParam int otp) {
        Map<String, Object> response = new HashMap<>();
        System.out.println(email+""+otp);
        if (otpService.verifyOtp(email, otp)) {
    otpService.clearOtp(email);
            response.put("message", "OTP verified successfully!");
            response.put("success", true);
            otpService.setOtpVerifiedMap(email,true);
            System.out.println(otpService+"in auth");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("message", "Invalid OTP!");
            response.put("success", false);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}
