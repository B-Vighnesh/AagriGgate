import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getRole, getToken } from '../lib/auth';
import { getWeatherForMe } from '../api/weatherApi';

function formatValue(value, suffix = '') {
  if (value == null || Number.isNaN(Number(value))) return '-';
  const numeric = Number(value);
  const formatted = Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1);
  return `${formatted}${suffix}`;
}

function getRainGuidance(current) {
  const precip = Number(current?.precip_mm);
  const condition = String(current?.condition?.text || '').toLowerCase();
  if (!Number.isNaN(precip) && precip >= 2) {
    return {
      tone: 'warning',
      title: 'Rain risk',
      text: 'Rain is building up. Consider delaying harvest, drying, or transport activity.',
    };
  }
  if (condition.includes('rain') || condition.includes('shower') || condition.includes('drizzle')) {
    return {
      tone: 'warning',
      title: 'Rain expected',
      text: 'Keep an eye on field movement and harvested crop exposure.',
    };
  }
  return {
    tone: 'neutral',
    title: 'Low rain signal',
    text: 'No immediate rain signal. Irrigation planning may still be important.',
  };
}

function getHumidityGuidance(current) {
  const humidity = Number(current?.humidity);
  if (!Number.isNaN(humidity) && humidity >= 80) {
    return {
      tone: 'warning',
      title: 'High humidity',
      text: 'Disease and fungal risk can increase in standing crops and stored produce.',
    };
  }
  if (!Number.isNaN(humidity) && humidity <= 35) {
    return {
      tone: 'caution',
      title: 'Low humidity',
      text: 'Drying conditions are strong. Watch crop moisture loss and irrigation need.',
    };
  }
  return {
    tone: 'good',
    title: 'Balanced humidity',
    text: 'Humidity is in a moderate range for routine field planning.',
  };
}

function getWindGuidance(current) {
  const wind = Number(current?.wind_kph);
  const gust = Number(current?.gust_kph);
  if ((!Number.isNaN(gust) && gust >= 35) || (!Number.isNaN(wind) && wind >= 25)) {
    return {
      tone: 'warning',
      title: 'Strong wind',
      text: 'Be careful with pesticide spraying, staking, and loose harvested material.',
    };
  }
  return {
    tone: 'neutral',
    title: 'Stable wind',
    text: 'Wind conditions look manageable for most field work.',
  };
}

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

