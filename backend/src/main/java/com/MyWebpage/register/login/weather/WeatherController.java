package com.MyWebpage.register.login.weather;

import com.MyWebpage.register.login.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWeatherForLoggedInFarmer(
            Authentication authentication) {
        Long farmerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Weather fetched", weatherService.getWeatherByFarmerId(farmerId)));
    }
}
