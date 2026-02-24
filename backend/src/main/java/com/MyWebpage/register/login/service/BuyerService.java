package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.BuyerRequestDTO;
import com.MyWebpage.register.login.dto.BuyerResponseDTO;

public interface BuyerService {

    BuyerResponseDTO register(BuyerRequestDTO request);

    BuyerResponseDTO getById(Long buyerId);

    BuyerResponseDTO getCurrentBuyer(String email);

    BuyerResponseDTO updateCurrentBuyer(String email,
                                        BuyerRequestDTO request);

    void deleteCurrentBuyer(String email);

}