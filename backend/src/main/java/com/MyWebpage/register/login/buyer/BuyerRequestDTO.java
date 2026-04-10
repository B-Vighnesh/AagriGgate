package com.MyWebpage.register.login.buyer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BuyerRequestDTO {

    @NotBlank
    private String username;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String firstName;

    private String lastName;

    private String phoneNo;

    private String state;

    private String district;

    private String dob;

    private String aadharNo;

    private String city;
}
