//package com.MyWebpage.register.login.model;
//
//import jakarta.persistence.Entity;
//import jakarta.persistence.Id;
//import org.springframework.stereotype.Component;
//
//@Component
//@Entity
//public class Users {
//    @Id
//    private Long id;
//    private String username;
//    private String password;
//
//    public Users()
//    {
//
//    }
//    public Users(Long id, String username, String password) {
//        this.id = id;
//        this.username = username;
//        this.password = password;
//    }
//
//    @Override
//    public String toString() {
//        return "Users{" +
//                "id=" + id +
//                ", username='" + username + '\'' +
//                ", password='" + password + '\'' +
//                '}';
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
//    public String getUsername() {
//        return username;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
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
package com.MyWebpage.register.login.model;

import jakarta.persistence.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Entity
public class Farmer {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "farmer_seq")
    @SequenceGenerator(name = "farmer_seq", sequenceName = "farmer_sequence", initialValue = 10101, allocationSize = 1)
    private Long farmerId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNo;
    private String dob;
    private String state;
    private String city;
    private String district;
    private String aadharNo;
    private String password;
    private String role;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Farmer(){

    }
    public Farmer(Long farmerId, String username, String firstName, String lastName, String email, String phoneNo, String dob, String state, String district, String aadharNo, String password, List<Crop> crops) {
        this.farmerId = farmerId;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNo = phoneNo;
        this.dob = dob;
        this.state = state;
        this.district = district;
        this.aadharNo = aadharNo;
        this.password = password;

    }

    public Farmer(Long farmerId, String username, String password) {
        this.farmerId = farmerId;
        this.username = username;
        this.password = password;
    }

    @Override
    public String toString() {
        return "Farmer{" +
                "farmerId=" + farmerId +
                ", username='" + username + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phoneNo='" + phoneNo + '\'' +
                ", dob='" + dob + '\'' +
                ", state='" + state + '\'' +
                ", city='" + city + '\'' +
                ", district='" + district + '\'' +
                ", aadharNo='" + aadharNo + '\'' +
                ", password='" + password + '\'' +
                '}';
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getAadharNo() {
        return aadharNo;
    }

    public void setAadharNo(String aadharNo) {
        this.aadharNo = aadharNo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


}
