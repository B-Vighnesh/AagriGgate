package com.MyWebpage.register.login.weather;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "weather_snapshot", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"state_name", "district_name"})
})
public class WeatherSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "state_name", nullable = false, length = 120)
    private String stateName;

    @Column(name = "district_name", nullable = false, length = 160)
    private String districtName;

    @Column(name = "location_name", length = 160)
    private String locationName;

    @Column(name = "region_name", length = 160)
    private String regionName;

    @Column(name = "country_name", length = 160)
    private String countryName;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "timezone_id", length = 120)
    private String timezoneId;

    @Column(name = "localtime_epoch")
    private Long localtimeEpoch;

    @Column(name = "location_localtime")
    private String locationLocaltime;

    @Column(name = "last_updated_epoch")
    private Long lastUpdatedEpoch;

    @Column(name = "last_updated")
    private String lastUpdated;

    @Column(name = "temperature_c")
    private Double temperatureC;

    @Column(name = "temperature_f")
    private Double temperatureF;

    @Column(name = "is_day")
    private Integer isDay;

    @Column(name = "condition_text", length = 160)
    private String conditionText;

    @Column(name = "condition_icon", length = 255)
    private String conditionIcon;

    @Column(name = "condition_code")
    private Integer conditionCode;

    @Column(name = "wind_mph")
    private Double windMph;

    @Column(name = "wind_kph")
    private Double windKph;

    @Column(name = "wind_degree")
    private Integer windDegree;

    @Column(name = "wind_dir", length = 32)
    private String windDir;

    @Column(name = "pressure_mb")
    private Double pressureMb;

    @Column(name = "pressure_in")
    private Double pressureIn;

    @Column(name = "precip_mm")
    private Double precipMm;

    @Column(name = "precip_in")
    private Double precipIn;

    private Integer humidity;

    private Integer cloud;

    @Column(name = "feels_like_c")
    private Double feelsLikeC;

    @Column(name = "feels_like_f")
    private Double feelsLikeF;

    @Column(name = "windchill_c")
    private Double windchillC;

    @Column(name = "windchill_f")
    private Double windchillF;

    @Column(name = "heatindex_c")
    private Double heatindexC;

    @Column(name = "heatindex_f")
    private Double heatindexF;

    @Column(name = "dewpoint_c")
    private Double dewpointC;

    @Column(name = "dewpoint_f")
    private Double dewpointF;

    @Column(name = "vis_km")
    private Double visKm;

    @Column(name = "vis_miles")
    private Double visMiles;

    private Double uv;

    @Column(name = "gust_mph")
    private Double gustMph;

    @Column(name = "gust_kph")
    private Double gustKph;

    @Column(name = "air_quality_co")
    private Double airQualityCo;

    @Column(name = "air_quality_no2")
    private Double airQualityNo2;

    @Column(name = "air_quality_o3")
    private Double airQualityO3;

    @Column(name = "air_quality_so2")
    private Double airQualitySo2;

    @Column(name = "air_quality_pm2_5")
    private Double airQualityPm25;

    @Column(name = "air_quality_pm10")
    private Double airQualityPm10;

    @Column(name = "air_quality_us_epa_index")
    private Integer airQualityUsEpaIndex;

    @Column(name = "air_quality_gb_defra_index")
    private Integer airQualityGbDefraIndex;

    @Column(name = "fetched_at", nullable = false)
    private LocalDateTime fetchedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (fetchedAt == null) {
            fetchedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStateName() {
        return stateName;
    }

    public void setStateName(String stateName) {
        this.stateName = stateName;
    }

    public String getDistrictName() {
        return districtName;
    }

    public void setDistrictName(String districtName) {
        this.districtName = districtName;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getTimezoneId() {
        return timezoneId;
    }

    public void setTimezoneId(String timezoneId) {
        this.timezoneId = timezoneId;
    }

    public Long getLocaltimeEpoch() {
        return localtimeEpoch;
    }

    public void setLocaltimeEpoch(Long localtimeEpoch) {
        this.localtimeEpoch = localtimeEpoch;
    }

    public String getLocationLocaltime() {
        return locationLocaltime;
    }

    public void setLocationLocaltime(String locationLocaltime) {
        this.locationLocaltime = locationLocaltime;
    }

    public Long getLastUpdatedEpoch() {
        return lastUpdatedEpoch;
    }

    public void setLastUpdatedEpoch(Long lastUpdatedEpoch) {
        this.lastUpdatedEpoch = lastUpdatedEpoch;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Double getTemperatureC() {
        return temperatureC;
    }

    public void setTemperatureC(Double temperatureC) {
        this.temperatureC = temperatureC;
    }

    public Double getTemperatureF() {
        return temperatureF;
    }

    public void setTemperatureF(Double temperatureF) {
        this.temperatureF = temperatureF;
    }

    public Integer getIsDay() {
        return isDay;
    }

    public void setIsDay(Integer isDay) {
        this.isDay = isDay;
    }

    public String getConditionText() {
        return conditionText;
    }

    public void setConditionText(String conditionText) {
        this.conditionText = conditionText;
    }

    public String getConditionIcon() {
        return conditionIcon;
    }

    public void setConditionIcon(String conditionIcon) {
        this.conditionIcon = conditionIcon;
    }

    public Integer getConditionCode() {
        return conditionCode;
    }

    public void setConditionCode(Integer conditionCode) {
        this.conditionCode = conditionCode;
    }

    public Double getWindMph() {
        return windMph;
    }

    public void setWindMph(Double windMph) {
        this.windMph = windMph;
    }

    public Double getWindKph() {
        return windKph;
    }

    public void setWindKph(Double windKph) {
        this.windKph = windKph;
    }

    public Integer getWindDegree() {
        return windDegree;
    }

    public void setWindDegree(Integer windDegree) {
        this.windDegree = windDegree;
    }

    public String getWindDir() {
        return windDir;
    }

    public void setWindDir(String windDir) {
        this.windDir = windDir;
    }

    public Double getPressureMb() {
        return pressureMb;
    }

    public void setPressureMb(Double pressureMb) {
        this.pressureMb = pressureMb;
    }

    public Double getPressureIn() {
        return pressureIn;
    }

    public void setPressureIn(Double pressureIn) {
        this.pressureIn = pressureIn;
    }

    public Double getPrecipMm() {
        return precipMm;
    }

    public void setPrecipMm(Double precipMm) {
        this.precipMm = precipMm;
    }

    public Double getPrecipIn() {
        return precipIn;
    }

    public void setPrecipIn(Double precipIn) {
        this.precipIn = precipIn;
    }

    public Integer getHumidity() {
        return humidity;
    }

    public void setHumidity(Integer humidity) {
        this.humidity = humidity;
    }

    public Integer getCloud() {
        return cloud;
    }

    public void setCloud(Integer cloud) {
        this.cloud = cloud;
    }

    public Double getFeelsLikeC() {
        return feelsLikeC;
    }

    public void setFeelsLikeC(Double feelsLikeC) {
        this.feelsLikeC = feelsLikeC;
    }

    public Double getFeelsLikeF() {
        return feelsLikeF;
    }

    public void setFeelsLikeF(Double feelsLikeF) {
        this.feelsLikeF = feelsLikeF;
    }

    public Double getWindchillC() {
        return windchillC;
    }

    public void setWindchillC(Double windchillC) {
        this.windchillC = windchillC;
    }

    public Double getWindchillF() {
        return windchillF;
    }

    public void setWindchillF(Double windchillF) {
        this.windchillF = windchillF;
    }

    public Double getHeatindexC() {
        return heatindexC;
    }

    public void setHeatindexC(Double heatindexC) {
        this.heatindexC = heatindexC;
    }

    public Double getHeatindexF() {
        return heatindexF;
    }

    public void setHeatindexF(Double heatindexF) {
        this.heatindexF = heatindexF;
    }

    public Double getDewpointC() {
        return dewpointC;
    }

    public void setDewpointC(Double dewpointC) {
        this.dewpointC = dewpointC;
    }

    public Double getDewpointF() {
        return dewpointF;
    }

    public void setDewpointF(Double dewpointF) {
        this.dewpointF = dewpointF;
    }

    public Double getVisKm() {
        return visKm;
    }

    public void setVisKm(Double visKm) {
        this.visKm = visKm;
    }

    public Double getVisMiles() {
        return visMiles;
    }

    public void setVisMiles(Double visMiles) {
        this.visMiles = visMiles;
    }

    public Double getUv() {
        return uv;
    }

    public void setUv(Double uv) {
        this.uv = uv;
    }

    public Double getGustMph() {
        return gustMph;
    }

    public void setGustMph(Double gustMph) {
        this.gustMph = gustMph;
    }

    public Double getGustKph() {
        return gustKph;
    }

    public void setGustKph(Double gustKph) {
        this.gustKph = gustKph;
    }

    public Double getAirQualityCo() {
        return airQualityCo;
    }

    public void setAirQualityCo(Double airQualityCo) {
        this.airQualityCo = airQualityCo;
    }

    public Double getAirQualityNo2() {
        return airQualityNo2;
    }

    public void setAirQualityNo2(Double airQualityNo2) {
        this.airQualityNo2 = airQualityNo2;
    }

    public Double getAirQualityO3() {
        return airQualityO3;
    }

    public void setAirQualityO3(Double airQualityO3) {
        this.airQualityO3 = airQualityO3;
    }

    public Double getAirQualitySo2() {
        return airQualitySo2;
    }

    public void setAirQualitySo2(Double airQualitySo2) {
        this.airQualitySo2 = airQualitySo2;
    }

    public Double getAirQualityPm25() {
        return airQualityPm25;
    }

    public void setAirQualityPm25(Double airQualityPm25) {
        this.airQualityPm25 = airQualityPm25;
    }

    public Double getAirQualityPm10() {
        return airQualityPm10;
    }

    public void setAirQualityPm10(Double airQualityPm10) {
        this.airQualityPm10 = airQualityPm10;
    }

    public Integer getAirQualityUsEpaIndex() {
        return airQualityUsEpaIndex;
    }

    public void setAirQualityUsEpaIndex(Integer airQualityUsEpaIndex) {
        this.airQualityUsEpaIndex = airQualityUsEpaIndex;
    }

    public Integer getAirQualityGbDefraIndex() {
        return airQualityGbDefraIndex;
    }

    public void setAirQualityGbDefraIndex(Integer airQualityGbDefraIndex) {
        this.airQualityGbDefraIndex = airQualityGbDefraIndex;
    }

    public LocalDateTime getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(LocalDateTime fetchedAt) {
        this.fetchedAt = fetchedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
