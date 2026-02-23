package com.MyWebpage.register.login.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
public class LocationService {

    @Value("${location.api.url}")
    private String locationApiUrl;

    @Value("${location.api.key}")
    private String locationApiKey;

    private final RestTemplate restTemplate;

    public LocationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> reverseGeocode(double latitude, double longitude) {
        String query = latitude + "+" + longitude;
        String url = UriComponentsBuilder.fromUriString(locationApiUrl)
                .queryParam("q", query)
                .queryParam("key", locationApiKey)
                .toUriString();
        return restTemplate.getForObject(url, Map.class);
    }
}
