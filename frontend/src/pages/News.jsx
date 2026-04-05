import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/News.css';
import NewsCard from '../components/NewsCard';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { isLoggedIn } from '../lib/auth';
import { groupNewsByDate } from '../lib/dateUtils';
import { getNews, getSavedNews, saveNews, unsaveNews } from '../lib/newsApi';

const PAGE_SIZE = 10;
const MOBILE_BREAKPOINT = 768;

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

/* ── Utility: check if viewport is mobile ────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (event) => setIsMobile(event.matches);
    mql.addEventListener('change', handler);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

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

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="news-filter-toggle-icon">
      <path
        d="M3 5h14M5 10h10M7 15h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="news-filter-toggle-icon">
      <path
        d="M5 7.5 10 12.5 15 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const sentinelRef = useRef(null);
  const allPageResetPendingRef = useRef(false);
  const savedPageResetPendingRef = useRef(false);
  const isMobile = useIsMobile();

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

  /* ── Mobile-only state ─────────────────────────────────────────── */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileAccumulated, setMobileAccumulated] = useState([]);
  const [mobileLoadingMore, setMobileLoadingMore] = useState(false);
  const [mobileReachedEnd, setMobileReachedEnd] = useState(false);

  /* Count active filters for the badge */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count += 1;
    if (category) count += 1;
    if (newsType && activeTab === 'all') count += 1;
    if (importantOnly && activeTab === 'all') count += 1;
    return count;
  }, [debouncedSearch, category, newsType, importantOnly, activeTab]);

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
          state: { message: 'Please log in to read news.' },
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

  /* ── Reset pagination & accumulated items when filters change ─── */
  useEffect(() => {
    allPageResetPendingRef.current = true;
    savedPageResetPendingRef.current = true;
    setAllPage(0);
    setSavedPage(0);
    setMobileAccumulated([]);
    setMobileLoadingMore(false);
    setMobileReachedEnd(false);

    if (activeTab === 'all') {
      setAllState((previous) => ({
        ...previous,
        items: [],
        totalPages: 0,
        totalElements: 0,
        loading: true,
        error: '',
      }));
      return;
    }

    setSavedState((previous) => ({
      ...previous,
      items: [],
      totalPages: 0,
      totalElements: 0,
      loading: true,
      error: '',
    }));
  }, [debouncedSearch, category, newsType, importantOnly, dateRange, activeTab]);

  /* ── Fetch "All News" tab ──────────────────────────────────────── */
  useEffect(() => {
    if (!isAuthorized || activeTab !== 'all') return undefined;
    if (allPageResetPendingRef.current && allPage !== 0) return undefined;

    allPageResetPendingRef.current = false;
    let active = true;

    (async () => {
      const isFirstPage = allPage === 0;
      if (isFirstPage) {
        setAllState((previous) => ({
          ...previous,
          items: [],
          totalPages: 0,
          totalElements: 0,
          loading: true,
          error: '',
        }));
      } else {
        setMobileLoadingMore(true);
      }

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
        const totalPages = Number(data?.totalPages || 0);
        const totalElements = Number(data?.totalElements || content.length);

        setAllState({
          items: content,
          totalPages,
          totalElements,
          loading: false,
          error: '',
        });

        /* Accumulate for mobile infinite scroll */
        if (isMobile) {
          setMobileAccumulated((prev) => {
            if (isFirstPage) return content;
            /* Deduplicate by id */
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = content.filter((item) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
          if (allPage >= totalPages - 1) {
            setMobileReachedEnd(true);
          }
        }
      } catch (error) {
        if (!active) return;
        if (error?.status === 403) {
          showToast('You do not have permission to access news.', 'error');
        }
        setAllState({
          items: [],
          totalPages: 0,
          totalElements: 0,
          loading: false,
          error: error.message || 'Failed to load news. Please try again.',
        });
      } finally {
        setMobileLoadingMore(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthorized, activeTab, category, newsType, importantOnly, debouncedSearch, dateRange, allPage, reloadKey, isMobile]);

  /* ── Fetch "Saved" tab ─────────────────────────────────────────── */
  useEffect(() => {
    if (!isAuthorized || activeTab !== 'saved') return undefined;
    if (savedPageResetPendingRef.current && savedPage !== 0) return undefined;

    savedPageResetPendingRef.current = false;
    let active = true;
    (async () => {
      const isFirstPage = savedPage === 0;
      if (isFirstPage) {
        setSavedState((previous) => ({
          ...previous,
          items: [],
          totalPages: 0,
          totalElements: 0,
          loading: true,
          error: '',
        }));
      } else {
        setMobileLoadingMore(true);
      }

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
        const totalPages = Number(data?.totalPages || 0);
        const totalElements = Number(data?.totalElements || content.length);

        setSavedState({
          items: content,
          totalPages,
          totalElements,
          loading: false,
          error: '',
        });

        /* Accumulate for mobile infinite scroll */
        if (isMobile) {
          setMobileAccumulated((prev) => {
            const mapped = content.map((item) => item.news).filter(Boolean);
            if (isFirstPage) return mapped;
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = mapped.filter((item) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
          if (savedPage >= totalPages - 1) {
            setMobileReachedEnd(true);
          }
        }
      } catch (error) {
        if (!active) return;
        if (error?.status === 403) {
          showToast('You do not have permission to view saved news.', 'error');
        }
        setSavedState({
          items: [],
          totalPages: 0,
          totalElements: 0,
          loading: false,
          error: error.message || 'Failed to load saved news. Please try again.',
        });
      } finally {
        setMobileLoadingMore(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthorized, activeTab, category, debouncedSearch, dateRange, savedPage, reloadKey, isMobile]);

  /* ── Infinite scroll observer (mobile only) ────────────────────── */
  const handleInfiniteScroll = useCallback(() => {
    if (!isMobile || mobileLoadingMore || mobileReachedEnd) return;
    const currentState = activeTab === 'all' ? allState : savedState;
    if (currentState.loading || currentState.error) return;

    const currentPage = activeTab === 'all' ? allPage : savedPage;
    if (currentPage >= currentState.totalPages - 1) return;

    if (activeTab === 'all') {
      setAllPage((prev) => prev + 1);
    } else {
      setSavedPage((prev) => prev + 1);
    }
  }, [isMobile, mobileLoadingMore, mobileReachedEnd, activeTab, allState, savedState, allPage, savedPage]);

  useEffect(() => {
    if (!isMobile || !sentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleInfiniteScroll();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isMobile, handleInfiniteScroll]);

  const handleSave = async (news) => {
    setAllState((previous) => ({
      ...previous,
      items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
    }));

    /* Also update accumulated list */
    setMobileAccumulated((prev) =>
      prev.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
    );

    try {
      await saveNews(news.id);
      showToast('Saved', 'success');
    } catch (error) {
      setAllState((previous) => ({
        ...previous,
        items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
      }));
      setMobileAccumulated((prev) =>
        prev.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
      );
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
      setMobileAccumulated((prev) => prev.filter((item) => item.id !== news.id));

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
    setMobileAccumulated((prev) =>
      prev.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
    );
    try {
      await unsaveNews(news.id);
      showToast('Removed from saved', 'info');
    } catch (error) {
      setAllState((previous) => ({
        ...previous,
        items: previous.items.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
      }));
      setMobileAccumulated((prev) =>
        prev.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
      );
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
    setMobileAccumulated([]);
    setMobileReachedEnd(false);
  };

  const handleRetry = () => {
    setReloadKey((value) => value + 1);
    setMobileAccumulated([]);
    setMobileReachedEnd(false);
  };

  const currentState = activeTab === 'all' ? allState : savedState;
  const currentPage = activeTab === 'all' ? allPage : savedPage;
  const setCurrentPage = activeTab === 'all' ? setAllPage : setSavedPage;

  /* Desktop: current page items. Mobile: accumulated items. */
  const desktopItems = activeTab === 'all'
    ? currentState.items
    : currentState.items.map((item) => item.news).filter(Boolean);

  const displayItems = isMobile ? mobileAccumulated : desktopItems;

  const paginationItems = useMemo(
    () => buildPaginationItems(currentState.totalPages, currentPage),
    [currentState.totalPages, currentPage],
  );
  const showingFrom = currentState.totalElements === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const showingTo = Math.min((currentPage + 1) * PAGE_SIZE, currentState.totalElements);

  if (!isAuthorized) {
    return null;
  }

  /* ── Filter bar JSX (shared between mobile collapsible & desktop inline) ── */
  const filterBarJSX = (
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
  );

  return (
    <section className="news-page">
      <div className="ag-container">
        <div className="news-header">
          <div className="news-header-top">
            <div className="news-header-copy">
              <h1>{activeTab === 'saved' ? 'Saved News' : 'News'}</h1>
              <p>
                {activeTab === 'saved'
                  ? 'Your bookmarked agriculture news and alerts in one place'
                  : 'Stay updated with agriculture news, schemes, and alerts'}
              </p>
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
          {/* ── Filters: Collapsible on mobile, inline on desktop ─── */}
          {isMobile ? (
            <>
              <button
                type="button"
                className={`news-filter-toggle ${filtersOpen ? 'is-active' : ''}`}
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                aria-controls="news-mobile-filters"
              >
                <FilterIcon />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="news-filter-toggle-badge">{activeFilterCount}</span>
                ) : null}
                <ChevronDownIcon />
              </button>

              <div
                id="news-mobile-filters"
                className={`news-filter-collapsible ${filtersOpen ? 'is-open' : ''}`}
              >
                <div className="news-filter-collapsible-inner">
                  {filterBarJSX}
                </div>
              </div>
            </>
          ) : (
            filterBarJSX
          )}
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

            {!currentState.loading && !currentState.error && displayItems.length > 0 ? (
              <>
                {/* Task 4: Date-based grouping — group news under Today / Yesterday / Date headers */}
                {groupNewsByDate(displayItems).map((group) => (
                  <div key={group.label} className="news-date-group">
                    <h2 className="news-date-group-label">{group.label}</h2>
                    <div className="news-grid">
                      {group.items.map((item) => (
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
                  </div>
                ))}

                {/* ── Mobile: infinite scroll sentinel & loading ────── */}
                {isMobile ? (
                  <>
                    {mobileLoadingMore ? (
                      <div className="news-infinite-loader">
                        <div className="news-infinite-spinner" />
                        <span>Loading more articles…</span>
                      </div>
                    ) : null}

                    {mobileReachedEnd && displayItems.length > 0 ? (
                      <div className="news-end-indicator">
                        You've seen all {currentState.totalElements} articles
                      </div>
                    ) : null}

                    {/* Invisible sentinel triggers next page load */}
                    {!mobileReachedEnd ? (
                      <div ref={sentinelRef} className="news-scroll-sentinel" />
                    ) : null}
                  </>
                ) : null}

                {/* ── Desktop: traditional pagination (unchanged) ──── */}
                {!isMobile ? (
                  <div className="news-pagination">
                    {currentState.totalPages > 1 ? (
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
                    ) : null}

                    <p className="news-pagination-summary">
                      Showing {showingFrom}-{showingTo} of {currentState.totalElements} articles
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}

            {!currentState.loading && !currentState.error && displayItems.length === 0 ? (
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
