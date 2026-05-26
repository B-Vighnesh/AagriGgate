import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';

const INSIGHT_ITEMS = [
  {
    to: '/market',
    icon: 'fa-scale-balanced',
    title: 'Mandi Prices',
    description: 'Check crop prices by commodity, date, state, and district.',
  },
  {
    to: '/weather',
    icon: 'fa-cloud-sun-rain',
    title: 'Weather',
    description: 'Review district forecasts, rain risk, humidity, and wind guidance.',
  },
  {
    to: '/news',
    icon: 'fa-newspaper',
    title: 'News',
    description: 'Track policy updates, crop alerts, farming tips, and market signals.',
  },
];

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

  return (
    <section className="page insights-hub-page">
      <ValidateToken token={token} role={role} farmerId={farmerId} />

      <div className="ag-container insights-hub-shell">
        <header className="insights-hub-topbar">
          <div className="insights-hub-title-block">
            <h1>Insights</h1>
            <p>Open mandi prices, weather, and agriculture news from one place.</p>
          </div>
        </header>

        <Card className="insights-hub-menu">
          {INSIGHT_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className="insights-hub-row">
              <span className="insights-hub-row__icon" aria-hidden="true">
                <i className={`fa-solid ${item.icon}`} />
              </span>
              <span className="insights-hub-row__copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <i className="fa-solid fa-chevron-right insights-hub-row__chevron" aria-hidden="true" />
            </Link>
          ))}
        </Card>
      </div>
    </section>
  );
}
