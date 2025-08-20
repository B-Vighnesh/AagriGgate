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
package com.MyWebpage.register.login.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendMail(String to, String msg,String subject)
    {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(msg);
        mailSender.send(message);


    }
    public void sendMail(String to, String msg) throws Exception
    {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Request has been accepted");
        message.setText(msg);
        mailSender.send(message);
    }
    public int sendVerificationEmail(String to) {
        int otp = generateOtp();
        String subject = "OTP to Reset Your Password";
        String msg = "Dear User,\n\n" +
                "We received a request to reset your password. If you did not make this request, you can safely ignore this email.\n\n" +
                "To reset your password, OTP is:\n\n" +otp+
                "\n\nThis OTP is valid for 5 minutes. Please do not share it with anyone.If it has expired, you will need to request a new password reset.\n\n" +
                "If you did not initiate this request, please ignore this email.\n\n" +
                "Thank you for registering with AggriGgate!\n\n" +
                "Best regards,\n" +
                "AggriGgate\n" +
                "Mangalore, Karnataka\n" ;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(msg);
        mailSender.send(message);
        return otp;
    }
    public int sendVerificationEmail1(String to) {
        int otp = generateOtp();
        String subject = "Your OTP for Registration";
        String msg = "Dear User,\n\n" +
                "Your One-Time Password  for completing your registration is:\n\n" +otp +
                "\n\nThis OTP is valid for 5 minutes. Please do not share it with anyone.\n\n" +
                "If you did not initiate this registration, please ignore this email .\n\n" +
                "Thank you for registering with AggriGgate!\n\n" +
                "Best regards,\n" +
                "AggriGgate\n" +
                "Mangalore, Karnataka\n" ;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(msg);

        mailSender.send(message);
        return otp;
    }
//    public void sendMail(String to)
//    {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(to);
//        message.setSubject("Verify Your Email");
//        message.setText("Your OTP is: " + otp);
//        mailSender.send(message);
//    }

    private int generateOtp() {
        Random random = new Random();
        return 100000 + random.nextInt(900000);
    }
}
