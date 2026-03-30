import React, { useEffect, useState } from 'react';
import '../assets/AlertBanner.css';
import { getImportantNews } from '../lib/newsApi';

const ALERT_CATEGORIES = new Set(['WEATHER', 'SUBSIDY', 'LOAN', 'LAW']);

export default function AlertBanner() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getImportantNews({ size: 5 });
        if (!active) return;
        const content = Array.isArray(data?.content) ? data.content : [];
        setItems(content.filter((item) => ALERT_CATEGORIES.has(item.category)));
      } catch {
        if (active) setItems([]);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!items.length) return null;

  return (
    <section className="alert-banner">
      <div className="alert-banner__head">Alerts & Advisories</div>
      <div className="alert-banner__strip">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`alert-banner__pill alert-banner__pill--${(item.category || 'OTHER').toLowerCase()}`}
            onClick={() => window.open(item.sourceUrl, '_blank', 'noopener,noreferrer')}
          >
            <span className="alert-banner__category">{item.category}</span>
            <span className="alert-banner__title">{item.title}</span>
            <span className="alert-banner__flag">Important</span>
          </button>
        ))}
      </div>
    </section>
  );
}
