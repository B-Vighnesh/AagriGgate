package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.model.Farmer;

public class AuthResponse {
    private String token;
    private Farmer farmer;

    public AuthResponse(String token, Farmer farmer) {
        this.token = token;
        this.farmer = farmer;
    }

    public AuthResponse() {

    }

    public String getToken() {
        return token;
    }

    public Farmer getFarmer() {
        return farmer;
    }

    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='" + token + '\'' +
                ", farmer=" + farmer +
                '}';
    }
}
