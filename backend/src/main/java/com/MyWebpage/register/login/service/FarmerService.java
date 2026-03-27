package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.farmer.FarmerResponseDTO;
import com.MyWebpage.register.login.farmer.FarmerUpdateDTO;
import com.MyWebpage.register.login.farmer.Farmer;

public interface FarmerService {
    FarmerResponseDTO getProfile(Long farmerId);
    FarmerResponseDTO updateProfile(Long farmerId, FarmerUpdateDTO dto);
    Farmer find(Long farmerId);
}
