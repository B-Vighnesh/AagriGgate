package com.MyWebpage.register.login.buyer;

public interface BuyerService {

    BuyerResponseDTO getProfile(Long farmerId);

    BuyerResponseDTO updateProfile(Long farmerId, BuyerRequestDTO request);

    void deleteProfile(Long farmerId);

}
