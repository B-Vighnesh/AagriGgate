import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { getNewsById } from '../lib/newsApi';

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NewsDetails() {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const data = await getNewsById(newsId);
        if (!active) return;
        setNews(data || null);
      } catch (error) {
        if (!active) return;
        setToast({ message: error.message || 'Unable to load news details.', type: 'error' });
        setNews(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [newsId]);

  const badges = useMemo(() => ([
    news?.category,
    news?.newsType,
    news?.isImportant ? 'Important' : null,
  ].filter(Boolean)), [news]);

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  if (!news) {
    return (
      <section className="page ntf-detail-page">
        <div className="ag-container ntf-detail-wrap">
          <Card className="ntf-detail-card ntf-detail-card--empty">
            <h1>News not found</h1>
            <p>This article may have been removed or is no longer available.</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
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
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            <div className="ntf-detail-badges">
              {badges.map((badge) => (
                <span key={badge} className="ntf-detail-badge">{badge}</span>
              ))}
            </div>
          </div>

          {news.imageUrl ? (
            <div className="ntf-detail-hero">
              <img src={news.imageUrl} alt={news.title} />
            </div>
          ) : null}

          <div className="ntf-detail-content">
            <h1>{news.title}</h1>
            <div className="ntf-detail-meta">
              <span><strong>Source:</strong> {news.sourceName || 'AagriGgate'}</span>
              <span><strong>Published:</strong> {formatDate(news.publishedAt || news.createdAt)}</span>
              {news.language ? <span><strong>Language:</strong> {news.language}</span> : null}
            </div>
            <p className="ntf-detail-copy">{news.summary || 'No summary available for this article.'}</p>
            {news.sourceUrl ? (
              <div className="ntf-detail-actions">
                <Button onClick={() => window.open(news.sourceUrl, '_blank', 'noopener,noreferrer')}>
                  Open Source
                </Button>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
