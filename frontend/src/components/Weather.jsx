import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getRole, getToken } from '../lib/auth';
import { getWeatherForMe } from '../api/weatherApi';

function getAlert(weather) {
  if (!weather) return null;
  const current = weather.current || {};
  const temperature = Number(current.temp_c);
  const wind = Number(current.wind_kph);
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

  const alert = useMemo(() => getAlert(weather), [weather]);

  const fetchMyLocationWeather = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = await getWeatherForMe();
      setWeather(payload?.data || null);
    } catch (err) {
      setWeather(null);
      setError(err.message || 'Unable to fetch weather details.');
    } finally {
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

  return (
    <section className="page weather-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <header className="weather-header">
          <h1>Weather</h1>
          <p>Weather for your saved district from your farmer profile.</p>
        </header>

        <div className="weather-page__actions">
          <Button type="button" variant="outline" onClick={fetchMyLocationWeather}>
            Refresh Weather
          </Button>
        </div>

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
                {weather?.current?.condition?.icon ? (
                  <img src={`https:${weather.current.condition.icon}`} alt={weather?.current?.condition?.text || 'Weather icon'} />
                ) : null}
                <div>
                  <h2>{weather?.location?.name || '-'}, {weather?.location?.region || '-'}</h2>
                  <p>{weather?.location?.country || '-'}</p>
                  <p>{weather?.current?.condition?.text || '-'}</p>
                </div>
              </div>
              <div className="weather-temp">
                <strong>{weather?.current?.temp_c ?? '-'} C</strong>
                <span>Feels like {weather?.current?.feelslike_c ?? '-'} C</span>
              </div>
            </Card>

            <div className="weather-metrics-grid">
              <Metric label="Humidity" value={`${weather?.current?.humidity ?? '-'}%`} />
              <Metric label="Wind" value={`${weather?.current?.wind_kph ?? '-'} km/h`} />
              <Metric label="Pressure" value={`${weather?.current?.pressure_mb ?? '-'} mb`} />
              <Metric label="Visibility" value={`${weather?.current?.vis_km ?? '-'} km`} />
              <Metric label="UV Index" value={weather?.current?.uv ?? '-'} />
              <Metric label="Cloud" value={`${weather?.current?.cloud ?? '-'}%`} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
