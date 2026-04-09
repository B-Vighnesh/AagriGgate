//package com.MyWebpage.register.login.service;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.stereotype.Service;
//
//@Service
//public class EmailService {
//
//    @Autowired
//    private JavaMailSender mailSender;
//
//    public void sendVerificationEmail(String to, String token) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(to);
//        message.setSubject("Verify Your Email");
//        message.setText("OTP is 1234");
//        mailSender.send(message);
//    }
//}
package com.MyWebpage.register.login.common;

import com.MyWebpage.register.login.approach.ApproachFarmer;
import com.MyWebpage.register.login.farmer.Farmer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendMail(String to, String msg, String subject) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(msg);
        mailSender.send(message);
    }

    public void sendMail(String to, String msg) throws Exception {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Buyer Request Accepted");
        message.setText(msg);
        mailSender.send(message);
    }

    public int sendVerificationEmail(String to) {
        int otp = generateOtp();
        String subject = "AagriGgate Password Reset OTP";
        String msg = "Hello,\n\n" +
                "We received a request to reset your AagriGgate account password.\n\n" +
                "Your one-time password (OTP) is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes. Please do not share it with anyone.\n\n" +
                "If you did not request a password reset, you can safely ignore this email.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(msg);
        mailSender.send(message);
        return otp;
    }

    public int sendVerificationEmail1(String to) {
        return sendRegistrationOtpEmail(to, null, null);
    }

    public int sendRegistrationOtpEmail(String to, String firstName, String username) {
        int otp = generateOtp();
        sendRegistrationOtpEmail(to, firstName, username, String.valueOf(otp));
        return otp;
    }

    public void sendRegistrationOtpEmail(String to, String firstName, String username, String otp) {
        String displayName = buildDisplayName(firstName, username);
        String subject = "Complete Your AagriGgate Registration";
        String msg = "Hello " + displayName + ",\n\n" +
                "Thank you for starting your registration with AagriGgate.\n\n" +
                "Your one-time password (OTP) is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes. Please do not share it with anyone.\n\n" +
                "If you did not initiate this registration, you can safely ignore this email.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(msg);
        mailSender.send(message);
    }

    public void sendWelcomeEmail(Farmer farmer) {
        String subject = "Welcome to AagriGgate";
        String msg = "Hello " + buildDisplayName(farmer.getFirstName(), farmer.getUsername()) + ",\n\n" +
                "Your AagriGgate account has been created successfully.\n\n" +
                "Account details:\n" +
                "Username: " + safeValue(farmer.getUsername()) + "\n" +
                "Account ID: " + safeValue(farmer.getFarmerId()) + "\n" +
                "Role: " + safeValue(farmer.getRole()) + "\n" +
                "Email: " + safeValue(farmer.getEmail()) + "\n\n" +
                "You can now sign in and continue using the platform.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";
        sendMail(farmer.getEmail(), msg, subject);
    }

    public void sendPasswordChangedEmail(Farmer farmer) {
        String subject = "Your AagriGgate Password Was Changed";
        String msg = "Hello " + buildDisplayName(farmer.getFirstName(), farmer.getUsername()) + ",\n\n" +
                "This is a confirmation that your account password was changed successfully.\n\n" +
                "Account details:\n" +
                "Username: " + safeValue(farmer.getUsername()) + "\n" +
                "Account ID: " + safeValue(farmer.getFarmerId()) + "\n\n" +
                "If you did not make this change, please reset your password immediately.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";
        sendMail(farmer.getEmail(), msg, subject);
    }

    public void sendPasswordResetOtpEmail(Farmer farmer, String otp) {
        String subject = "AagriGgate Password Reset OTP";
        String msg = "Hello " + buildDisplayName(farmer.getFirstName(), farmer.getUsername()) + ",\n\n" +
                "We received a request to reset your AagriGgate password.\n\n" +
                "Your one-time password (OTP) is: " + otp + "\n\n" +
                "This OTP is valid for 10 minutes. Please do not share it with anyone.\n\n" +
                "If you did not request this, you can ignore this email.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";
        sendMail(farmer.getEmail(), msg, subject);
    }

    public void sendLoginOtpEmail(Farmer farmer, String otp) {
        String subject = "Your AagriGgate Login OTP";
        String msg = "Hello " + buildDisplayName(farmer.getFirstName(), farmer.getUsername()) + ",\n\n" +
                "Use the following one-time password (OTP) to sign in to your AagriGgate account:\n\n" +
                "OTP: " + otp + "\n\n" +
                "This OTP is valid for 10 minutes. Please do not share it with anyone.\n\n" +
                "If you did not request this login OTP, you can safely ignore this email.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";
        sendMail(farmer.getEmail(), msg, subject);
    }

    public void sendDeletionOtpEmail(Farmer farmer, String otp) {
        String subject = "Confirm Your AagriGgate Account Deletion";
        String msg = "Hello " + buildDisplayName(farmer.getFirstName(), farmer.getUsername()) + ",\n\n" +
                "We received a request to delete your AagriGgate account.\n\n" +
                "Your one-time password (OTP) is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes. Please do not share it with anyone.\n\n" +
                "If you did not request account deletion, you can safely ignore this email and keep your account active.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";
        sendMail(farmer.getEmail(), msg, subject);
    }

    public void sendPasswordResetSuccessEmail(Farmer farmer) {
        String subject = "Your AagriGgate Password Has Been Reset";
        String msg = "Hello " + buildDisplayName(farmer.getFirstName(), farmer.getUsername()) + ",\n\n" +
                "Your password has been reset successfully.\n\n" +
                "Account details:\n" +
                "Username: " + safeValue(farmer.getUsername()) + "\n" +
                "Account ID: " + safeValue(farmer.getFarmerId()) + "\n\n" +
                "If you did not perform this action, please contact support immediately.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";
        sendMail(farmer.getEmail(), msg, subject);
    }

    public void sendApproachAcceptedEmail(ApproachFarmer approachFarmer) {
        String subject = "Your Buyer Request Was Accepted";
        String msg = "Hello " + safeValue(approachFarmer.getUserName()) + ",\n\n" +
                "Good news. Your request for the crop \"" + safeValue(approachFarmer.getCropName()) + "\" has been accepted.\n\n" +
                "Seller details:\n" +
                "Name: " + safeValue(approachFarmer.getFarmerName()) + "\n" +
                "Phone: " + safeValue(approachFarmer.getFarmerPhoneNo()) + "\n" +
                "Email: " + safeValue(approachFarmer.getFarmerEmail()) + "\n" +
                "Location: " + safeValue(approachFarmer.getFarmerLocation()) + "\n\n" +
                "You can now contact the seller and proceed with the discussion.\n\n" +
                "Regards,\n" +
                "Team AagriGgate";
        sendMail(approachFarmer.getUserEmail(), msg, subject);
    }

    private int generateOtp() {
        Random random = new Random();
        return 100000 + random.nextInt(900000);
    }

    private String buildDisplayName(String firstName, String username) {
        if (firstName != null && !firstName.isBlank()) {
            return firstName;
        }
        if (username != null && !username.isBlank()) {
            return username;
        }
        return "User";
    }

    private String safeValue(Object value) {
        return value == null ? "-" : value.toString();
    }
}
