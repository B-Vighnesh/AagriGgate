package com.MyWebpage.register.login.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class MarketPriceService {

    @Value("${market.api.url}")
    private String marketApiUrl;

    @Value("${market.api.key}")
    private String marketApiKey;

    private final RestTemplate restTemplate;

    public MarketPriceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Object getMarketPrice(String crop, String state, String district, String arrivalDate) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(marketApiUrl)
                .queryParam("api-key", marketApiKey)
                .queryParam("format", "json")
                .queryParam("offset", "0")
                .queryParam("limit", "1000")
                .queryParam("filters[Commodity]", crop);

        if (state != null && !state.isBlank()) {
            builder.queryParam("filters[State]", state);
        }
        if (district != null && !district.isBlank()) {
            builder.queryParam("filters[District]", district);
        }
        if (arrivalDate != null && !arrivalDate.isBlank()) {
            builder.queryParam("filters[Arrival_Date]", arrivalDate);
        }

        return restTemplate.getForObject(builder.toUriString(), Object.class);
    }
}
