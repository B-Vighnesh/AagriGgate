import React, { useEffect, useState } from 'react';
import '../assets/Weather.css';
import { useNavigate } from 'react-router-dom';

import ValidateToken from './ValidateToken';
const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const apiKey = '75f97057caa641fa99c73509242910';
  const [popupMessage, setPopupMessage] = useState(null);

  const closePopup = () => {
    setPopupMessage(null);
  };
  const farmerId=localStorage.getItem('farmerId')
  
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

  const fetchWeather = async () => {
    const token = localStorage.getItem('token');
    const farmerId = localStorage.getItem('farmerId');

    try {
      const res = await fetch(`http://localhost:8080/users/getFarmer/${farmerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const d = data.district;
        const s = data.state;

        try {
          const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${d},${s}&aqi=no`);
          const weatherData = await response.json();

          if (weatherData && !weatherData.error) {
            setWeather(weatherData);
          } else {
            setError("Weather data is not available for your area.");
            setWeather(null);
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
          setError("Weather data is not available for your area.");
        }
      } else {
        window.location.reload();
      }
    } catch (error) {
      
      setError("Server busy");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`);
      const weatherData = await response.json();

      if (weatherData && !weatherData.error) {
        setWeather(weatherData);
        setError(null);
      } else {
        setError("Weather data is not available for the city.");
        setWeather(null);
      }
    } catch (error) {
      console.error("Error fetching weather by city:", error);
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token'); // Check for authentication token
    const userRole = localStorage.getItem("role");
   
    if (userRole ===null) {
      navigate("/login"); 
    }
    else if(userRole==="buyer")
    {
      navigate("/404");
    }
    if (!token) {
      setIsModalOpen(true); // Show the modal if not authenticated
      setLoading(false); // Stop loading because we don't need to fetch weather data
    } else {
      fetchWeather(); // Fetch weather data if authenticated
    }
    if (weather)
    {
      if (weather.current.temp_c > 35) {
        setPopupMessage("Heatwave Alert! The temperature is above 35°C.");
      } else if (weather.current.temp_c < 0) {
        setPopupMessage("Freezing temperatures! It's below 0°C.");
      } else if (weather.current.humidity > 90) {
        setPopupMessage("High humidity! It feels muggy outside.");
      } else if (weather.current.wind_kph > 100) {
        setPopupMessage("Strong winds expected! Winds over 100 kph.");
      } else if (weather.current.precip_mm > 50) {
        setPopupMessage("Heavy rain expected! Stay safe.");
      } else if (weather.current.uv > 8) {
        setPopupMessage("High UV index! Protect yourself from the sun.");
      } else if (weather.current.condition.text.includes("storm")) {
        setPopupMessage("Storm warning! Take precautions.");
      } else {
        setPopupMessage(null); // Clear popup if no extreme condition
      }
  }
  }, [navigate]);
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeatherByCity(searchQuery);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
   
  };

  return (
    <>
      <ValidateToken farmerId={farmerId} token={token} role={role} /><h1 class="heading">
    <span>W</span>
    <span>E</span>
    <span>A</span>
    <span>T</span>
    <span>H</span>
    <span>E</span>
    <span>R</span>
</h1>
    <div className="weather">
      
      <div className="weather-details">
      
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
          <button type="submit" onClick={fetchWeather}>My Weather</button>
        </form>
      </div><div className="static-weather-details">
      {error && <p className="weatherNA">{error}</p>}
      {loading && <p>Loading weather data...</p>}
      {weather && (
        
           
          <>
          <h2>Weather in {weather.location.name}, {weather.location.region}</h2>
          <img src={weather.current.condition.icon } alt={weather.current.condition.text} className="weather-icon" />
          <p><strong>Temperature:</strong> {weather.current.temp_c} °C</p>
          <p><strong>Condition:</strong> {weather.current.condition.text}</p>
          <p><strong>Humidity:</strong> {weather.current.humidity}%</p>
          <p><strong>Wind Speed:</strong> {weather.current.wind_kph} kph</p>
          <p><strong>Pressure:</strong> {weather.current.pressure_mb} mb</p>
          <p><strong>Feels Like:</strong> {weather.current.feelslike_c} °C</p>
          <p><strong>Visibility:</strong> {weather.current.vis_km} km</p>
          <p><strong>Precipitation:</strong> {weather.current.precip_mm} mm</p>
          <p><strong>Sun Hours (UV Index):</strong> {weather.current.uv}</p>
          <p><strong>Chance of Rain:</strong> {weather.current.precip_mm > 0 ? 'Yes' : 'No'}</p>
          </>
      )}
      {popupMessage && (
  <div className="popup-overlay" onClick={closePopup}>
    <div className="popup">
      <p>{popupMessage}</p>
      {/* <button className="popup-close" onClick={closePopup}>
        Close
      </button> */}
    </div>
  </div>
)}
          </div>
     
    </div>
    </>
  );
};

export default Weather;