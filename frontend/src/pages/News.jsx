import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/News.css';
import NewsCard from '../components/NewsCard';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { isLoggedIn } from '../lib/auth';
import { getNews, getSavedNews, saveNews, unsaveNews } from '../lib/newsApi';

const PAGE_SIZE = 10;

const DATE_RANGES = [
  { value: 'ALL', label: 'All' },
  { value: 'TODAY', label: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday' },
  { value: 'LAST_7_DAYS', label: 'Last 7 days' },
  { value: 'LAST_30_DAYS', label: 'Last 30 days' },
];

const CATEGORY_OPTIONS = [
  ['', 'All Categories'],
  ['SUBSIDY', 'Subsidy'],
  ['LOAN', 'Loan'],
  ['LAW', 'Law'],
  ['WEATHER', 'Weather'],
  ['MARKET', 'Market'],
  ['FARMING_TIP', 'Farming Tip'],
  ['OTHER', 'Other'],
];

const TYPE_OPTIONS = [
  ['', 'All Types'],
  ['INTERNAL', 'Internal'],
  ['EXTERNAL', 'External'],
  ['WEATHER', 'Weather'],
];

const initialFeedState = {
  items: [],
  totalPages: 0,
  totalElements: 0,
  loading: true,
  error: '',
};

const initialSavedState = {
  items: [],
  totalPages: 0,
  totalElements: 0,
  loading: false,
  error: '',
};

function NewsIllustration() {
  return (
    <svg viewBox="0 0 240 180" aria-hidden="true" className="news-empty-illustration">
      <rect x="25" y="26" width="190" height="128" rx="18" fill="#eff7f1" />
      <rect x="43" y="46" width="78" height="78" rx="14" fill="#d9efe1" />
      <rect x="133" y="52" width="56" height="10" rx="5" fill="#c7ddd0" />
      <rect x="133" y="72" width="42" height="10" rx="5" fill="#c7ddd0" />
      <rect x="43" y="136" width="146" height="8" rx="4" fill="#d4e5db" />
      <path d="M72 94c9-18 19-27 30-27 10 0 18 6 24 18 6 12 14 18 24 18" fill="none" stroke="#2d7a3a" strokeWidth="6" strokeLinecap="round" />
      <circle cx="167" cy="109" r="8" fill="#ea8f44" />
    </svg>
  );
}

function SavedIllustration() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="news-empty-bookmark">
      <path
        d="M36 22h48a6 6 0 0 1 6 6v66l-30-17-30 17V28a6 6 0 0 1 6-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="news-filter-search-icon">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SkeletonCard({ index }) {
  return (
    <article className="news-skeleton-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="news-skeleton-shimmer news-skeleton-image" />
      <div className="news-skeleton-body">
        <div className="news-skeleton-badges">
          <span className="news-skeleton-shimmer news-skeleton-badge" />
          <span className="news-skeleton-shimmer news-skeleton-badge news-skeleton-badge--small" />
        </div>
        <div className="news-skeleton-shimmer news-skeleton-line news-skeleton-line--title" />
        <div className="news-skeleton-shimmer news-skeleton-line news-skeleton-line--title-short" />
        <div className="news-skeleton-shimmer news-skeleton-line" />
        <div className="news-skeleton-shimmer news-skeleton-line" />
        <div className="news-skeleton-shimmer news-skeleton-line news-skeleton-line--summary-short" />
      </div>
      <div className="news-skeleton-footer">
        <div className="news-skeleton-shimmer news-skeleton-line news-skeleton-line--meta" />
        <div className="news-skeleton-shimmer news-skeleton-circle" />
      </div>
    </article>
  );
}

function buildPaginationItems(totalPages, currentPage) {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set([1, totalPages, currentPage + 1]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page + 1 >= 1 && page + 1 <= totalPages) {
      pages.add(page + 1);
    }
  }

  const sorted = Array.from(pages).sort((left, right) => left - right);
  const items = [];
  for (let index = 0; index < sorted.length; index += 1) {
    if (index > 0 && sorted[index] - sorted[index - 1] > 1) {
      items.push(`ellipsis-${sorted[index - 1]}`);
    }
    items.push(sorted[index]);
  }
  return items;
}

