package com.MyWebpage.register.login.security;

import com.MyWebpage.register.login.JWT.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    var source = new org.springframework.web.cors.CorsConfiguration();
                    source.setAllowedOrigins(List.of("http://localhost:3000","http://localhost:5173"));

                    source.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    source.setAllowedHeaders(List.of("*"));
                    source.setAllowCredentials(true);
                    return source;
                }))
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/enquiries/getAll","/users/register", "/users/login", "/auth/send-otp/{email}", "/auth/verify-otp", "/buyer/register", "/buyer/login","/buyer/findEmail/{email}", "/users/findEmail/{email}","/users/findEmailorUsername","/buyer/findEmailorUsername","/auth/reset-otp/{principal}","/users/resetpassword","/buyer/resetpassword","/enquiries/**")
                        .permitAll()
                        .requestMatchers("/buyer/**","/buyer/approach/**").hasRole("BUYER")
                        .requestMatchers("/users/**","/crops/farmer/**","/seller/approach/**","/api/saved-market-data/**").hasRole("SELLER")
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setPasswordEncoder(new BCryptPasswordEncoder(12));
        daoAuthenticationProvider.setUserDetailsService(userDetailsService);
        return daoAuthenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
