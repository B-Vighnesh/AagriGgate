//package com.MyWebpage.register.login.model;
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//public class VerificationTokenBuyer {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String token;
//
//    @OneToOne(targetEntity = Buyer.class, fetch = FetchType.EAGER)
//    @JoinColumn(nullable = false, name = "buyer_id")
//    private Buyer buyer;
//
//    private LocalDateTime expiryDate;
//
//    public VerificationTokenBuyer(Buyer buyer) {
//        this.buyer=buyer;
//        this.token=token;
//    }
//
//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public String getToken() {
//        return token;
//    }
//
//    public void setToken(String token) {
//        this.token = token;
//    }
//
//    public Buyer getFarmer() {
//        return buyer;
//    }
//
//    public void setBuyer(Buyer buyer) {
//        this.buyer = buyer;
//    }
//
//    public LocalDateTime getExpiryDate() {
//        return expiryDate;
//    }
//
//    public void setExpiryDate(LocalDateTime expiryDate) {
//        this.expiryDate = expiryDate;
//    }
//// Getters and Setters
//}
