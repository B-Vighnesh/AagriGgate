package com.MyWebpage.register.login.farmer;

public interface FarmerService {
    FarmerResponseDTO getProfile(Long farmerId);
    FarmerResponseDTO updateProfile(Long farmerId, FarmerUpdateDTO dto);
    Farmer find(Long farmerId);
}
