package com.MyWebpage.register.login.controller;
import com.MyWebpage.register.login.JWT.JWTService;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.model.ResetPasswordRequest;
import com.MyWebpage.register.login.service.AuthResponse;
import com.MyWebpage.register.login.service.EmailService;
import com.MyWebpage.register.login.service.FarmerService;
import com.MyWebpage.register.login.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})

public class FarmerController {
    @Autowired
    private FarmerService farmerService;

    @Autowired
    private EmailService emailService;
    @Autowired
            private JWTService jwtService;
    List<Farmer> list = new ArrayList<>(List.of(
            new Farmer(101L, "A", "A123"),
            new Farmer(102L, "B", "B123")
    ));
    @GetMapping("/sessionid")
    public String login(HttpServletRequest request)
    {
        //fetching sessionid request.getSession().getId()
        return farmerService.login()+ " "+request.getSession().getId();
    }
    @GetMapping("/user")
    public Farmer getUsers()
    {
        System.out.println("hii iam getusers");
        return new Farmer(102L, "B", "B123");
    }
    @PostMapping("/user")
    public void setUsers()
    {
        list.add(new Farmer(103L,"C","C123"));


    }
//    @Autowired
//    ApplicationContext applicationContext;
//    @PostMapping("/token")
//    public ResponseEntity<String> validateToken(@RequestHeader("Authorization") String authHeader) {
//        String token = null;
//        String username = null;
//
//        if (authHeader != null && authHeader.startsWith("Bearer ")) {
//            token = authHeader.substring(7);
//            username = jwtService.extractUsername(token);
//        }
//
//        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//            UserDetails userDetails = applicationContext.getBean(MyUserDetailsService.class).loadUserByUsername(username);
//
//            if (jwtService.validateToken(token, userDetails)) {
//                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                        userDetails,
//                        null,
//                        userDetails.getAuthorities()
//                );
//
//                // Setting the authentication details
//                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(null));
//                SecurityContextHolder.getContext().setAuthentication(authToken);
//
//                return ResponseEntity.ok("Token is valid");
//            }
//        }
//
//        return ResponseEntity.status(401).body("Invalid or expired token");
//    }
    @GetMapping("/csrf")
    public CsrfToken getToken(HttpServletRequest request)
    {
        return (CsrfToken) request.getAttribute("_csrf");
    }
    @GetMapping("/getBuyer/{farmerId}")
    public ResponseEntity<Farmer> findBuyerById(@PathVariable Long farmerId) {
        Farmer buyer =farmerService.find(farmerId);
        System.out.println(buyer);
        if(buyer.getRole().equals("SELLER"))
        {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return buyer != null ? new ResponseEntity<>(buyer, HttpStatus.OK) :
                new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    @GetMapping("/getFarmer/{farmerId}")
    public ResponseEntity<Farmer> getFarmer(@PathVariable Long farmerId)
    {
        System.out.println("hiiiiiiiiiiii");
        try {
            Farmer curFarmer = farmerService.find(farmerId);
            System.out.println(curFarmer);
            if(curFarmer.getRole().equals("BUYER"))
            {
               return  new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(curFarmer, HttpStatus.OK);
        }
        catch (Exception e) {
            return new ResponseEntity<>(new Farmer() , HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @PostMapping("/register")
    public ResponseEntity<Farmer> register(@RequestBody Farmer farmer) {
        farmer.setRole("SELLER");
        ResponseEntity<Farmer> response = farmerService.register(farmer);
        System.out.println(farmer);

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
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

        return response;
    }
@PostMapping("/resetpassword")
public ResponseEntity<String> resetpassword(@RequestBody ResetPasswordRequest resetPasswordRequest)
{
//    Farmer farmer=farmerService.findByEmail(resetPasswordRequest.getEmail());
//    if(farmer.getRole().equals("BUYER"))
//    {
//        return new ResponseEntity<>("not found",HttpStatus.NOT_FOUND);
//    }
    System.out.println("controller ffff");
    return farmerService.resetPassword(resetPasswordRequest.getEmail(),resetPasswordRequest.getNewPassword());
}
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody Farmer farmer) {
       try{ System.out.println("hiiii seller");
        AuthResponse authResponse = farmerService.verify(farmer);
        if (authResponse.getFarmer().getRole().equals("BUYER")) {
            System.out.println(authResponse.getFarmer().getRole());
            throw new Exception();
        }
        System.out.println(authResponse + "jhhhhhhhhhhh");
        return ResponseEntity.ok(authResponse);
    }
        catch (Exception e) {
            return new ResponseEntity<>( new AuthResponse(), HttpStatus.UNAUTHORIZED);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity delete(  @RequestBody ResetPasswordRequest resetPasswordRequest)
    {
        System.out.println("hii bu");
        System.out.println(resetPasswordRequest);
        return farmerService.delete(resetPasswordRequest.getCurrentPassword(),resetPasswordRequest.getFarmerId());
      
    }
//    @DeleteMapping("/delete/{farmerId}")
//    public ResponseEntity delet(@PathVariable Long farmerId)
//    {
//        farmerService.delete(farmerId);
//        return new ResponseEntity(HttpStatus.OK);
//    }
    @PutMapping("/update/{farmerId}")
    public ResponseEntity<Farmer> update(@RequestBody Farmer farmer,@PathVariable Long farmerId)
    {
        farmer.setFarmerId(farmerId);
        System.out.println(farmer);

        Farmer updatedFarmer=farmerService.update(farmer);
        System.out.println(updatedFarmer);
        if(updatedFarmer==null)
        {
            return new ResponseEntity<>(updatedFarmer,HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(updatedFarmer,HttpStatus.OK);
    }
    @GetMapping("/findEmail/{email}")
    public Boolean logout(@PathVariable String email)
    {
        System.out.println("hii");
        return farmerService.findEmail(email);
    }
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ResetPasswordRequest resetPasswordRequest,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            System.out.println(email);
            System.out.println(resetPasswordRequest);
            return farmerService.changePassword(email,resetPasswordRequest.getFarmerId(), resetPasswordRequest.getCurrentPassword(), resetPasswordRequest.getNewPassword());


        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while changing the password.");
        }
    }

    @Autowired
    private JWTService jwt;

    @GetMapping("/a")
    public String hello()
    {

        return "hii seller";
    }

}
