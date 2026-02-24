package com.MyWebpage.register.login.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BuyerResponseDTO {

    private Long buyerId;

    private String username;

    private String email;

    private String phoneNo;

    private String district;

}