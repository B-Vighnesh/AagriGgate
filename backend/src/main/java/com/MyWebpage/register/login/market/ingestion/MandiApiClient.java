package com.MyWebpage.register.login.market.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Component
public class MandiApiClient {

    private static final Logger log = LoggerFactory.getLogger(MandiApiClient.class);

    private final RestTemplate restTemplate;

    @Value("${market.api.url}")
    private String marketApiUrl;

    @Value("${market.api.key}")
    private String marketApiKey;

    public MandiApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public JsonNode fetchMarketData(String state, String district, String date) {
        String uri = UriComponentsBuilder.fromUriString(marketApiUrl)
                .queryParam("api-key", marketApiKey)
                .queryParam("format", "json")
                .queryParam("offset", "0")
                .queryParam("limit", "1000")
                .queryParam("filters[State]", state)
                .queryParam("filters[District]", district)
                .queryParam("filters[Arrival_Date]", date)
                .build(true)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0");

        log.info("Fetching mandi data for state={} district={} date={}", state, district, date);
        ResponseEntity<JsonNode> response = restTemplate.exchange(
                uri,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                JsonNode.class
        );
        return response.getBody();
    }
}
