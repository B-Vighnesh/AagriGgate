import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';

function InsightPreviewCard({ icon, title, subtitle, body, primaryLabel, primaryAction, secondaryLabel, secondaryAction }) {
  return (
    <Card className="insights-hub-card">
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
        {secondaryLabel ? (
          <Button variant="outline" onClick={secondaryAction}>
            {secondaryLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export default function InsightsHub() {
  const navigate = useNavigate();
  const token = getToken();
  const role = getRole();
  const farmerId = getFarmerId();
  const [activeTab, setActiveTab] = useState(role === 'farmer' ? 'weather' : 'news');

  useEffect(() => {
    if (!role) {
      navigate('/login');
    }
  }, [navigate, role]);

  useEffect(() => {
    if (role !== 'farmer' && activeTab === 'weather') {
      setActiveTab('news');
    }
  }, [activeTab, role]);

  const tabOptions = useMemo(() => {
    const options = [];
    if (role === 'farmer') {
      options.push({ key: 'weather', label: 'Weather' });
    }
    options.push({ key: 'news', label: 'News' });
    return options;
  }, [role]);

  return (
    <section className="page insights-hub-page">
      <ValidateToken token={token} role={role} farmerId={farmerId} />
      <div className="ag-container">
        <div className="insights-hub-head">
          <div>
            <p className="insights-hub-kicker">Insights</p>
            <h1>Weather and market updates in one place</h1>
            <p>Switch between quick insight panels instead of digging through the mobile drawer.</p>
          </div>
        </div>

        <div className="insights-hub-tabs" role="tablist" aria-label="Insights sections">
          {tabOptions.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`insights-hub-tab ${activeTab === tab.key ? 'insights-hub-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'weather' ? (
          <div className="insights-hub-panel" role="tabpanel">
            <InsightPreviewCard
              icon="fa-solid fa-cloud-sun-rain"
              subtitle="Field Planning"
              title="Weather readiness for sellers"
              body="Open the weather workspace to review live district conditions, harvest timing alerts, and rain or wind guidance before you move produce."
              primaryLabel="Open Weather"
              primaryAction={() => navigate('/weather')}
              secondaryLabel="View News"
              secondaryAction={() => setActiveTab('news')}
            />
          </div>
        ) : null}

        {activeTab === 'news' ? (
          <div className="insights-hub-panel" role="tabpanel">
            <InsightPreviewCard
              icon="fa-regular fa-newspaper"
              subtitle="Agri News"
              title="Latest market and farming news"
              body="Track policy updates, farming tips, market signals, and important crop news without leaving the app shell."
              primaryLabel="Open News"
              primaryAction={() => navigate('/news')}
              secondaryLabel={role === 'farmer' ? 'Open Weather' : ''}
              secondaryAction={() => setActiveTab('weather')}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
