package com.MyWebpage.register.login.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class WeatherService {
    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);

    private final RestTemplate restTemplate;

    @Value("${weather.api.url}")
    private String weatherApiUrl;

    public WeatherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getWeather(double latitude, double longitude) {
        String url = UriComponentsBuilder
                .fromUriString(weatherApiUrl)
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("current", "temperature_2m,relative_humidity_2m,wind_speed_10m")
                .toUriString();
        logger.info("Calling weather API for coordinates: {}, {}", latitude, longitude);
        return restTemplate.getForObject(url, Map.class);
    }
}
