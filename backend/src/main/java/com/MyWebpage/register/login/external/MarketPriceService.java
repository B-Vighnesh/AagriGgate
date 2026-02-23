package com.MyWebpage.register.login.external;


import com.MyWebpage.register.login.dto.MarketPriceRecord;
import com.MyWebpage.register.login.dto.MarketPriceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;

import java.net.URI;
import java.util.List;

@Service
public class MarketPriceService {

    private static final Logger logger =
            LoggerFactory.getLogger(MarketPriceService.class);

    @Value("${market.api.url}")
    private String marketApiUrl;

    @Value("${market.api.key}")
    private String marketApiKey;

    private final RestTemplate restTemplate;

    public MarketPriceService() {

        CloseableHttpClient httpClient = HttpClients.custom()
                .setUserAgent("Mozilla/5.0")
                .build();

        HttpComponentsClientHttpRequestFactory factory =
                new HttpComponentsClientHttpRequestFactory(httpClient);

        factory.setConnectTimeout(30000);

        this.restTemplate = new RestTemplate(factory);
    }

    public List<MarketPriceRecord> getMarketPrice(String commodity,
                                                  String state,
                                                  String district,
                                                  String arrivalDate) {

        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(marketApiUrl)
                .queryParam("api-key", marketApiKey)
                .queryParam("format", "json")
                .queryParam("offset", "0")
                .queryParam("limit", "1000")
                .queryParam("filters[Commodity]", commodity);

        if (state != null && !state.isBlank()) {
            builder.queryParam("filters[State]", state);
        }

        if (district != null && !district.isBlank()) {
            builder.queryParam("filters[District]", district);
        }

        if (arrivalDate != null && !arrivalDate.isBlank()) {
            builder.queryParam("filters[Arrival_Date]", arrivalDate);
        }

        URI uri = builder.build().encode().toUri();

        logger.info("Calling Market API: {}", uri);

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0");
        headers.set("Accept", "application/json");
        System.out.println("hlo paveen");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<MarketPriceResponse> response =
                restTemplate.exchange(
                        uri,
                        HttpMethod.GET,
                        entity,
                        MarketPriceResponse.class
                );
        for(MarketPriceRecord m:response.getBody().getRecords())
        {
            System.out.println(m.getState());
        }
        System.out.println(response.getBody().getRecords());

        return response.getBody().getRecords();
    }
}