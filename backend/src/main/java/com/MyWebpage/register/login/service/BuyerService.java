package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.buyer.BuyerRequestDTO;
import com.MyWebpage.register.login.buyer.BuyerResponseDTO;

public interface BuyerService {

    BuyerResponseDTO getProfile(Long farmerId);

    BuyerResponseDTO updateProfile(Long farmerId, BuyerRequestDTO request);

    void deleteProfile(Long farmerId);

}
