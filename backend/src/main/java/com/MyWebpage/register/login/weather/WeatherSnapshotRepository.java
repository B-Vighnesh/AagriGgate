package com.MyWebpage.register.login.weather;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeatherSnapshotRepository extends JpaRepository<WeatherSnapshot, Long> {
    Optional<WeatherSnapshot> findByStateNameIgnoreCaseAndDistrictNameIgnoreCase(String stateName, String districtName);

    Optional<WeatherSnapshot> findByDistrictNameIgnoreCase(String districtName);
}
