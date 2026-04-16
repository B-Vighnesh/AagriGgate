package com.MyWebpage.register.login.weather;

import java.util.LinkedHashMap;
import java.util.Map;

public final class KarnatakaWeatherDistricts {

    public static final String STATE_NAME = "Karnataka";

    private KarnatakaWeatherDistricts() {
    }

    public static Map<String, WeatherPoint> all() {
        Map<String, WeatherPoint> districts = new LinkedHashMap<>();
        districts.put("Bagalkot", new WeatherPoint(16.1850, 75.6960));
        districts.put("Bangalore", new WeatherPoint(12.9716, 77.5946));
        districts.put("Belgaum", new WeatherPoint(15.8497, 74.4977));
        districts.put("Bellary", new WeatherPoint(15.1394, 76.9214));
        districts.put("Bidar", new WeatherPoint(17.9133, 77.5301));
        districts.put("Bijapur", new WeatherPoint(16.8302, 75.7100));
        districts.put("Chamrajnagar", new WeatherPoint(11.9261, 76.9400));
        districts.put("Chikmagalur", new WeatherPoint(13.3161, 75.7720));
        districts.put("Chitradurga", new WeatherPoint(14.2306, 76.3985));
        districts.put("Davangere", new WeatherPoint(14.4644, 75.9218));
        districts.put("Dharwad", new WeatherPoint(15.4589, 75.0078));
        districts.put("Gadag", new WeatherPoint(15.4298, 75.6340));
        districts.put("Hassan", new WeatherPoint(13.0072, 76.0960));
        districts.put("Haveri", new WeatherPoint(14.7937, 75.4040));
        districts.put("Kalburgi", new WeatherPoint(17.3297, 76.8343));
        districts.put("Karwar(Uttar Kannad)", new WeatherPoint(14.8136, 74.1297));
        districts.put("Kolar", new WeatherPoint(13.1367, 78.1290));
        districts.put("Koppal", new WeatherPoint(15.3459, 76.1545));
        districts.put("Madikeri(Kodagu)", new WeatherPoint(12.4244, 75.7382));
        districts.put("Mandya", new WeatherPoint(12.5218, 76.8951));
        districts.put("Mangalore(Dakshin Kannad)", new WeatherPoint(12.9141, 74.8560));
        districts.put("Mysore", new WeatherPoint(12.2958, 76.6394));
        districts.put("Raichur", new WeatherPoint(16.2076, 77.3463));
        districts.put("Shimoga", new WeatherPoint(13.9299, 75.5681));
        districts.put("Tumkur", new WeatherPoint(13.3409, 77.1010));
        districts.put("Udupi", new WeatherPoint(13.3409, 74.7421));
        districts.put("Yadgiri", new WeatherPoint(16.7700, 77.1376));
        return districts;
    }

    public record WeatherPoint(double lat, double lon) {
    }
}
