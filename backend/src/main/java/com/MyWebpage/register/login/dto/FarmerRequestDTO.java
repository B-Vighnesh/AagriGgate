package com.MyWebpage.register.login.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class FarmerRequestDTO {
    @NotBlank
    private String username;
    @NotBlank
    @Size(min = 2, max = 50)
    private String firstName;
    private String lastName;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$", message = "phoneNo must be 10 digits")
    private String phoneNo;
    private String state;
    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    private String district;

    private String dob;

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

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNo() { return phoneNo; }
    public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
