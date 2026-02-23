package com.MyWebpage.register.login.controller;

import com.MyWebpage.register.login.external.WeatherService;
import com.MyWebpage.register.login.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWeather(
            @RequestParam double latitude,
            @RequestParam double longitude) {
        return ResponseEntity.ok(ApiResponse.success("Weather fetched", weatherService.getWeather(latitude, longitude)));
    }
}
