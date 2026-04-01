package com.MyWebpage.register.login.security.config;

import com.MyWebpage.register.login.security.jwt.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    var source = new org.springframework.web.cors.CorsConfiguration();
                    source.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173", "https://aagriggate.vercel.app"));
                    source.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    source.setAllowedHeaders(List.of("*"));
                    source.setAllowCredentials(true);
                    return source;
                }))
                .authorizeHttpRequests(request -> request
                        .requestMatchers(
                                "/api/v1/auth/register/send-otp",
                                "/api/v1/auth/register/verify-otp",
                                "/api/v1/auth/register/**",
                                "/api/v1/auth/login",
                                "/api/v1/auth/login/send-otp",
                                "/api/v1/auth/login/otp",
                                "/api/v1/password/**",
                                "/api/v1/admin/login",
                                "/api/v1/admin/enquiry"
                        ).permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/news/saved", "/api/v1/news/saved/**").hasAnyRole("SELLER", "BUYER")
                        .requestMatchers("/api/v1/news/**").hasAnyRole("BUYER", "SELLER")
                        // TODO: Report feature temporarily disabled — to be re-enabled in future release.
                        // .requestMatchers(HttpMethod.POST, "/api/v1/news/*/report").hasAnyRole("BUYER", "SELLER")
                        .requestMatchers("/api/v1/notifications/**").hasAnyRole("BUYER", "SELLER")
                        .requestMatchers("/api/v1/buyers/me", "/api/v1/buyers/*").hasAnyRole("SELLER", "BUYER")
                        .requestMatchers("/api/v1/buyers/**", "/api/v1/buyer/approach/**", "/api/v1/users/favorites/**", "/api/v1/cart/**", "/api/v1/crops/*/favorite").hasRole("BUYER")
                        .requestMatchers("/api/v1/farmers/**", "/api/v1/crops/farmer/**", "/api/v1/seller/approach/**", "/api/v1/saved-market-data/**", "/api/v1/market-price/**", "/api/v1/weather/**").hasRole("SELLER")
                        .anyRequest().authenticated()
                )
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
