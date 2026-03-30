import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/NewsCard.css';
import Button from './common/Button';
import Card from './common/Card';

const CATEGORY_LABELS = {
  SUBSIDY: 'Subsidy',
  LOAN: 'Loan',
  LAW: 'Law',
  WEATHER: 'Weather',
  MARKET: 'Market',
  FARMING_TIP: 'Farming Tip',
  OTHER: 'Other',
};

const REPORT_OPTIONS = ['Fake News', 'Wrong Category', 'Outdated', 'Other'];

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function NewsCard({
  news,
  isSaved = false,
  onSave,
  onUnsave,
  onReport,
  showSaveButton = true,
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_OPTIONS[0]);
  const [reporting, setReporting] = useState(false);

  const category = news?.category || 'OTHER';
  const type = news?.newsType || 'EXTERNAL';

  const handleOpen = () => {
    if (news?.sourceUrl) {
      window.open(news.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveClick = (event) => {
    event.stopPropagation();
    if (isSaved) {
      onUnsave?.(news);
      return;
    }
    onSave?.(news);
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onReport) return;
    setReporting(true);
    try {
      await onReport(news, reportReason);
      setReportOpen(false);
    } catch {
      // Page-level toast handles the visible error state.
    } finally {
      setReporting(false);
    }
  };

  return (
    <Card
      className={`news-card news-card--${category.toLowerCase()}`}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {news?.imageUrl ? (
        <img src={news.imageUrl} alt={news.title} className="news-card__image" />
      ) : (
        <div className={`news-card__placeholder news-card__placeholder--${category.toLowerCase()}`}>
          <span>{CATEGORY_LABELS[category] || 'News'}</span>
        </div>
      )}

      <div className="news-card__body">
        <div className="news-card__badges">
          <span className={`news-card__badge news-card__badge--${category.toLowerCase()}`}>
            {CATEGORY_LABELS[category] || category}
          </span>
          {news?.isImportant ? <span className="news-card__badge news-card__badge--important">Important</span> : null}
          <span className="news-card__badge news-card__badge--type">{type}</span>
        </div>

        <h3 className="news-card__title">{news?.title}</h3>
        <p className="news-card__summary">{news?.summary}</p>

        <div className="news-card__footer">
          <div className="news-card__meta">
            <span>{news?.sourceName || 'AagriGgate'}</span>
            <span>{formatDate(news?.createdAt)}</span>
          </div>

          {showSaveButton ? (
            <Button
              variant={isSaved ? 'accent' : 'outline'}
              size="sm"
              className="news-card__save"
              onClick={handleSaveClick}
            >
              <i className={`${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark`} aria-hidden="true" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
          ) : null}
        </div>

        <div className="news-card__report">
          <button
            type="button"
            className="news-card__report-link"
            onClick={(event) => {
              event.stopPropagation();
              setReportOpen((prev) => !prev);
            }}
          >
            Report
          </button>
        </div>

        {reportOpen ? (
          <form
            className="news-card__report-form"
            onSubmit={handleReportSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <label htmlFor={`report-${news?.id}`}>Reason</label>
            <select
              id={`report-${news?.id}`}
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            >
              {REPORT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="news-card__report-actions">
              <Button type="submit" size="sm" loading={reporting}>Submit</Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setReportOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </Card>
  );
}
