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
        Map<String, Object> location = payload == null ? null : mapValue(payload.get("location"));
        Map<String, Object> current = payload == null ? null : (Map<String, Object>) payload.get("current");
        Map<String, Object> condition = current == null ? null : (Map<String, Object>) current.get("condition");
        Map<String, Object> airQuality = current == null ? null : mapValue(current.get("air_quality"));

        WeatherSnapshot snapshot = weatherSnapshotRepository
                .findByStateNameIgnoreCaseAndDistrictNameIgnoreCase(stateName, districtName)
                .orElseGet(WeatherSnapshot::new);

        snapshot.setStateName(stateName);
        snapshot.setDistrictName(districtName);
        snapshot.setLocationName(stringOrDefault(location, "name", districtName));
        snapshot.setRegionName(stringOrDefault(location, "region", stateName));
        snapshot.setCountryName(stringOrDefault(location, "country", "India"));
        snapshot.setLatitude(numberOrDefault(location, "lat", point.lat()));
        snapshot.setLongitude(numberOrDefault(location, "lon", point.lon()));
        snapshot.setTimezoneId(stringValue(location == null ? null : location.get("tz_id")));
        snapshot.setLocaltimeEpoch(longValue(location, "localtime_epoch"));
        snapshot.setLocationLocaltime(stringValue(location == null ? null : location.get("localtime")));
        snapshot.setLastUpdatedEpoch(longValue(current, "last_updated_epoch"));
        snapshot.setLastUpdated(stringValue(current == null ? null : current.get("last_updated")));
        snapshot.setTemperatureC(numberValue(current, "temp_c"));
        snapshot.setTemperatureF(numberValue(current, "temp_f"));
        snapshot.setIsDay(integerValue(current, "is_day"));
        snapshot.setFeelsLikeC(numberValue(current, "feelslike_c"));
        snapshot.setFeelsLikeF(numberValue(current, "feelslike_f"));
        snapshot.setWindchillC(numberValue(current, "windchill_c"));
        snapshot.setWindchillF(numberValue(current, "windchill_f"));
        snapshot.setHeatindexC(numberValue(current, "heatindex_c"));
        snapshot.setHeatindexF(numberValue(current, "heatindex_f"));
        snapshot.setDewpointC(numberValue(current, "dewpoint_c"));
        snapshot.setDewpointF(numberValue(current, "dewpoint_f"));
        snapshot.setWindMph(numberValue(current, "wind_mph"));
        snapshot.setWindKph(numberValue(current, "wind_kph"));
        snapshot.setWindDegree(integerValue(current, "wind_degree"));
        snapshot.setWindDir(stringValue(current == null ? null : current.get("wind_dir")));
        snapshot.setPressureMb(numberValue(current, "pressure_mb"));
        snapshot.setPressureIn(numberValue(current, "pressure_in"));
        snapshot.setPrecipMm(numberValue(current, "precip_mm"));
        snapshot.setPrecipIn(numberValue(current, "precip_in"));
        snapshot.setHumidity(integerValue(current, "humidity"));
        snapshot.setCloud(integerValue(current, "cloud"));
        snapshot.setVisKm(numberValue(current, "vis_km"));
        snapshot.setVisMiles(numberValue(current, "vis_miles"));
        snapshot.setUv(numberValue(current, "uv"));
        snapshot.setGustMph(numberValue(current, "gust_mph"));
        snapshot.setGustKph(numberValue(current, "gust_kph"));
        snapshot.setConditionText(condition == null ? null : stringValue(condition.get("text")));
        snapshot.setConditionIcon(condition == null ? null : stringValue(condition.get("icon")));
        snapshot.setConditionCode(integerValue(condition, "code"));
        snapshot.setAirQualityCo(numberValue(airQuality, "co"));
        snapshot.setAirQualityNo2(numberValue(airQuality, "no2"));
        snapshot.setAirQualityO3(numberValue(airQuality, "o3"));
        snapshot.setAirQualitySo2(numberValue(airQuality, "so2"));
        snapshot.setAirQualityPm25(numberValue(airQuality, "pm2_5"));
        snapshot.setAirQualityPm10(numberValue(airQuality, "pm10"));
        snapshot.setAirQualityUsEpaIndex(integerValue(airQuality, "us-epa-index"));
        snapshot.setAirQualityGbDefraIndex(integerValue(airQuality, "gb-defra-index"));
        snapshot.setFetchedAt(LocalDateTime.now());
        weatherSnapshotRepository.save(snapshot);
    }

    private Map<String, Object> fetchWeatherByQuery(String query) {
        String url = UriComponentsBuilder
                .fromUriString(weatherApiUrl)
                .queryParam("key", weatherApiKey)
                .queryParam("q", query)
                .queryParam("aqi", "yes")
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
        location.put("name", snapshot.getLocationName() == null ? snapshot.getDistrictName() : snapshot.getLocationName());
        location.put("region", snapshot.getRegionName() == null ? snapshot.getStateName() : snapshot.getRegionName());
        location.put("country", snapshot.getCountryName() == null ? "India" : snapshot.getCountryName());
        location.put("lat", snapshot.getLatitude());
        location.put("lon", snapshot.getLongitude());
        location.put("tz_id", snapshot.getTimezoneId());
        location.put("localtime_epoch", snapshot.getLocaltimeEpoch());
        location.put("localtime", snapshot.getLocationLocaltime());

        Map<String, Object> condition = new LinkedHashMap<>();
        condition.put("text", snapshot.getConditionText());
        condition.put("icon", snapshot.getConditionIcon());
        condition.put("code", snapshot.getConditionCode());

        Map<String, Object> airQuality = new LinkedHashMap<>();
        airQuality.put("co", snapshot.getAirQualityCo());
        airQuality.put("no2", snapshot.getAirQualityNo2());
        airQuality.put("o3", snapshot.getAirQualityO3());
        airQuality.put("so2", snapshot.getAirQualitySo2());
        airQuality.put("pm2_5", snapshot.getAirQualityPm25());
        airQuality.put("pm10", snapshot.getAirQualityPm10());
        airQuality.put("us-epa-index", snapshot.getAirQualityUsEpaIndex());
        airQuality.put("gb-defra-index", snapshot.getAirQualityGbDefraIndex());

        Map<String, Object> current = new LinkedHashMap<>();
        current.put("last_updated_epoch", snapshot.getLastUpdatedEpoch());
        current.put("last_updated", snapshot.getLastUpdated());
        current.put("temp_c", snapshot.getTemperatureC());
        current.put("temp_f", snapshot.getTemperatureF());
        current.put("is_day", snapshot.getIsDay());
        current.put("feelslike_c", snapshot.getFeelsLikeC());
        current.put("feelslike_f", snapshot.getFeelsLikeF());
        current.put("windchill_c", snapshot.getWindchillC());
        current.put("windchill_f", snapshot.getWindchillF());
        current.put("heatindex_c", snapshot.getHeatindexC());
        current.put("heatindex_f", snapshot.getHeatindexF());
        current.put("dewpoint_c", snapshot.getDewpointC());
        current.put("dewpoint_f", snapshot.getDewpointF());
        current.put("wind_mph", snapshot.getWindMph());
        current.put("wind_kph", snapshot.getWindKph());
        current.put("wind_degree", snapshot.getWindDegree());
        current.put("wind_dir", snapshot.getWindDir());
        current.put("pressure_mb", snapshot.getPressureMb());
        current.put("pressure_in", snapshot.getPressureIn());
        current.put("precip_mm", snapshot.getPrecipMm());
        current.put("precip_in", snapshot.getPrecipIn());
        current.put("humidity", snapshot.getHumidity());
        current.put("cloud", snapshot.getCloud());
        current.put("vis_km", snapshot.getVisKm());
        current.put("vis_miles", snapshot.getVisMiles());
        current.put("uv", snapshot.getUv());
        current.put("gust_mph", snapshot.getGustMph());
        current.put("gust_kph", snapshot.getGustKph());
        current.put("condition", condition);
        current.put("air_quality", airQuality);

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

    private Double numberOrDefault(Map<String, Object> source, String key, Double fallback) {
        Double value = numberValue(source, key);
        return value == null ? fallback : value;
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

    private Long longValue(Map<String, Object> source, String key) {
        if (source == null) {
            return null;
        }
        Object value = source.get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapValue(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return null;
    }

    private String stringOrDefault(Map<String, Object> source, String key, String fallback) {
        String value = stringValue(source == null ? null : source.get(key));
        return value == null || value.isBlank() ? fallback : value;
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
