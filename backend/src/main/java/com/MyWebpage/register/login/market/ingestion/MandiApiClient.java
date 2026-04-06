package com.MyWebpage.register.login.market.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class MandiApiClient {

    private static final Logger log = LoggerFactory.getLogger(MandiApiClient.class);

    private final RestTemplate restTemplate;

    @Value("${market.api.url}")
    private String marketApiUrl;

    @Value("${market.api.key}")
    private String marketApiKey;

    public MandiApiClient() {
        CloseableHttpClient httpClient = HttpClients.custom()
                .setUserAgent("Mozilla/5.0")
                .build();

        HttpComponentsClientHttpRequestFactory factory =
                new HttpComponentsClientHttpRequestFactory(httpClient);

        factory.setConnectTimeout(30000);
        this.restTemplate = new RestTemplate(factory);
    }

    public JsonNode fetchMarketData(String state, String district, String date) {
        URI uri = URI.create(marketApiUrl
                + "?api-key=" + encode(marketApiKey)
                + "&format=json"
                + "&offset=0"
                + "&limit=1000"
                + "&filters[State]=" + encode(state)
                + "&filters[District]=" + encode(district)
                + "&filters[Arrival_Date]=" + encode(date));

        System.out.println("[MARKET_API] Calling URL: " + uri);

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0");
        headers.set("Accept", "application/json");

        log.info("Fetching mandi data for state={} district={} date={}", state, district, date);
        ResponseEntity<JsonNode> response = restTemplate.exchange(
                uri,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                JsonNode.class
        );
        System.out.println("[MARKET_API] Response status: " + response.getStatusCode());
        return response.getBody();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
