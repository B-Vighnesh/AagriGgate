package com.MyWebpage.register.login.weather;

import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

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
        if (city == null || city.isBlank()) {
            throw new IllegalArgumentException("City is required");
        }

        String url = UriComponentsBuilder
                .fromUriString(weatherApiUrl)
                .queryParam("key", weatherApiKey)
                .queryParam("q", city.trim())
                .queryParam("aqi", "no")
                .toUriString();
        logger.info("Calling weather API for city: {}", city.trim());

        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (HttpClientErrorException ex) {
            logger.warn("Weather API client error for city '{}': {}", city, ex.getStatusCode());
            throw new IllegalArgumentException("Weather not found for this location.");
        } catch (RestClientException ex) {
            logger.error("Weather API call failed for city '{}'", city, ex);
            throw new RuntimeException("Unable to fetch weather right now.");
        }
    }

    public Map<String, Object> getWeatherByFarmerId(Long farmerId) {
        Farmer farmer = farmerRepo.findById(farmerId).orElse(null);
        if (farmer == null) {
            throw new RuntimeException("Farmer not found");
        }

        String queryCity = firstNonBlank(farmer.getCity(), farmer.getDistrict(), farmer.getState());
        if (queryCity == null) {
            throw new IllegalArgumentException("Profile location is missing. Please update city/state.");
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
