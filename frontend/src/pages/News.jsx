import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/News.css';
import AlertBanner from '../components/AlertBanner';
import NewsCard from '../components/NewsCard';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import { isLoggedIn } from '../lib/auth';
import {
  getNews,
  getSavedNews,
  reportNews,
  saveNews,
  unsaveNews,
} from '../lib/newsApi';

const PAGE_SIZE = 10;

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

export default function News() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [newsType, setNewsType] = useState('');
  const [importantOnly, setImportantOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [allPage, setAllPage] = useState(0);
  const [savedPage, setSavedPage] = useState(0);
  const [allState, setAllState] = useState({ items: [], totalPages: 0, totalElements: 0, loading: true, error: '' });
  const [savedState, setSavedState] = useState({ items: [], totalPages: 0, totalElements: 0, loading: false, error: '' });
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2200);
  };

  useEffect(() => {
    const syncSession = () => setLoggedIn(isLoggedIn());
    window.addEventListener('storage', syncSession);
    window.addEventListener('auth:expired', syncSession);
    syncSession();
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('auth:expired', syncSession);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setAllPage(0);
    setSavedPage(0);
  }, [debouncedSearch, category, newsType, importantOnly, sortBy]);

  useEffect(() => {
    if (activeTab !== 'all') return undefined;
    let active = true;

    (async () => {
      setAllState((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const data = await getNews({
          category,
          newsType,
          language: 'en',
          isImportant: importantOnly,
          keyword: debouncedSearch,
          page: allPage,
          size: PAGE_SIZE,
          sortBy,
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
  }, [activeTab, category, newsType, importantOnly, debouncedSearch, allPage, sortBy, loggedIn]);

  useEffect(() => {
    if (activeTab !== 'saved') return undefined;
    if (!loggedIn) {
      setSavedState({ items: [], totalPages: 0, totalElements: 0, loading: false, error: '' });
      return undefined;
    }

    let active = true;
    (async () => {
      setSavedState((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const data = await getSavedNews({
          category,
          keyword: debouncedSearch,
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
  }, [activeTab, loggedIn, category, debouncedSearch, savedPage]);

  const handleSave = async (news) => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    setAllState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
    }));

    try {
      await saveNews(news.id);
      showToast('News saved.', 'success');
    } catch (error) {
      setAllState((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
      }));
      showToast(error.message || 'Failed to save news.', 'error');
    }
  };

  const handleUnsave = async (news) => {
    if (activeTab === 'saved') {
      const previousItems = savedState.items;
      const nextItems = previousItems.filter((item) => item.news.id !== news.id);

      setSavedState((prev) => ({
        ...prev,
        items: nextItems,
        totalElements: Math.max(prev.totalElements - 1, 0),
      }));
      setAllState((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
      }));

      try {
        await unsaveNews(news.id);
        showToast('Removed from saved news.', 'info');
        if (!nextItems.length && savedPage > 0) {
          setSavedPage((prev) => Math.max(prev - 1, 0));
        }
      } catch (error) {
        setSavedState((prev) => ({
          ...prev,
          items: previousItems,
          totalElements: prev.totalElements + 1,
        }));
        setAllState((prev) => ({
          ...prev,
          items: prev.items.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
        }));
        showToast(error.message || 'Failed to remove saved news.', 'error');
      }
      return;
    }

    setAllState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === news.id ? { ...item, isSaved: false } : item)),
    }));
    try {
      await unsaveNews(news.id);
      showToast('Removed from saved news.', 'info');
    } catch (error) {
      setAllState((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === news.id ? { ...item, isSaved: true } : item)),
      }));
      showToast(error.message || 'Failed to remove saved news.', 'error');
    }
  };

  const handleReport = async (news, reason) => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    try {
      await reportNews(news.id, reason);
      showToast('Report submitted. Thank you.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to submit report.', 'error');
      throw error;
    }
  };

  const currentState = activeTab === 'all' ? allState : savedState;
  const currentPage = activeTab === 'all' ? allPage : savedPage;
  const setCurrentPage = activeTab === 'all' ? setAllPage : setSavedPage;

  return (
    <section className="page news-page">
      <div className="ag-container">
        <div className="news-page__head">
          <div>
            <h1>News & Alerts</h1>
            <p>Stay updated with agriculture news, policy changes, and weather alerts.</p>
          </div>
        </div>

        <AlertBanner />

        <div className="news-tabs">
          <button
            type="button"
            className={`news-tabs__item ${activeTab === 'all' ? 'news-tabs__item--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All News
          </button>
          <button
            type="button"
            className={`news-tabs__item ${activeTab === 'saved' ? 'news-tabs__item--active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved
          </button>
        </div>

        <Card className="news-toolbar">
          <input
            className="news-toolbar__input"
            type="text"
            placeholder={activeTab === 'all' ? 'Search news...' : 'Search saved news...'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="news-toolbar__input" value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value || 'all'} value={value}>{label}</option>
            ))}
          </select>

          {activeTab === 'all' ? (
            <>
              <select className="news-toolbar__input" value={newsType} onChange={(event) => setNewsType(event.target.value)}>
                {TYPE_OPTIONS.map(([value, label]) => (
                  <option key={value || 'all'} value={value}>{label}</option>
                ))}
              </select>
              <label className="news-toolbar__toggle">
                <input
                  type="checkbox"
                  checked={importantOnly}
                  onChange={(event) => setImportantOnly(event.target.checked)}
                />
                <span>Important Only</span>
              </label>
              <select className="news-toolbar__input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </>
          ) : null}
        </Card>

        {activeTab === 'saved' && !loggedIn ? (
          <Card className="news-page__empty">
            <h3>Login to save news for later.</h3>
            <p>Your saved news tab becomes available as soon as you sign in.</p>
            <div className="news-page__empty-actions">
              <Button onClick={() => navigate('/login')}>Go to Login</Button>
              <Link className="news-page__inline-link" to="/register">Create an account</Link>
            </div>
          </Card>
        ) : (
          <>
            {currentState.loading ? (
              <div className="news-grid">
                {[1, 2, 3].map((key) => (
                  <Card key={key} className="news-skeleton">
                    <div className="news-skeleton__image" />
                    <div className="news-skeleton__line news-skeleton__line--short" />
                    <div className="news-skeleton__line" />
                    <div className="news-skeleton__line" />
                  </Card>
                ))}
              </div>
            ) : null}

            {!currentState.loading && currentState.error ? (
              <Card className="news-page__empty">
                <h3>Failed to load news. Please try again.</h3>
                <p>{currentState.error}</p>
              </Card>
            ) : null}

            {!currentState.loading && !currentState.error ? (
              <p className="news-page__count">
                Showing {currentState.items.length} item{currentState.items.length !== 1 ? 's' : ''}
                {currentState.totalElements ? ` | ${currentState.totalElements} total` : ''}
              </p>
            ) : null}

            {!currentState.loading && !currentState.error && currentState.items.length > 0 ? (
              <div className="news-grid">
                {(activeTab === 'all' ? currentState.items : currentState.items.map((item) => item.news)).map((item) => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    isSaved={activeTab === 'all' ? Boolean(item.isSaved) : true}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                    onReport={handleReport}
                    showSaveButton
                  />
                ))}
              </div>
            ) : null}

            {!currentState.loading && !currentState.error && currentState.items.length === 0 ? (
              <Card className="news-page__empty">
                <h3>{activeTab === 'all' ? 'No news found. Try changing filters.' : 'You have not saved any news yet.'}</h3>
                <p>
                  {activeTab === 'all'
                    ? 'Update the search or filters to broaden the feed.'
                    : 'Save a few stories from the All News tab and they will appear here.'}
                </p>
              </Card>
            ) : null}

            {!currentState.loading && !currentState.error && currentState.totalPages > 1 ? (
              <div className="news-page__pagination">
                <Button variant="outline" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}>
                  Previous
                </Button>
                <span>Page {currentPage + 1} of {currentState.totalPages}</span>
                <Button
                  variant="outline"
                  disabled={currentPage >= currentState.totalPages - 1}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, currentState.totalPages - 1))}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
