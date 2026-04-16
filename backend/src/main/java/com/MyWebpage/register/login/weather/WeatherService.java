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

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class WeatherService {
    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);

    private final RestTemplate restTemplate;
    private final FarmerRepo farmerRepo;
    private final WeatherSnapshotRepository weatherSnapshotRepository;

    @Value("${weather.api.url}")
    private String weatherApiUrl;

    @Value("${weather.api.key}")
    private String weatherApiKey;

    public WeatherService(RestTemplate restTemplate, FarmerRepo farmerRepo, WeatherSnapshotRepository weatherSnapshotRepository) {
        this.restTemplate = restTemplate;
        this.farmerRepo = farmerRepo;
        this.weatherSnapshotRepository = weatherSnapshotRepository;
    }

    public Map<String, Object> getWeatherByCity(String city) {
        if (city == null || city.isBlank()) {
            throw new IllegalArgumentException("City is required");
        }

        Optional<WeatherSnapshot> snapshot = weatherSnapshotRepository.findByDistrictNameIgnoreCase(city.trim());
        if (snapshot.isPresent()) {
            return toWeatherResponse(snapshot.get());
        }

        return fetchWeatherByQuery(city.trim());
    }

    public void refreshScheduledWeatherSnapshots() {
        KarnatakaWeatherDistricts.all().forEach((districtName, point) -> {
            try {
                Map<String, Object> payload = fetchWeatherByQuery(point.lat() + "," + point.lon());
                upsertSnapshot(KarnatakaWeatherDistricts.STATE_NAME, districtName, point, payload);
            } catch (RuntimeException error) {
                logger.warn("Scheduled weather refresh failed for district '{}': {}", districtName, error.getMessage());
            }
        });
    }

    public Map<String, Object> getWeatherByFarmerId(Long farmerId) {
        Farmer farmer = farmerRepo.findById(farmerId).orElse(null);
        if (farmer == null) {
            throw new RuntimeException("Farmer not found");
        }

        String district = normalize(farmer.getDistrict());
        String state = normalize(farmer.getState());

        if (district != null) {
            Optional<WeatherSnapshot> snapshot = state == null
                    ? weatherSnapshotRepository.findByDistrictNameIgnoreCase(district)
                    : weatherSnapshotRepository.findByStateNameIgnoreCaseAndDistrictNameIgnoreCase(state, district);
            if (snapshot.isPresent()) {
                return toWeatherResponse(snapshot.get());
            }
        }

        String queryCity = firstNonBlank(farmer.getCity(), farmer.getDistrict(), farmer.getState());
        if (queryCity == null) {
            throw new IllegalArgumentException("Profile location is missing. Please update city/state.");
        }

        return getWeatherByCity(queryCity);
    }

    @SuppressWarnings("unchecked")
    private void upsertSnapshot(
            String stateName,
            String districtName,
            KarnatakaWeatherDistricts.WeatherPoint point,
            Map<String, Object> payload) {
        Map<String, Object> current = payload == null ? null : (Map<String, Object>) payload.get("current");
        Map<String, Object> condition = current == null ? null : (Map<String, Object>) current.get("condition");

        WeatherSnapshot snapshot = weatherSnapshotRepository
                .findByStateNameIgnoreCaseAndDistrictNameIgnoreCase(stateName, districtName)
                .orElseGet(WeatherSnapshot::new);

        snapshot.setStateName(stateName);
        snapshot.setDistrictName(districtName);
        snapshot.setLatitude(point.lat());
        snapshot.setLongitude(point.lon());
        snapshot.setTemperatureC(numberValue(current, "temp_c"));
        snapshot.setFeelsLikeC(numberValue(current, "feelslike_c"));
        snapshot.setWindKph(numberValue(current, "wind_kph"));
        snapshot.setPrecipMm(numberValue(current, "precip_mm"));
        snapshot.setHumidity(integerValue(current, "humidity"));
        snapshot.setConditionText(condition == null ? null : stringValue(condition.get("text")));
        snapshot.setConditionIcon(condition == null ? null : stringValue(condition.get("icon")));
        snapshot.setFetchedAt(LocalDateTime.now());
        weatherSnapshotRepository.save(snapshot);
    }

    private Map<String, Object> fetchWeatherByQuery(String query) {
        String url = UriComponentsBuilder
                .fromUriString(weatherApiUrl)
                .queryParam("key", weatherApiKey)
                .queryParam("q", query)
                .queryParam("aqi", "no")
                .toUriString();
        logger.info("Calling weather API for query: {}", query);

        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (HttpClientErrorException ex) {
            logger.warn("Weather API client error for query '{}': {}", query, ex.getStatusCode());
            throw new IllegalArgumentException("Weather not found for this location.");
        } catch (RestClientException ex) {
            logger.error("Weather API call failed for query '{}'", query, ex);
            throw new RuntimeException("Unable to fetch weather right now.");
        }
    }

    private Map<String, Object> toWeatherResponse(WeatherSnapshot snapshot) {
        Map<String, Object> location = new LinkedHashMap<>();
        location.put("name", snapshot.getDistrictName());
        location.put("region", snapshot.getStateName());
        location.put("country", "India");
        location.put("lat", snapshot.getLatitude());
        location.put("lon", snapshot.getLongitude());
        location.put("localtime", snapshot.getFetchedAt() == null ? null : snapshot.getFetchedAt().toString());

        Map<String, Object> condition = new LinkedHashMap<>();
        condition.put("text", snapshot.getConditionText());
        condition.put("icon", snapshot.getConditionIcon());

        Map<String, Object> current = new LinkedHashMap<>();
        current.put("temp_c", snapshot.getTemperatureC());
        current.put("feelslike_c", snapshot.getFeelsLikeC());
        current.put("wind_kph", snapshot.getWindKph());
        current.put("precip_mm", snapshot.getPrecipMm());
        current.put("humidity", snapshot.getHumidity());
        current.put("condition", condition);
        current.put("last_updated", snapshot.getFetchedAt() == null ? null : snapshot.getFetchedAt().toString());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("location", location);
        response.put("current", current);
        response.put("source", "scheduled_snapshot");
        return response;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Double numberValue(Map<String, Object> source, String key) {
        if (source == null) {
            return null;
        }
        Object value = source.get(key);
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return null;
    }

    private Integer integerValue(Map<String, Object> source, String key) {
        if (source == null) {
            return null;
        }
        Object value = source.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
