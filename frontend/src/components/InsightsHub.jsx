import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';

function InsightPreviewCard({ icon, title, subtitle, body, primaryLabel, primaryAction, tone }) {
  return (
    <Card className={`insights-hub-card insights-hub-card--${tone}`}>
      <div className="insights-hub-card__icon" aria-hidden="true">
        <i className={icon} />
      </div>
      <div className="insights-hub-card__copy">
        <p className="insights-hub-card__subtitle">{subtitle}</p>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <div className="insights-hub-card__actions">
        <Button onClick={primaryAction}>{primaryLabel}</Button>
      </div>
    </Card>
  );
}

export default function InsightsHub() {
  const navigate = useNavigate();
  const token = getToken();
  const role = getRole();
  const farmerId = getFarmerId();

  useEffect(() => {
    if (!role) {
      navigate('/login');
    }
  }, [navigate, role]);

  const insights = [
    {
      key: 'mandi',
      icon: 'fa-solid fa-scale-balanced',
      subtitle: 'Current + Past Prices',
      title: 'Mandi Prices',
      body: 'Check recent APMC and mandi crop prices by commodity, date, state, and district before planning a sale or purchase.',
      primaryLabel: 'Open Mandi',
      path: '/market',
      tone: 'mandi',
    },
    {
      key: 'weather',
      icon: 'fa-solid fa-cloud-sun-rain',
      subtitle: 'Forecast + Planning',
      title: 'Weather',
      body: 'Review district weather, harvest timing signals, rain risk, humidity, and wind guidance for field and logistics planning.',
      primaryLabel: 'Open Weather',
      path: '/weather',
      tone: 'weather',
    },
    {
      key: 'news',
      icon: 'fa-regular fa-newspaper',
      subtitle: 'Policy, Agri News, Alerts',
      title: 'News',
      body: 'Track policy updates, crop alerts, farming tips, market signals, and important agriculture news in one place.',
      primaryLabel: 'Open News',
      path: '/news',
      tone: 'news',
    },
  ];

  return (
    <section className="page insights-hub-page">
      <ValidateToken token={token} role={role} farmerId={farmerId} />
      <div className="ag-container">
        <div className="insights-hub-head">
          <div>
            <p className="insights-hub-kicker">Insights</p>
            <h1>Mandi, weather, and news in one place</h1>
            <p>Use the same insight hub for crop prices, field planning, policy updates, agri news, and alerts.</p>
          </div>
        </div>

        <div className="insights-hub-grid" aria-label="Insights sections">
          {insights.map((item) => (
            <InsightPreviewCard
              key={item.key}
              icon={item.icon}
              subtitle={item.subtitle}
              title={item.title}
              body={item.body}
              primaryLabel={item.primaryLabel}
              primaryAction={() => navigate(item.path)}
              tone={item.tone}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
