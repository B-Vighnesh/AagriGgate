import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getRole, getToken } from '../lib/auth';
import { getWeather } from '../api/weatherApi';

function getAlert(weather) {
  if (!weather) return null;
  const current = weather.current || {};
  const temperature = Number(current.temperature_2m);
  const wind = Number(current.wind_speed_10m);
  if (!Number.isNaN(temperature) && temperature > 35) return { type: 'error', msg: 'Heat alert: temperature above 35C.' };
  if (!Number.isNaN(wind) && wind > 50) return { type: 'warning', msg: 'Strong winds detected. Stay cautious.' };
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
  const role = getRole();
  const token = getToken();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const alert = useMemo(() => getAlert(weather), [weather]);

  const fetchByCoordinates = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const payload = await getWeather(lat, lon);
      setWeather(payload?.data || null);
    } catch (err) {
      setWeather(null);
      setError(err.message || 'Unable to fetch weather details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyLocationWeather = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(String(coords.latitude));
        setLongitude(String(coords.longitude));
        fetchByCoordinates(coords.latitude, coords.longitude);
      },
      () => setError('Unable to read your location.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
    if (!latitude.trim() || !longitude.trim()) return;
    fetchByCoordinates(latitude.trim(), longitude.trim());
  };

  return (
    <section className="page weather-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <header className="weather-header">
          <h1>Weather</h1>
          <p>Weather from backend API for your current location or coordinates.</p>
        </header>

        <Card className="weather-search-card">
          <form className="weather-search-form" onSubmit={onSearchSubmit}>
            <input
              type="number"
              step="any"
              value={latitude}
              placeholder="Latitude"
              onChange={(event) => setLatitude(event.target.value)}
            />
            <input
              type="number"
              step="any"
              value={longitude}
              placeholder="Longitude"
              onChange={(event) => setLongitude(event.target.value)}
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
                <div>
                  <h2>{weather.latitude}, {weather.longitude}</h2>
                  <p>Source: Open-Meteo (via backend)</p>
                </div>
              </div>
              <div className="weather-temp">
                <strong>{weather?.current?.temperature_2m ?? '-'} C</strong>
                <span>Current weather snapshot</span>
              </div>
            </Card>

            <div className="weather-metrics-grid">
              <Metric label="Humidity" value={`${weather?.current?.relative_humidity_2m ?? '-'}%`} />
              <Metric label="Wind" value={`${weather?.current?.wind_speed_10m ?? '-'} km/h`} />
              <Metric label="Time" value={weather?.current?.time || '-'} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
