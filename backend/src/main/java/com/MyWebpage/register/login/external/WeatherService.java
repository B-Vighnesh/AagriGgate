package com.MyWebpage.register.login.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class WeatherService {
    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);

    private final RestTemplate restTemplate;

    @Value("${external.weather.base-url:https://api.open-meteo.com/v1/forecast}")
    private String baseUrl;

    public WeatherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getWeather(double latitude, double longitude) {
        String url = String.format("%s?latitude=%s&longitude=%s&current=temperature_2m", baseUrl, latitude, longitude);
        logger.info("Calling weather API for coordinates: {}, {}", latitude, longitude);
        return restTemplate.getForObject(url, Map.class);
    }
}
