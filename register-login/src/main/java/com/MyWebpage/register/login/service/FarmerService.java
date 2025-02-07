package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.JWT.JWTService;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.model.VerificationToken;
import com.MyWebpage.register.login.repositor.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class FarmerService {
    @Autowired
    private FarmerRepo farmerRepo;

    @Autowired
    private JWTService jwtService;
    @Autowired
    private ApproachFarmerRepo approachFarmerRepository;
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    CropRepo cropRepo;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);
    @Autowired
    private OtpService otpService;
    @Transactional
    public ResponseEntity<Farmer> register(Farmer farmer)
    {
        if(farmerRepo.findByEmail(farmer.getEmail())!=null)
        {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        if(otpService==null)
        {
            System.out.println("hiii null"+otpService);
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        boolean isOtpVerified = otpService.isOtpVerified(farmer.getEmail());

        if (!isOtpVerified) {
            System.out.println(otpService); // Print the otpService object again for debugging
            System.out.println("You must verify your OTP before registering.");

            // If OTP is not verified, return a new Farmer object with a BAD_REQUEST status

            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        otpService.setOtpVerifiedMap(farmer.getEmail(), false);
        farmer.setPassword(bCryptPasswordEncoder.encode(farmer.getPassword()));
        Long farmerId=farmerRepo.getNextUserSequence();
        farmer.setUsername(farmer.getFirstName()+farmerId);

        farmerRepo.save(farmer);
        Farmer savedFarmer=farmer;
        return new ResponseEntity<>(savedFarmer,HttpStatus.OK);

    }
    @Autowired
    private VerificationTokenRepository tokenRepository;


    @Autowired
    private EmailService emailService;
//    public void sendVerificationEmail(Farmer farmer) {
//        // Create a verification token
//        String token = UUID.randomUUID().toString();
//        VerificationToken verificationToken = new VerificationToken(farmer);
//        tokenRepository.save(verificationToken);
//
//        // Send the email
//        int otp=emailService.sendVerificationEmail(farmer.getEmail()/*, token */);
//        otpService.storeOtp(farmer.getEmail(),otp);
//    }


        // Determine if the input is an email or username
        @Transactional
        public AuthResponse verify(Farmer farmer) {
            // Determine if the input is an email or username
            String principal = farmer.getUsername(); // Default to username

            // Check if the input is in email format
            System.out.println(farmer.getUsername() + " 1");
            if (farmer.getUsername().contains("@")) {
                System.out.println("first if");
                principal = farmer.getUsername(); // Use email if applicable
            }
            System.out.println(principal);

            // Perform authentication
            try {
                Authentication authentication =
                        authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(principal, farmer.getPassword())
                        );


            // Check if authentication is successful
            if (authentication.isAuthenticated()) {
                Farmer verifiedFarmer = farmerRepo.findByUsername(principal);
                if (principal.contains("@")) {
                    System.out.println("seco if");
                    verifiedFarmer = farmerRepo.findByEmail(principal);
                }

                // Generate token using the principal (email or username)
                String token = jwtService.generateToken(verifiedFarmer.getUsername(),verifiedFarmer.getRole());

                // Return both the token and the verified Farmer object
                return new AuthResponse(token, verifiedFarmer);
            }
            } catch (Exception e) {
                System.out.println(e);
            }
            System.out.println("Authentication failed for user: ");
            throw new BadCredentialsException("Authentication failed for user: " + principal);
        }


    @Transactional
    public ResponseEntity<String> changePassword(String email,Long farmerId, String currentPassword, String newPassword) {
        // Fetch farmer by ID
        Farmer farmer = farmerRepo.findByFarmerId(farmerId);
        if (farmer == null) {
            return new ResponseEntity<>("Farmer not found", HttpStatus.NOT_FOUND);
        }

        // Check if the current password matches
        if (!bCryptPasswordEncoder.matches(currentPassword, farmer.getPassword())) {
            return new ResponseEntity<>("Current password is incorrect", HttpStatus.UNAUTHORIZED);
        }

        // Update the password with a new encoded password
        farmer.setPassword(bCryptPasswordEncoder.encode(newPassword));
        farmerRepo.save(farmer);
        String to=farmer.getEmail();
        String subject = "Your Password Has Been Reset Successfully";
        String msg = "Dear User,\n\n" +
                "We’re confirming that your password has been successfully reset. If you made this change, no further action is required.\n\n" +
                "If you did not request this change, please secure your account immediately by resetting your password .\n\n" +
                "Thank you,\n" +
                "AggriGgate\n" +
                "Mangalore, Karnataka\n" ;
emailService.sendMail(to,msg,subject);
        return new ResponseEntity<>("Password changed successfully", HttpStatus.OK);
    }


    @Transactional
    public ResponseEntity<String> delete(String password,Long farmerId) {
        Farmer farmer=farmerRepo.findByFarmerId(farmerId);
        if (farmer == null) {
            return new ResponseEntity<>("Farmer not found", HttpStatus.NOT_FOUND);
        }

        // Check if the current password matches
        if (!bCryptPasswordEncoder.matches(password, farmer.getPassword())) {
            return new ResponseEntity<>("Current password is incorrect", HttpStatus.UNAUTHORIZED);
        }

        System.out.println(farmer);
if(farmer.getRole().equals("BUYER"))
{
    System.out.println("buyer del");
    approachFarmerRepository.deleteByUserId(farmerId);


}
else if(farmer.getRole().equals("SELLER"))
{
    System.out.println("seller del");
    approachFarmerRepository.deleteByFarmerId(farmerId);
    cropRepo.deleteByFarmerId(farmerId);

}
        if(farmer!=null)
        {
            farmerRepo.deleteByFarmerId(farmerId);
            return ResponseEntity.ok("success");
        }
        return new ResponseEntity<>("failure",HttpStatus.NOT_FOUND);
    }

    public String logout() {
        return "loggedout";
    }

    @Transactional
    public Farmer update(Farmer farmer) {
        Farmer existingFarmer=farmerRepo.findByFarmerId(farmer.getFarmerId());
        if(existingFarmer==null)
        {
            return new Farmer();
        }

        System.out.println(farmer);
        if(farmer.getPassword().length()>10)
        {
            return farmerRepo.save(farmer);
        }
        farmer.setPassword(bCryptPasswordEncoder.encode(farmer.getPassword()));
        return farmerRepo.save(farmer);
    }

    public String login() {
        return "hi";
    }

    public Farmer find(Long farmerId) {
        return farmerRepo.findByFarmerId(farmerId);
    }

    public Boolean findEmail(String email) {
        Farmer farmer=farmerRepo.findByEmail(email);
        if(farmer!=null)
        {
            return true;
        }
        return false;
    }

    public Farmer findByEmail(String email) {
        return farmerRepo.findByEmail(email);
    }

    public Farmer findByUsername(String email) {
        return farmerRepo.findByUsername(email);
    }

    public ResponseEntity<String> resetPassword(String email, String newPassword) {

        System.out.println("controller ffff1"+email);
        System.out.println(newPassword);
        if(farmerRepo.findByEmail(email)==null)
        {

            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        if(otpService==null)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        boolean isOtpVerified = otpService.isOtpVerified(email);
        System.out.println("hii"+otpService);
        if (!isOtpVerified) {
            System.out.println(otpService);
            System.out.println("You must verify your OTP before registering.");

            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        otpService.setOtpVerifiedMap(email, false);

        Farmer farmer=farmerRepo.findByEmail(email);
        farmer.setPassword(bCryptPasswordEncoder.encode(newPassword));
        farmerRepo.save(farmer);
        return new ResponseEntity<>("success",HttpStatus.OK);

    }
}
