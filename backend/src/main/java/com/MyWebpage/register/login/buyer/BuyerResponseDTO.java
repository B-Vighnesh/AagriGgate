package com.MyWebpage.register.login.buyer;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BuyerResponseDTO {

    private Long buyerId;

    private String username;

    private String email;

    private String firstName;

    private String lastName;

    private String phoneNo;

    private String state;

    private String district;

    private String dob;

    private String aadharNo;



}