export default function News() {
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [newsType, setNewsType] = useState('');
  const [importantOnly, setImportantOnly] = useState(false);
  const [dateRange, setDateRange] = useState('ALL');
  const [allPage, setAllPage] = useState(0);
  const [savedPage, setSavedPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [allState, setAllState] = useState(initialFeedState);
  const [savedState, setSavedState] = useState(initialSavedState);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    window.clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => setToast({ message: '', type: 'info' }), 2200);
  };

  useEffect(() => {
    document.title = 'AagriGgate | News';
    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const syncSession = () => {
      if (!isLoggedIn()) {
        setIsAuthorized(false);
        navigate('/login', {
          replace: true,
          state: { message: 'Please log in to read news and alerts.' },
        });
        return;
      }
      setIsAuthorized(true);
    };

    syncSession();
    window.addEventListener('storage', syncSession);
    window.addEventListener('auth:expired', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('auth:expired', syncSession);
    };
  }, [navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setAllPage(0);
    setSavedPage(0);
  }, [debouncedSearch, category, newsType, importantOnly, dateRange, activeTab]);

  useEffect(() => {
    if (!isAuthorized || activeTab !== 'all') return undefined;
    let active = true;

    (async () => {
      setAllState((previous) => ({ ...previous, loading: true, error: '' }));
      try {
        const data = await getNews({
          category,
          newsType,
          language: 'en',
          isImportant: importantOnly,
          keyword: debouncedSearch,
          dateRange,
          page: allPage,
          size: PAGE_SIZE,
          sortBy: 'newest',
        });
        if (!active) return;
        const content = Array.isArray(data?.content) ? data.content : [];
        setAllState({
          items: content,
          totalPages: Number(data?.totalPages || 0),
          totalElements: Number(data?.totalElements || content.length),
          loading: false,
          error: '',
        });
      } catch (error) {
        if (!active) return;
        setAllState({
          items: [],
          totalPages: 0,
          totalElements: 0,
          loading: false,
          error: error.message || 'Failed to load news. Please try again.',
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthorized, activeTab, category, newsType, importantOnly, debouncedSearch, dateRange, allPage, reloadKey]);

  useEffect(() => {
    if (!isAuthorized || activeTab !== 'saved') return undefined;

    let active = true;
    (async () => {
      setSavedState((previous) => ({ ...previous, loading: true, error: '' }));
      try {
        const data = await getSavedNews({
          category,
          keyword: debouncedSearch,
          dateRange,
          page: savedPage,
          size: PAGE_SIZE,
        });
        if (!active) return;
        const content = Array.isArray(data?.content) ? data.content : [];
        setSavedState({
          items: content,
          totalPages: Number(data?.totalPages || 0),
          totalElements: Number(data?.totalElements || content.length),
          loading: false,
          error: '',
        });
      } catch (error) {
        if (!active) return;
        setSavedState({
          items: [],
          totalPages: 0,
          totalElements: 0,
          loading: false,
          error: error.message || 'Failed to load saved news. Please try again.',
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthorized, activeTab, category, debouncedSearch, dateRange, savedPage, reloadKey]);

  const handleSave = async (news) => {
    setAllState((previous) => ({
      ...previous,
      items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
    }));

    try {
      await saveNews(news.id);
      showToast('Saved', 'success');
    } catch (error) {
      setAllState((previous) => ({
        ...previous,
        items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
      }));
      showToast(error.message || 'Failed to save news.', 'error');
    }
  };

  const handleUnsave = async (news) => {
    if (activeTab === 'saved') {
      const previousItems = savedState.items;
      const nextItems = previousItems.filter((item) => item.news?.id !== news.id);
      const nextTotalElements = Math.max(savedState.totalElements - 1, 0);

      setSavedState((previous) => ({
        ...previous,
        items: nextItems,
        totalElements: nextTotalElements,
        totalPages: Math.ceil(nextTotalElements / PAGE_SIZE),
      }));
      setAllState((previous) => ({
        ...previous,
        items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
      }));

      try {
        await unsaveNews(news.id);
        showToast('Removed from saved', 'info');
        if (!nextItems.length && savedPage > 0) {
          setSavedPage((previous) => Math.max(previous - 1, 0));
        }
      } catch (error) {
        setSavedState((previous) => ({
          ...previous,
          items: previousItems,
          totalElements: previous.totalElements + 1,
          totalPages: Math.ceil((previous.totalElements + 1) / PAGE_SIZE),
        }));
        setAllState((previous) => ({
          ...previous,
          items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
        }));
        showToast(error.message || 'Failed to remove saved news.', 'error');
      }
      return;
    }

    setAllState((previous) => ({
      ...previous,
      items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
    }));
    try {
      await unsaveNews(news.id);
      showToast('Removed from saved', 'info');
    } catch (error) {
      setAllState((previous) => ({
        ...previous,
        items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
      }));
      showToast(error.message || 'Failed to remove saved news.', 'error');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setNewsType('');
    setImportantOnly(false);
    setDateRange('ALL');
    setAllPage(0);
    setSavedPage(0);
  };

  const handleRetry = () => {
    setReloadKey((value) => value + 1);
  };

  const currentState = activeTab === 'all' ? allState : savedState;
  const currentPage = activeTab === 'all' ? allPage : savedPage;
  const setCurrentPage = activeTab === 'all' ? setAllPage : setSavedPage;
  const currentItems = activeTab === 'all'
    ? currentState.items
    : currentState.items.map((item) => item.news).filter(Boolean);
  const paginationItems = useMemo(
    () => buildPaginationItems(currentState.totalPages, currentPage),
    [currentState.totalPages, currentPage],
  );
  const showingFrom = currentState.totalElements === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const showingTo = Math.min((currentPage + 1) * PAGE_SIZE, currentState.totalElements);

  if (!isAuthorized) {
    return null;
  }

  return (
    <section className="news-page">
      <div className="ag-container">
        <div className="news-header">
          <div className="news-header-top">
            <div className="news-header-copy">
              <h1>News</h1>
              <p>Stay updated with agriculture news, schemes, and alerts</p>
            </div>

            <div className="news-tab-group" role="tablist" aria-label="News tabs">
              <button
                type="button"
                className={`news-tab ${activeTab === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All News
              </button>
              <button
                type="button"
                className={`news-tab ${activeTab === 'saved' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                Saved
              </button>
            </div>
          </div>

          <div className="news-date-strip" aria-label="Date range filters">
            {DATE_RANGES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`news-date-pill ${dateRange === option.value ? 'is-active' : ''}`}
                onClick={() => setDateRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={`news-filter-bar ${activeTab === 'saved' ? 'is-saved' : ''}`}>
            <label className="news-filter-search" htmlFor="news-search">
              <SearchIcon />
              <input
                id="news-search"
                type="search"
                placeholder={activeTab === 'all' ? 'Search news...' : 'Search saved articles...'}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value || 'all'} value={value}>{label}</option>
              ))}
            </select>

            {activeTab === 'all' ? (
              <>
                <select value={newsType} onChange={(event) => setNewsType(event.target.value)}>
                  {TYPE_OPTIONS.map(([value, label]) => (
                    <option key={value || 'all'} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`news-important-toggle ${importantOnly ? 'is-active' : ''}`}
                  onClick={() => setImportantOnly((value) => !value)}
                >
                  Important Only
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="news-content">
          {activeTab === 'saved' && !isLoggedIn() ? (
            <div className="news-state news-state-empty">
              <SavedIllustration />
              <h2>Something went wrong. Please log in again.</h2>
            </div>
          ) : null}

          {currentState.error ? (
            <div className="news-error-banner" role="alert">
              <span>Failed to load news. Please try again.</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>Retry</Button>
            </div>
          ) : null}

          <div className={`news-panel ${activeTab === 'saved' ? 'is-saved' : ''}`}>
            {currentState.loading ? (
              <div className="news-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={`skeleton-${index + 1}`} index={index} />
                ))}
              </div>
            ) : null}

            {!currentState.loading && !currentState.error && currentItems.length > 0 ? (
              <>
                <div className="news-grid">
                  {currentItems.map((item) => (
                    <NewsCard
                      key={item.id}
                      news={item}
                      isSaved={activeTab === 'all' ? Boolean(item.isSaved) : true}
                      onSave={handleSave}
                      onUnsave={handleUnsave}
                      showSaveButton
                    />
                  ))}
                </div>

                <div className="news-pagination">
                  {currentState.totalPages > 1 ? (
                    <>
                      <div className="news-pagination-desktop">
                        <button
                          type="button"
                          className="news-page-button"
                          disabled={currentPage === 0}
                          onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                          aria-label="Previous page"
                        >
                          &lt;
                        </button>

                        {paginationItems.map((item) => (
                          typeof item === 'string' ? (
                            <span key={item} className="news-page-ellipsis">...</span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              className={`news-page-button ${currentPage === item - 1 ? 'is-active' : ''}`}
                              onClick={() => setCurrentPage(item - 1)}
                            >
                              {item}
                            </button>
                          )
                        ))}

                        <button
                          type="button"
                          className="news-page-button"
                          disabled={currentPage >= currentState.totalPages - 1}
                          onClick={() => setCurrentPage((page) => Math.min(page + 1, currentState.totalPages - 1))}
                          aria-label="Next page"
                        >
                          &gt;
                        </button>
                      </div>

                      <div className="news-pagination-mobile">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 0}
                          onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                        >
                          &lt; Previous
                        </Button>
                        <span>Page {currentPage + 1} of {Math.max(currentState.totalPages, 1)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage >= currentState.totalPages - 1}
                          onClick={() => setCurrentPage((page) => Math.min(page + 1, currentState.totalPages - 1))}
                        >
                          Next &gt;
                        </Button>
                      </div>
                    </>
                  ) : null}

                  <p className="news-pagination-summary">
                    Showing {showingFrom}-{showingTo} of {currentState.totalElements} articles
                  </p>
                </div>
              </>
            ) : null}

            {!currentState.loading && !currentState.error && currentItems.length === 0 ? (
              activeTab === 'saved' ? (
                <div className="news-state news-state-empty">
                  <SavedIllustration />
                  <h2>No saved articles yet</h2>
                  <p>Tap the bookmark on any article to save it here.</p>
                </div>
              ) : (
                <div className="news-state news-state-empty">
                  <NewsIllustration />
                  <h2>No news found</h2>
                  <p>Try changing filters or check back later.</p>
                  <Button variant="ghost" onClick={handleClearFilters}>Clear Filters</Button>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
