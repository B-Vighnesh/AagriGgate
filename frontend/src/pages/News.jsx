import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/News.css';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import NewsCard from '../components/NewsCard';
import { getRole, getToken, isLoggedIn } from '../lib/auth';
import { getNews, saveNews, trackNewsView, unsaveNews } from '../lib/newsApi';

const PAGE_SIZE = 10;

export default function News() {
  const navigate = useNavigate();
  const token = getToken();
  const role = getRole();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [newsType, setNewsType] = useState('');
  const [importantOnly, setImportantOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
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
    const timer = window.setTimeout(() => {
      setPage(0);
      setAppliedSearch(search);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [category, newsType, importantOnly, sortBy]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getNews({
          category,
          newsType,
          language: 'en',
          isImportant: importantOnly,
          keyword: appliedSearch,
          page,
          size: PAGE_SIZE,
          sortBy,
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
        setError(loadError.message || 'Unable to load news right now.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [category, newsType, importantOnly, appliedSearch, page, sortBy, token, role]);

  const mutateSavedState = (newsId, saved) => {
    setItems((prev) => prev.map((item) => (
      item.id === newsId ? { ...item, isSaved: saved } : item
    )));
  };

  const handleSave = async (news) => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    mutateSavedState(news.id, true);
    try {
      await saveNews(news.id);
      showToast('News saved.', 'success');
    } catch (saveError) {
      mutateSavedState(news.id, false);
      showToast(saveError.message || 'Unable to save news.', 'error');
    }
  };

  const handleUnsave = async (news) => {
    mutateSavedState(news.id, false);
    try {
      await unsaveNews(news.id);
      showToast('News removed from saved list.', 'info');
    } catch (saveError) {
      mutateSavedState(news.id, true);
      showToast(saveError.message || 'Unable to unsave news.', 'error');
    }
  };

  const handleOpen = (news) => {
    trackNewsView(news.id);
  };

  return (
    <section className="page news-page">
      <div className="ag-container">
        <div className="news-page__head">
          <div>
            <h1>News & Alerts</h1>
            <p>Stay updated with agriculture news, policy changes, and weather alerts.</p>
          </div>
          {isLoggedIn() ? (
            <Button variant="outline" onClick={() => navigate('/news/saved')}>Saved News</Button>
          ) : null}
        </div>

        <Card className="news-toolbar">
          <input
            className="news-toolbar__input"
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="news-toolbar__input" value={category} onChange={(event) => setCategory(event.target.value)}>
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
          <select className="news-toolbar__input" value={newsType} onChange={(event) => setNewsType(event.target.value)}>
            <option value="">All Types</option>
            <option value="INTERNAL">Internal</option>
            <option value="EXTERNAL">External</option>
            <option value="WEATHER">Weather</option>
            <option value="ALERT">Alert</option>
          </select>
          <select className="news-toolbar__input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <label className="news-toolbar__toggle">
            <input
              type="checkbox"
              checked={importantOnly}
              onChange={(event) => setImportantOnly(event.target.checked)}
            />
            <span>Important Only</span>
          </label>
        </Card>

        {loading ? (
          <div className="news-page__state">
            <span className="ui-spinner ui-spinner--lg" />
            <span>Loading news...</span>
          </div>
        ) : null}

        {!loading && error ? (
          <Card className="news-page__empty">
            <h3>Unable to load news</h3>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        ) : null}

        {!loading && !error ? (
          <p className="news-page__count">
            Showing {items.length} item{items.length !== 1 ? 's' : ''}
            {totalElements ? ` | ${totalElements} total` : ''}
          </p>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="news-grid">
            {items.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                isSaved={Boolean(item.isSaved)}
                onSave={handleSave}
                onUnsave={handleUnsave}
                onOpen={handleOpen}
                showSaveButton
              />
            ))}
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Card className="news-page__empty">
            <h3>No news found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </Card>
        ) : null}

        {!loading && !error && totalPages > 1 ? (
          <div className="news-page__pagination">
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
