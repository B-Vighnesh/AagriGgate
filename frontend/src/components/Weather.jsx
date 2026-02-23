import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { apiGet } from '../lib/api';
import { getFarmerId, getRole, getToken } from '../lib/auth';

function getAlert(weather) {
  if (!weather) return null;
  const current = weather.current;
  if (current.temp_c > 35) return { type: 'error', msg: 'Heat alert: temperature above 35C.' };
  if (current.wind_kph > 80) return { type: 'error', msg: 'Strong winds detected. Stay cautious.' };
  if (current.precip_mm > 30) return { type: 'warning', msg: 'Heavy rainfall expected.' };
  if (current.uv > 8) return { type: 'warning', msg: 'High UV index. Avoid direct sun in peak hours.' };
  return null;
}

function Metric({ label, value }) {
  return (
    <Card className="weather-metric">
      <p className="weather-metric__label">{label}</p>
      <h4>{value}</h4>
    </Card>
  );
}

export default function Weather() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const role = getRole();
  const token = getToken();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY || '75f97057caa641fa99c73509242910';

  const alert = useMemo(() => getAlert(weather), [weather]);

  const fetchByQuery = async (q) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(q)}&aqi=no`);
      const data = await response.json();
      if (!response.ok || data?.error) {
        throw new Error(data?.error?.message || 'Weather not found for this location.');
      }
      setWeather(data);
    } catch (err) {
      setWeather(null);
      setError(err.message || 'Unable to fetch weather details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyLocationWeather = async () => {
    if (!token || !farmerId) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiGet(`/users/getFarmer/${farmerId}`);
      if (!response.ok) throw new Error('Could not load your profile location.');
      const profile = await response.json();
      const search = `${profile?.district || ''},${profile?.state || ''}`.trim();
      if (!search || search === ',') throw new Error('Profile location is missing.');
      await fetchByQuery(search);
    } catch (err) {
      setWeather(null);
      setError(err.message || 'Unable to load weather for your profile location.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!role) {
      navigate('/login');
      return;
    }
    if (role === 'buyer') {
      navigate('/404');
      return;
    }
    fetchMyLocationWeather();
  }, []);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    fetchByQuery(query.trim());
  };

  return (
    <section className="page weather-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <header className="weather-header">
          <h1>Weather</h1>
          <p>Real-time weather for your farm location or any city search.</p>
        </header>

        <Card className="weather-search-card">
          <form className="weather-search-form" onSubmit={onSearchSubmit}>
            <input
              type="text"
              value={query}
              placeholder="Search city (e.g. Bengaluru)"
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button type="submit">Search</Button>
            <Button type="button" variant="outline" onClick={fetchMyLocationWeather}>My Location</Button>
          </form>
        </Card>

        {alert && (
          <p className={`weather-alert weather-alert--${alert.type === 'error' ? 'error' : 'warning'}`}>
            {alert.msg}
          </p>
        )}

        {loading && (
          <div className="weather-loading">
            <div className="ui-spinner ui-spinner--lg" />
            <span>Fetching weather data...</span>
          </div>
        )}

        {!loading && error && (
          <Card className="weather-error">{error}</Card>
        )}

        {!loading && weather && (
          <div className="weather-layout">
            <Card className="weather-summary">
              <div className="weather-summary__main">
                <img src={`https:${weather.current.condition.icon}`} alt={weather.current.condition.text} />
                <div>
                  <h2>{weather.location.name}, {weather.location.region}</h2>
                  <p>{weather.location.country}</p>
                  <p>{weather.current.condition.text}</p>
                </div>
              </div>
              <div className="weather-temp">
                <strong>{weather.current.temp_c}C</strong>
                <span>Feels like {weather.current.feelslike_c}C</span>
              </div>
            </Card>

            <div className="weather-metrics-grid">
              <Metric label="Humidity" value={`${weather.current.humidity}%`} />
              <Metric label="Wind" value={`${weather.current.wind_kph} kph`} />
              <Metric label="Pressure" value={`${weather.current.pressure_mb} mb`} />
              <Metric label="Visibility" value={`${weather.current.vis_km} km`} />
              <Metric label="Precipitation" value={`${weather.current.precip_mm} mm`} />
              <Metric label="UV Index" value={weather.current.uv} />
              <Metric label="Cloud" value={`${weather.current.cloud}%`} />
              <Metric label="Gust" value={`${weather.current.gust_kph} kph`} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
