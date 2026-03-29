import React from 'react';
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
  ALERT: 'Alert',
  OTHER: 'Other',
};

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
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
  onOpen,
  showSaveButton = true,
}) {
  const category = news?.category || 'OTHER';
  const type = news?.newsType || 'EXTERNAL';

  const handleOpen = () => {
    if (onOpen) onOpen(news);
    if (news?.sourceUrl) {
      window.open(news.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
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

  return (
    <Card
      className={`news-card news-card--${category.toLowerCase()}`}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Open article: ${news?.title || 'news item'}`}
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
              aria-label={isSaved ? 'Unsave news item' : 'Save news item'}
            >
              <i className={`${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark`} aria-hidden="true" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
