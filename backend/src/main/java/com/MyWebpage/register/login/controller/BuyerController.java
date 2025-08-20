package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.JWT.JWTService;
import com.MyWebpage.register.login.model.Farmer;
//import com.MyWebpage.register.login.service.BuyerService;
import com.MyWebpage.register.login.model.ResetPasswordRequest;
import com.MyWebpage.register.login.service.AuthResponse;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.FarmerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/buyer")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})

public class BuyerController {

    @Autowired
    private FarmerService buyerService;
    @Autowired
    private EmailService emailService;

    @PostMapping("/resetpassword")
    public ResponseEntity<String> resetpassword(@RequestBody ResetPasswordRequest resetPasswordRequest)
    {
//      Farmer farmer=buyerService.findByEmail(resetPasswordRequest.getEmail());
//      if(farmer.getRole().equals("SELLER"))
//      {
//          return new ResponseEntity<>("not found",HttpStatus.NOT_FOUND);
//      }
        System.out.println("controller ffff");
        return buyerService.resetPassword(resetPasswordRequest.getEmail(),resetPasswordRequest.getNewPassword());
    }
    @PostMapping("/register")
    public ResponseEntity<Farmer> registerBuyer(@RequestBody Farmer buyer) {
        System.out.println((buyer));
        buyer.setRole("BUYER");
        ResponseEntity<Farmer> response = buyerService.register(buyer);
        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            System.out.println("hii");
            return response;
        }
        System.out.println("Farmer registered successfully.");

        String to=response.getBody().getEmail();
        String role="";
        if(response.getBody().getRole().equals("SELLER"))
        {
            role="Farmer";
        }
        else{
            role="Trader";
        }
        String subject = "Welcome to AggriGgate - Registration Successful";
        String msg = "Dear "+role+",\n\n" +
                "Congratulations! Your registration with AggriGgate was successful.\n\n" +
                "We’re thrilled to have you onboard and can’t wait for you to explore the benefits of our platform.\n\n" +
                "If you have any questions or need assistance, feel free to contact our support team anytime.\n\n" +
                "Best regards,\n" +
                "AggriGgate Team\n" +
                "Mangalore, Karnataka\n" ;

        emailService.sendMail(to,msg,subject);

        return response;   }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginBuyer(@RequestBody Farmer buyer) {
        try {
            System.out.println("hiiii buyer");
            AuthResponse authResponse = buyerService.verify(buyer);
            if(authResponse.getFarmer().getRole().equals("SELLER"))
            {
                System.out.println(authResponse.getFarmer().getRole());
                throw new Exception();
            }
            return new ResponseEntity<>( authResponse, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>( new AuthResponse(), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/getBuyer/{farmerId}")
    public ResponseEntity<Farmer> findBuyerById(@PathVariable Long farmerId) {
        Farmer buyer = buyerService.find(farmerId);
        System.out.println(buyer);
        if(buyer.getRole().equals("SELLER"))
        {
           return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return buyer != null ? new ResponseEntity<>(buyer, HttpStatus.OK) :
                new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/update/{farmerId}")
    public ResponseEntity<String> updateBuyer(@RequestBody Farmer buyer,@PathVariable Long farmerId) {
        System.out.println("hii 1");
       buyer.setFarmerId(farmerId);

        Farmer updated = buyerService.update(buyer);
        System.out.println("hii 2"+updated);
        return updated != null ? new ResponseEntity<>("Update successful", HttpStatus.OK) :
                new ResponseEntity<>("Buyer not found", HttpStatus.NOT_FOUND);
    }
    @DeleteMapping("/delete")
    public ResponseEntity delete(@RequestBody ResetPasswordRequest resetPasswordRequest)
    {
        System.out.println(resetPasswordRequest);
        return buyerService.delete(resetPasswordRequest.getCurrentPassword(),resetPasswordRequest.getFarmerId());

    }
//    @DeleteMapping("/delete/{id}")
//    public ResponseEntity<String> deleteBuyer(@PathVariable Long id) {
//        String result = buyerService.delete(id);
//        return "success".equals(result) ? new ResponseEntity<>("Deletion successful", HttpStatus.OK) :
//                new ResponseEntity<>("Buyer not found", HttpStatus.NOT_FOUND);
//    }
@Autowired
JWTService jwtService;
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ResetPasswordRequest resetPasswordRequest,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            System.out.println(email);
            System.out.println(resetPasswordRequest);
            // Call service to handle the password change
            return  buyerService.changePassword(email,resetPasswordRequest.getFarmerId(), resetPasswordRequest.getCurrentPassword(), resetPasswordRequest.getNewPassword());


        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while changing the password.");
        }
    }

    @GetMapping("/welcome")
    public String welcomeBuyer() {
        return "Hi, Buyer!";
    }
}
