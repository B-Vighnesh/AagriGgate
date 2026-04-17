import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { getMarketById } from '../api/marketApi';

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return 'Not available';
  return `Rs ${value}`;
}

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MarketDetails() {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const response = await getMarketById(marketId);
        if (!active) return;
        setMarket(response?.data ?? response ?? null);
      } catch (error) {
        if (!active) return;
        setToast({ message: error.message || 'Unable to load market record.', type: 'error' });
        setMarket(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [marketId]);

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  if (!market) {
    return (
      <section className="page ntf-detail-page">
        <div className="ag-container ntf-detail-wrap">
          <Card className="ntf-detail-card ntf-detail-card--empty">
            <h1>Market record not found</h1>
            <p>This market record may have expired or is no longer available.</p>
            <Button variant="outline" onClick={() => navigate('/market')}>Back to Market</Button>
          </Card>
        </div>
        <Toast message={toast.message} type={toast.type} />
      </section>
    );
  }

  return (
    <section className="page ntf-detail-page">
      <div className="ag-container ntf-detail-wrap">
        <Card className="ntf-detail-card">
          <div className="ntf-detail-head">
            <Button variant="outline" onClick={() => navigate('/market')}>Back to Market</Button>
            <div className="ntf-detail-badges">
              <span className="ntf-detail-badge">{market.Commodity || market.commodity}</span>
              {market.Grade || market.grade ? <span className="ntf-detail-badge">{market.Grade || market.grade}</span> : null}
            </div>
          </div>

          <div className="ntf-detail-content">
            <h1>{market.Market || market.market}</h1>
            <div className="ntf-detail-meta">
              <span><strong>State:</strong> {market.State || market.state}</span>
              <span><strong>District:</strong> {market.District || market.district}</span>
              <span><strong>Date:</strong> {formatDate(market.Arrival_Date || market.arrivalDate)}</span>
            </div>

            <div className="ntf-detail-grid">
              <div className="ntf-detail-stat">
                <span>Minimum Price</span>
                <strong>{formatPrice(market.Min_Price || market.minPrice)}</strong>
              </div>
              <div className="ntf-detail-stat">
                <span>Modal Price</span>
                <strong>{formatPrice(market.Modal_Price || market.modalPrice)}</strong>
              </div>
              <div className="ntf-detail-stat">
                <span>Maximum Price</span>
                <strong>{formatPrice(market.Max_Price || market.maxPrice)}</strong>
              </div>
              <div className="ntf-detail-stat">
                <span>Variety</span>
                <strong>{market.Variety || market.variety || 'Not available'}</strong>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
