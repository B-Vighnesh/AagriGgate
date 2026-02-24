package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.BuyerRequestDTO;
import com.MyWebpage.register.login.dto.BuyerResponseDTO;

public interface BuyerService {

    BuyerResponseDTO getProfile(Long farmerId);

    BuyerResponseDTO updateProfile(Long farmerId, BuyerRequestDTO request);

    void deleteProfile(Long farmerId);

}