function AdvisoryCard({ icon, title, text, tone }) {
  return (
    <Card className={`weather-advisory weather-advisory--${tone}`}>
      <div className="weather-advisory__icon" aria-hidden="true">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
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
  const current = weather?.current || {};
  const location = weather?.location || {};
  const rainGuidance = useMemo(() => getRainGuidance(current), [current]);
  const humidityGuidance = useMemo(() => getHumidityGuidance(current), [current]);
  const windGuidance = useMemo(() => getWindGuidance(current), [current]);

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
          <p>Live-ready district weather focused on field decisions, harvest timing, and crop safety.</p>
        </header>

        <div className="weather-page__actions">
          <Button
            type="button"
            variant="outline"
            onClick={fetchMyLocationWeather}
            className="weather-refresh-btn"
            aria-label="Refresh weather"
            title="Refresh weather"
          >
            <i className="fa-solid fa-rotate-right weather-refresh-btn__icon" aria-hidden="true" />
            <span className="weather-refresh-btn__label">Refresh Weather</span>
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
            <Card className="weather-hero">
              <div className="weather-hero__main">
                <div className="weather-hero__identity">
                  <div className="weather-hero__icon-wrap">
                    {current?.condition?.icon ? (
                      <img src={`https:${current.condition.icon}`} alt={current?.condition?.text || 'Weather icon'} />
                    ) : (
                      <i className="fa-solid fa-cloud-sun" />
                    )}
                  </div>
                  <div className="weather-hero__copy">
                    <span className="weather-kicker">Farmer District Forecast</span>
                    <h2>{location?.name || '-'}, {location?.region || '-'}</h2>
                    <p>{current?.condition?.text || '-'} with {formatValue(current?.cloud, '%')} cloud cover</p>
                  </div>
                </div>
                <div className="weather-temp weather-temp--hero">
                  <strong>{formatValue(current?.temp_c, ' C')}</strong>
                  <span>Feels like {formatValue(current?.feelslike_c, ' C')}</span>
                </div>
              </div>

              <div className="weather-hero__meta">
                <span><i className="fa-regular fa-clock" /> Updated {current?.last_updated || '-'}</span>
                <span><i className="fa-solid fa-location-dot" /> {location?.country || '-'}</span>
                <span><i className="fa-solid fa-cloud-rain" /> Rain {formatValue(current?.precip_mm, ' mm')}</span>
                <span><i className="fa-solid fa-wind" /> Wind {formatValue(current?.wind_kph, ' km/h')}</span>
              </div>

              {alert && (
                <div className={`weather-hero__alert weather-hero__alert--${alert.type === 'error' ? 'error' : 'warning'}`}>
                  <i className={`fa-solid ${alert.type === 'error' ? 'fa-temperature-high' : 'fa-triangle-exclamation'}`} />
                  <span>{alert.msg}</span>
                </div>
              )}
            </Card>

            <div className="weather-decision-grid">
              <Card className="weather-focus weather-focus--temperature">
                <div className="weather-focus__head">
                  <span className="weather-focus__icon"><i className="fa-solid fa-temperature-three-quarters" /></span>
                  <div>
                    <p>Temperature</p>
                    <h3>{formatValue(current?.temp_c, ' C')}</h3>
                  </div>
                </div>
                <div className="weather-focus__body">
                  <span>Feels like {formatValue(current?.feelslike_c, ' C')}</span>
                  <small>Heat and cold directly affect crop stress, flowering, and storage handling.</small>
                </div>
              </Card>

              <Card className="weather-focus weather-focus--rain">
                <div className="weather-focus__head">
                  <span className="weather-focus__icon"><i className="fa-solid fa-cloud-rain" /></span>
                  <div>
                    <p>Rain</p>
                    <h3>{formatValue(current?.precip_mm, ' mm')}</h3>
                  </div>
                </div>
                <div className="weather-focus__body">
                  <span>{current?.condition?.text || '-'}</span>
                  <small>Rain affects harvest timing, drying, transport, and irrigation decisions.</small>
                </div>
              </Card>

              <Card className="weather-focus weather-focus--humidity">
                <div className="weather-focus__head">
                  <span className="weather-focus__icon"><i className="fa-solid fa-droplet" /></span>
                  <div>
                    <p>Humidity</p>
                    <h3>{formatValue(current?.humidity, '%')}</h3>
                  </div>
                </div>
                <div className="weather-focus__body">
                  <span>Air moisture level</span>
                  <small>Humidity helps estimate disease risk, drying speed, and produce storage safety.</small>
                </div>
              </Card>
            </div>

            <div className="weather-content-grid">
              <div className="weather-content-grid__main">
                <Card className="weather-section-card">
                  <div className="weather-section-card__head">
                    <div>
                      <span className="weather-kicker">Field Signals</span>
                      <h3>Wind, cloud, and timing</h3>
                    </div>
                  </div>
                  <div className="weather-metrics-grid weather-metrics-grid--rich">
                    <Metric label="Wind Speed" value={formatValue(current?.wind_kph, ' km/h')} />
                    <Metric label="Wind Gust" value={formatValue(current?.gust_kph, ' km/h')} />
                    <Metric label="Wind Direction" value={current?.wind_dir || '-'} />
                    <Metric label="Cloud Cover" value={formatValue(current?.cloud, '%')} />
                    <Metric label="Condition" value={current?.condition?.text || '-'} />
                    <Metric label="Last Updated" value={current?.last_updated || '-'} />
                  </div>
                </Card>
              </div>

              <div className="weather-content-grid__side">
                <AdvisoryCard
                  icon={<i className="fa-solid fa-cloud-showers-heavy" />}
                  title={rainGuidance.title}
                  text={rainGuidance.text}
                  tone={rainGuidance.tone}
                />
                <AdvisoryCard
                  icon={<i className="fa-solid fa-seedling" />}
                  title={humidityGuidance.title}
                  text={humidityGuidance.text}
                  tone={humidityGuidance.tone}
                />
                <AdvisoryCard
                  icon={<i className="fa-solid fa-wind" />}
                  title={windGuidance.title}
                  text={windGuidance.text}
                  tone={windGuidance.tone}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
