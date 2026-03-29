import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/News.css';
import '../assets/SavedNews.css';
import NewsCard from '../components/NewsCard';
import ValidateToken from '../components/ValidateToken';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import { getToken } from '../lib/auth';
import { getSavedNews, trackNewsView, unsaveNews } from '../lib/newsApi';

const PAGE_SIZE = 10;

export default function SavedNews() {
  const navigate = useNavigate();
  const token = getToken();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setAppliedSearch(search);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [category]);

  useEffect(() => {
    if (!token) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getSavedNews({
          category,
          keyword: appliedSearch,
          page,
          size: PAGE_SIZE,
        });
        if (!alive) return;
        const content = Array.isArray(data?.content) ? data.content : [];
        setItems(content);
        setTotalPages(Number(data?.totalPages || 0));
        setTotalElements(Number(data?.totalElements || content.length || 0));
      } catch (loadError) {
        if (!alive) return;
        setItems([]);
        setTotalPages(0);
        setTotalElements(0);
        setError(loadError.message || 'Unable to load saved news.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token, category, appliedSearch, page]);

  const handleUnsave = async (savedItem) => {
    const previousItems = items;
    const updatedItems = items.filter((item) => item.id !== savedItem.id);
    setItems(updatedItems);
    setTotalElements((prev) => Math.max(prev - 1, 0));

    try {
      await unsaveNews(savedItem.news.id);
      showToast('Removed from saved news.', 'info');
      if (updatedItems.length === 0 && page > 0) {
        setPage((prev) => Math.max(prev - 1, 0));
      }
    } catch (saveError) {
      setItems(previousItems);
      setTotalElements((prev) => prev + 1);
      showToast(saveError.message || 'Unable to remove saved news.', 'error');
    }
  };

  const handleOpen = (savedItem) => {
    trackNewsView(savedItem.news.id);
  };

  return (
    <section className="page saved-news-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <div className="saved-news-page__head">
          <div>
            <h1>Saved News</h1>
            <p>Your bookmarked news and alert items.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/news')}>Browse News</Button>
        </div>

        <Card className="saved-news-toolbar">
          <input
            className="saved-news-toolbar__input"
            type="text"
            placeholder="Search saved news..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="saved-news-toolbar__input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All Categories</option>
            <option value="SUBSIDY">Subsidy</option>
            <option value="LOAN">Loan</option>
            <option value="LAW">Law</option>
            <option value="WEATHER">Weather</option>
            <option value="MARKET">Market</option>
            <option value="FARMING_TIP">Farming Tip</option>
            <option value="ALERT">Alert</option>
            <option value="OTHER">Other</option>
          </select>
        </Card>

        {loading ? (
          <div className="saved-news-page__state">
            <span className="ui-spinner ui-spinner--lg" />
            <span>Loading saved news...</span>
          </div>
        ) : null}

        {!loading && error ? (
          <Card className="saved-news-page__empty">
            <h3>Unable to load saved news</h3>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="news-grid">
            {items.map((item) => (
              <NewsCard
                key={item.id}
                news={item.news}
                isSaved
                onUnsave={() => handleUnsave(item)}
                onOpen={() => handleOpen(item)}
                showSaveButton
              />
            ))}
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Card className="saved-news-page__empty">
            <h3>No saved news yet</h3>
            <p>Save news items from the feed and they will appear here.</p>
            <Button onClick={() => navigate('/news')}>Open News Feed</Button>
          </Card>
        ) : null}

        {!loading && !error && totalPages > 1 ? (
          <div className="saved-news-page__pagination">
            <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
              Previous
            </Button>
            <span>Page {page + 1} of {totalPages}</span>
            <Button variant="outline" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={page >= totalPages - 1}>
              Next
            </Button>
          </div>
        ) : null}
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
