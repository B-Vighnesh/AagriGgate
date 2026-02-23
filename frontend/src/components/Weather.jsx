import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import { apiGet } from '../lib/api';
import ValidateToken from './ValidateToken';

const WEATHER_ICONS = {
  temp: '🌡️',
  humidity: '💧',
  wind: '💨',
  pressure: '🔭',
  feels: '🤔',
  vis: '👁️',
  precip: '🌧️',
  uv: '☀️',
  rain: '☂️',
};

function getAlert(w) {
  if (!w) return null;
  const c = w.current;
  if (c.temp_c > 35) return { msg: '🔥 Heatwave Alert! Temperature above 35°C.', type: 'error' };
  if (c.temp_c < 0) return { msg: '❄️ Freezing temperatures! Below 0°C.', type: 'error' };
  if (c.humidity > 90) return { msg: '💦 Very high humidity. Feels muggy.', type: 'info' };
  if (c.wind_kph > 100) return { msg: '🌪️ Strong winds over 100 kph! Stay safe.', type: 'error' };
  if (c.precip_mm > 50) return { msg: '⛈️ Heavy rain expected. Take precautions.', type: 'error' };
  if (c.uv > 8) return { msg: '☀️ High UV Index. Protect yourself from the sun.', type: 'info' };
  if (c.condition.text.toLowerCase().includes('storm')) return { msg: '⚡ Storm warning!', type: 'error' };
  return null;
}

function WeatherCard({ icon, label, value }) {
  return (
    <div
      className="card p-4 flex items-center gap-3 transition-all duration-200"
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{value}</p>
      </div>
    </div>
  );
}

export default function Weather() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const API_KEY = '75f97057caa641fa99c73509242910';

  const fetchWeatherByCoords = async (q) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${q}&aqi=no`);
      const data = await res.json();
      if (data && !data.error) setWeather(data);
      else { setError('Weather data not available for this location.'); setWeather(null); }
    } catch { setError('Failed to fetch weather data.'); }
    finally { setLoading(false); }
  };

  const fetchUserWeather = async () => {
    if (!token || !farmerId) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await apiGet(`/users/getFarmer/${farmerId}`);
      if (res.ok) {
        const data = await res.json();
        await fetchWeatherByCoords(`${data.district},${data.state}`);
      } else { setError('Could not load your profile. Please log in again.'); }
    } catch { setError('Server busy. Try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!getRole()) { navigate('/login'); return; }
    if (getRole() === 'buyer') { navigate('/404'); return; }
    fetchUserWeather();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) fetchWeatherByCoords(searchQuery);
  };

  const alert = getAlert(weather);

  return (
    <div className="page-wrapper max-w-4xl mx-auto">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="mb-6">
        <h1 className="section-title text-3xl">Weather</h1>
        <p className="section-subtitle">Real-time conditions based on your farm location.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="card p-4 flex gap-3 mb-6">
        <input
          type="text"
          className="form-input flex-1"
          placeholder="Search any city…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary">🔍 Search</button>
        <button type="button" className="btn-outline" onClick={fetchUserWeather}>
          📍 My Location
        </button>
      </form>

      {/* Alert Banner */}
      {alert && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
          style={{
            background: alert.type === 'error' ? '#fee2e2' : '#fef3c7',
            color: alert.type === 'error' ? '#b91c1c' : '#92400e',
            border: `1px solid ${alert.type === 'error' ? '#fca5a5' : '#fde68a'}`,
          }}
        >
          {alert.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <span className="spinner" style={{ color: 'var(--color-primary)', width: '28px', height: '28px', borderWidth: '3px' }} />
          <span style={{ color: 'var(--color-text-muted)' }}>Fetching weather…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="card p-5 text-center" style={{ borderColor: '#fca5a5' }}>
          <p className="text-2xl mb-2">☁️</p>
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      )}

      {/* Weather Display */}
      {!loading && weather && (
        <div className="animate-fade-in">
          {/* Location Header */}
          <div className="card p-6 mb-4 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={`https:${weather.current.condition.icon}`}
              alt={weather.current.condition.text}
              className="w-16 h-16"
            />
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary-dark)' }}>
                {weather.location.name}, {weather.location.region}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{weather.location.country}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {weather.current.condition.text}
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
                {weather.current.temp_c}°C
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Feels like {weather.current.feelslike_c}°C
              </p>
            </div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <WeatherCard icon={WEATHER_ICONS.humidity} label="Humidity" value={`${weather.current.humidity}%`} />
            <WeatherCard icon={WEATHER_ICONS.wind} label="Wind Speed" value={`${weather.current.wind_kph} kph`} />
            <WeatherCard icon={WEATHER_ICONS.pressure} label="Pressure" value={`${weather.current.pressure_mb} mb`} />
            <WeatherCard icon={WEATHER_ICONS.vis} label="Visibility" value={`${weather.current.vis_km} km`} />
            <WeatherCard icon={WEATHER_ICONS.precip} label="Precipitation" value={`${weather.current.precip_mm} mm`} />
            <WeatherCard icon={WEATHER_ICONS.uv} label="UV Index" value={weather.current.uv} />
            <WeatherCard icon={WEATHER_ICONS.rain} label="Rain" value={weather.current.precip_mm > 0 ? 'Yes' : 'No'} />
            <WeatherCard icon={WEATHER_ICONS.feels} label="Feels Like" value={`${weather.current.feelslike_c}°C`} />
          </div>
        </div>
      )}
    </div>
  );
}