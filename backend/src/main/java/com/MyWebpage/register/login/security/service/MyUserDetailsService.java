package com.MyWebpage.register.login.security.service;

import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.security.model.UserPrincipal;
import com.MyWebpage.register.login.farmer.Farmer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
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
            farmerOptional = farmerRepo.findByEmail(usernameOrEmail);
        } else {
            farmerOptional = Optional.ofNullable(farmerRepo.findByUsername(usernameOrEmail));
        }

        Farmer farmer = farmerOptional
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail));

        if (!farmer.isActive()) {
            throw new DisabledException("Account is deactivated");
        }

        return new UserPrincipal(farmer);
    }

}
