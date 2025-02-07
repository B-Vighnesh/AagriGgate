package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.repositor.FarmerRepo;
import com.MyWebpage.register.login.security.UserPrincipal;
import com.MyWebpage.register.login.model.Farmer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private FarmerRepo farmerRepo;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        Optional<Farmer> farmerOptional;

        if (usernameOrEmail.contains("@")) {
            farmerOptional = Optional.ofNullable(farmerRepo.findByEmail(usernameOrEmail));
        } else {
            farmerOptional = Optional.ofNullable(farmerRepo.findByUsername(usernameOrEmail));
        }

        Farmer farmer = farmerOptional
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail));

        return new UserPrincipal(farmer);
    }

}
