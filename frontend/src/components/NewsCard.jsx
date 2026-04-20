import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/NewsCard.css';
import { formatNewsDate } from '../lib/dateUtils';

const CATEGORY_LABELS = {
  SUBSIDY: 'Subsidy',
  LOAN: 'Loan',
  LAW: 'Law',
  WEATHER: 'Weather',
  MARKET: 'Market',
  FARMING_TIP: 'Farming Tip',
  OTHER: 'Other',
};

function getCategoryIcon(category) {
  const icons = {
    SUBSIDY: '🌾',
    LOAN: '🏦',
    LAW: '⚖️',
    WEATHER: '🌦️',
    MARKET: '📊',
    FARMING_TIP: '🌱',
    OTHER: '📰',
  };
  return icons[category] || '📰';
}

function BookmarkIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="news-card-bookmark-icon">
      <path
        d="M7 4.75h10a1 1 0 0 1 1 1v14.09l-6-3.55-6 3.55V5.75a1 1 0 0 1 1-1Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NewsCard({
  news,
  isSaved = false,
  onSave,
  onUnsave,
  showSaveButton = true,
}) {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const category = news?.category || 'OTHER';
  const type = news?.newsType || 'EXTERNAL';
  const categoryClass = category.toLowerCase();

  const handleOpen = () => {
    const newsId = news?.newsId ?? news?.id;
    if (newsId) {
      navigate(`/news/${newsId}`);
    }
  };

  const handleSaveClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (isSaved) {
      onUnsave?.(news);
      return;
    }
    onSave?.(news);
  };

  return (
    <article
      className={`news-card ${news?.isImportant ? 'is-important' : ''}`}
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
      <div className="news-card-image-wrap">
        {news?.imageUrl && !imageFailed ? (
          <>
            {/* Shimmer placeholder shown while image loads */}
            {!imageLoaded ? (
              <div className="news-card-image-shimmer" />
            ) : null}
            <img
              src={news.imageUrl}
              alt={news?.title || 'News'}
              className={`news-card-image ${imageLoaded ? 'is-loaded' : ''}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
          </>
        ) : null}
        {!news?.imageUrl || imageFailed ? (
          <div className={`news-card-image-placeholder cat-${categoryClass}`}>
            <span className="news-card-category-icon">{getCategoryIcon(category)}</span>
          </div>
        ) : null}
      </div>

      <div className="news-card-body">
        <div className="news-card-badge-row">
          <span className={`news-card-badge news-card-badge-category badge-${categoryClass}`}>
            {CATEGORY_LABELS[category] || 'News'}
          </span>
          {news?.isImportant ? (
            <span className="news-card-badge news-card-badge-important">
              <span className="news-card-important-dot" />
              IMPORTANT
            </span>
          ) : null}
          <span className={`news-card-badge news-card-badge-type ${String(type).toLowerCase()}`}>{type}</span>
        </div>

        <div className="news-card-content">
          <h3 className="news-card-title">{news?.title}</h3>
          <p className="news-card-summary">{news?.summary || 'No summary available.'}</p>
        </div>

        <div className="news-card-footer">
          <div className="news-card-meta">
            <span className={`news-card-source-dot cat-${categoryClass}`} />
            <span className="news-card-source-name">{news?.sourceName || 'AagriGgate'}</span>
            <span className="news-card-meta-separator">·</span>
            <span className="news-card-date">{formatNewsDate(news?.publishedAt || news?.createdAt)}</span>
          </div>

          {showSaveButton ? (
            <button
              type="button"
              className={`news-card-bookmark ${isSaved ? 'is-saved' : ''}`}
              onClick={handleSaveClick}
              aria-label={isSaved ? 'Remove from saved news' : 'Save news'}
            >
              <BookmarkIcon filled={isSaved} />
            </button>
          ) : null}
        </div>

        {/* TODO: Report feature temporarily disabled — to be re-enabled in future release. */}
        {/*
        <div className="news-card-report">
          <span>Report</span>
        </div>
        */}
      </div>
    </article>
  );
}
