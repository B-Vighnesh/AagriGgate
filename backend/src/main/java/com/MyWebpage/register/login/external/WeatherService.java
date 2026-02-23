package com.MyWebpage.register.login.external;

import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repository.FarmerRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
public class WeatherService {
    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);

    private final RestTemplate restTemplate;
    private final FarmerRepo farmerRepo;

    @Value("${weather.api.url}")
    private String weatherApiUrl;

    @Value("${weather.api.key}")
    private String weatherApiKey;

    public WeatherService(RestTemplate restTemplate, FarmerRepo farmerRepo) {
        this.restTemplate = restTemplate;
        this.farmerRepo = farmerRepo;
    }

    public Map<String, Object> getWeatherByCity(String city) {
        String url = UriComponentsBuilder
                .fromUriString(weatherApiUrl)
                .queryParam("key", weatherApiKey)
                .queryParam("q", city)
                .queryParam("aqi", "no")
                .toUriString();
        logger.info("Calling weather API for city: {}", city);
        return restTemplate.getForObject(url, Map.class);
    }

    public Map<String, Object> getWeatherByFarmerEmail(String email) {
        Optional<Farmer> farmerOptional = farmerRepo.findByEmail(email);
        Farmer farmer = farmerOptional.orElseThrow(() -> new RuntimeException("Farmer not found"));

        String queryCity = firstNonBlank(farmer.getCity(), farmer.getDistrict(), farmer.getState());
        if (queryCity == null) {
            throw new RuntimeException("Farmer location is not available");
        }

        return getWeatherByCity(queryCity);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }
}
