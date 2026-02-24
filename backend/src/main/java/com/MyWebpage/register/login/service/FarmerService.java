package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.dto.FarmerResponseDTO;
import com.MyWebpage.register.login.dto.FarmerUpdateDTO;
import com.MyWebpage.register.login.model.Farmer;

public interface FarmerService {
    FarmerResponseDTO getProfile(Long farmerId);
    FarmerResponseDTO updateProfile(Long farmerId, FarmerUpdateDTO dto);
    Farmer find(Long farmerId);
}
