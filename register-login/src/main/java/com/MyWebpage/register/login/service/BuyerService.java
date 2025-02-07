//package com.MyWebpage.register.login.service;
//
//import com.MyWebpage.register.login.JWT.JWTService;
//import com.MyWebpage.register.login.model.Buyer;
//import com.MyWebpage.register.login.model.VerificationToken;
//import com.MyWebpage.register.login.model.VerificationTokenBuyer;
//import com.MyWebpage.register.login.repositor.BuyerRepo;
//import com.MyWebpage.register.login.repositor.VerificationTokenRepository;
//import jakarta.transaction.Transactional;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import java.util.UUID;
//
//@Service
//public class BuyerService {
//
//    @Autowired
//    private BuyerRepo buyerRepo;
//
//    @Autowired
//    private JWTService jwtService;
//
//    @Autowired
//    AuthenticationManager authenticationManager;
//
//    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);
//
//    @Autowired
//    private OtpService otpService;
//
//    @Transactional
//    public ResponseEntity<Buyer> register(Buyer buyer) {
//        if(buyerRepo.findByEmail(buyer.getEmail()) != null) {
//            return new ResponseEntity<>(HttpStatus.CONFLICT);
//        }
//        if(otpService == null) {
//            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
//        }
//        boolean isOtpVerified = otpService.isOtpVerified(buyer.getEmail());
//
//        if (!isOtpVerified) {
//            System.out.println(otpService);
//            System.out.println("You must verify your OTP before registering.");
//            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
//        }
//
//        otpService = null;
//        buyer.setPassword(bCryptPasswordEncoder.encode(buyer.getPassword()));
//        Long buyerId = buyerRepo.getNextUserSequence();
//        buyer.setUsername(buyer.getFirstName() + buyerId);
//        buyer.setRole("BUYER");
//        buyerRepo.save(buyer);
//
//        Buyer savedBuyer = buyer;
//        return new ResponseEntity<>(savedBuyer, HttpStatus.OK);
//    }
//
//    @Autowired
//    private VerificationTokenRepository tokenRepository;
//
//    @Autowired
//    private EmailService emailService;
//
//    public void sendVerificationEmail(Buyer buyer) {
//        // Create a verification token
//        String token = UUID.randomUUID().toString();
//        VerificationTokenBuyer verificationToken = new VerificationTokenBuyer(buyer);
//        tokenRepository.save(verificationToken);
//
//        // Send the email
//        int otp = emailService.sendVerificationEmail(buyer.getEmail());
//        otpService.storeOtp(buyer.getEmail(), otp);
//    }
//
//    @Transactional
//    public AuthResponse verify(Buyer buyer) {
//        String principal = buyer.getUsername(); // Default to username
//
//        System.out.println(buyer.getUsername() + " 1");
//        if (buyer.getUsername().contains("@")) {
//            System.out.println("first if");
//            principal = buyer.getUsername(); // Use email if applicable
//        }
//        System.out.println(principal);
//
//        // Perform authentication
//        try {
//            Authentication authentication = authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(principal, buyer.getPassword())
//            );
//
//            if (authentication.isAuthenticated()) {
//                Buyer verifiedBuyer = buyerRepo.findByUsername(principal);
//                if (principal.contains("@")) {
//                    System.out.println("seco if");
//                    verifiedBuyer = buyerRepo.findByEmail(principal);
//                }
//
//                String token = jwtService.generateToken(verifiedBuyer.getUsername(), "BUYER");
//                return new AuthResponse(token, verifiedBuyer);
//            }
//        } catch (Exception e) {
//            System.out.println(e);
//        }
//        System.out.println("Authentication failed for user: ");
//        throw new BadCredentialsException("Authentication failed for user: " + principal);
//    }
//
//    @Transactional
//    public String delete(Long buyerId) {
//        Buyer buyer = buyerRepo.findByBuyerId(buyerId);
//        if(buyer != null) {
//            buyerRepo.deleteByBuyerId(buyerId);
//            return "success";
//        }
//        return "failure";
//    }
//
//    public String logout() {
//        return "loggedout";
//    }
//
//    @Transactional
//    public Buyer update(Buyer buyer) {
//        Buyer existingBuyer = buyerRepo.findByBuyerId(buyer.getBuyerId());
//        if(existingBuyer == null) {
//            return new Buyer();
//        }
//        buyer.setUsername(buyer.getFirstName() + existingBuyer.getBuyerId());
//        System.out.println(buyer);
//
//        if(buyer.getPassword().length() > 10) {
//            return buyerRepo.save(buyer);
//        }
//
//        buyer.setPassword(bCryptPasswordEncoder.encode(buyer.getPassword()));
//        return buyerRepo.save(buyer);
//    }
//
//    public String login() {
//        return "hi";
//    }
//
//    public Buyer find(Long buyerId) {
//        return buyerRepo.findByBuyerId(buyerId);
//    }
//
//    public Boolean findEmail(String email) {
//        Buyer buyer = buyerRepo.findByEmail(email);
//        return buyer != null;
//    }
//}
