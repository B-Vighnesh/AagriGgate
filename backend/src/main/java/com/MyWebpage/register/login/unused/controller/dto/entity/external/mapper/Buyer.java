////package com.MyWebpage.register.login.model;
////
////import jakarta.persistence.Entity;
////import jakarta.persistence.Id;
////import org.springframework.stereotype.Component;
////
////@Component
////@Entity
////public class Users {
////    @Id
////    private Long id;
////    private String username;
////    private String password;
////
////    public Users()
////    {
////
////    }
////    public Users(Long id, String username, String password) {
////        this.id = id;
////        this.username = username;
////        this.password = password;
////    }
////
////    @Override
////    public String toString() {
////        return "Users{" +
////                "id=" + id +
////                ", username='" + username + '\'' +
////                ", password='" + password + '\'' +
////                '}';
////    }
////
////    public Long getId() {
////        return id;
////    }
////
////    public void setId(Long id) {
////        this.id = id;
////    }
////
////    public String getUsername() {
////        return username;
////    }
////
////    public void setUsername(String username) {
////        this.username = username;
////    }
////
////    public String getPassword() {
////        return password;
////    }
////
////    public void setPassword(String password) {
////        this.password = password;
////    }
////
////
////}
//package com.MyWebpage.register.login.model;
//
//import jakarta.persistence.*;
//import org.springframework.stereotype.Component;
//
//import java.util.List;
//
//@Component
//@Entity
//public class Buyer {
//    @Id
//    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "buyer_seq")
//    @SequenceGenerator(name = "buyer_seq", sequenceName = "buyer_sequence", initialValue = 10101, allocationSize = 1)
//    private Long buyerId;
//    private String username;
//    private String firstName;
//    private String lastName;
//    private String email;
//    private String phoneNo;
//    private String dob;
//    private String state;
//    private String city;
//    private String district;
//    private String aadharNo;
//    private String password;
//    private String role;
//
//    public String getRole() {
//        return role;
//    }
//
//    public void setRole(String role) {
//        this.role = role;
//    }
//
//    public String getCity() {
//        return city;
//    }
//
//    public void setCity(String city) {
//        this.city = city;
//    }
//
//    public Buyer(){
//
//    }
//    public Buyer(Long farmerId, String username, String firstName, String lastName, String email, String phoneNo, String dob, String state, String district, String aadharNo, String password, List<Crop> crops) {
//        this.buyerId = farmerId;
//        this.username = username;
//        this.firstName = firstName;
//        this.lastName = lastName;
//        this.email = email;
//        this.phoneNo = phoneNo;
//        this.dob = dob;
//        this.state = state;
//        this.district = district;
//        this.aadharNo = aadharNo;
//        this.password = password;
//
//    }
//
//    public Buyer(Long buyerId, String username, String password) {
//        this.buyerId = buyerId;
//        this.username = username;
//        this.password = password;
//    }
//
//    @Override
//    public String toString() {
//        return "Buyer{" +
//                "buyerId=" + buyerId +
//                ", username='" + username + '\'' +
//                ", firstName='" + firstName + '\'' +
//                ", lastName='" + lastName + '\'' +
//                ", email='" + email + '\'' +
//                ", phoneNo='" + phoneNo + '\'' +
//                ", dob='" + dob + '\'' +
//                ", state='" + state + '\'' +
//                ", city='" + city + '\'' +
//                ", district='" + district + '\'' +
//                ", aadharNo='" + aadharNo + '\'' +
//                ", password='" + password + '\'' +
//                '}';
//    }
//
//    public Long getBuyerId() {
//        return buyerId;
//    }
//
//    public void setBuyerId(Long buyerId) {
//        this.buyerId = buyerId;
//    }
//
//    public String getUsername() {
//        return username;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public String getFirstName() {
//        return firstName;
//    }
//
//    public void setFirstName(String firstName) {
//        this.firstName = firstName;
//    }
//
//    public String getLastName() {
//        return lastName;
//    }
//
//    public void setLastName(String lastName) {
//        this.lastName = lastName;
//    }
//
//    public String getEmail() {
//        return email;
//    }
//
//    public void setEmail(String email) {
//        this.email = email;
//    }
//
//    public String getPhoneNo() {
//        return phoneNo;
//    }
//
//    public void setPhoneNo(String phoneNo) {
//        this.phoneNo = phoneNo;
//    }
//
//    public String getState() {
//        return state;
//    }
//
//    public void setState(String state) {
//        this.state = state;
//    }
//
//    public String getDob() {
//        return dob;
//    }
//
//    public void setDob(String dob) {
//        this.dob = dob;
//    }
//
//    public String getDistrict() {
//        return district;
//    }
//
//    public void setDistrict(String district) {
//        this.district = district;
//    }
//
//    public String getAadharNo() {
//        return aadharNo;
//    }
//
//    public void setAadharNo(String aadharNo) {
//        this.aadharNo = aadharNo;
//    }
//
//    public String getPassword() {
//        return password;
//    }
//
//    public void setPassword(String password) {
//        this.password = password;
//    }
//
//
//}
