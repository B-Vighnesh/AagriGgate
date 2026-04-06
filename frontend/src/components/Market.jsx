import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';
import {
  deleteAllSavedMarketData,
  deleteSavedMarketData,
  getMarketPrice,
  getSavedMarketData,
  saveMarketData,
} from '../api/marketApi';
import commodities from './commodities';
import statesAndDistricts from './statesAndDistricts';

const MAX_RANGE_DAYS = 7;
const PAGE_SIZE = 20;

function fmtPrice(value) {
  if (value === null || value === undefined || value === '') return '-';
  return `Rs ${value}`;
}

function diffInDays(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function marketRecordKey(item) {
  return [
    item?.Commodity || '',
    item?.State || '',
    item?.District || '',
    item?.Market || '',
    item?.Variety || '',
    item?.Arrival_Date || '',
  ].join('|');
}

function StatCard({ title, value, description, tone = 'primary' }) {
  return (
    <Card className={`market-stat market-stat--${tone}`}>
      <p className="market-stat__title">{title}</p>
      <h3>{value}</h3>
      {description && <p className="market-stat__desc">{description}</p>}
    </Card>
  );
}

function PriceCard({ item, isSaved, deleteId, onSave, onDelete }) {
  return (
    <Card className="market-price-card">
      <div className="market-price-card__head">
        <h3>{item.Commodity || 'Commodity'}</h3>
        {item.Grade ? <span className="market-chip">{item.Grade}</span> : null}
      </div>

      <div className="market-price-card__meta">
        <p><strong>Market:</strong> {item.Market || 'N/A'}</p>
        <p><strong>State:</strong> {item.State || 'N/A'}</p>
        <p><strong>District:</strong> {item.District || 'N/A'}</p>
        <p><strong>Date:</strong> {item.Arrival_Date || 'N/A'}</p>
      </div>

      <div className="market-price-card__prices">
        <span className="price-low">Low {fmtPrice(item.Min_Price)}</span>
        <span className="price-mid">Modal {fmtPrice(item.Modal_Price)}</span>
        <span className="price-high">High {fmtPrice(item.Max_Price)}</span>
      </div>

      {!isSaved ? (
        <Button variant="outline" className="full-width" onClick={() => onSave(item)}>Save</Button>
      ) : (
        <Button variant="danger" className="full-width" onClick={() => onDelete(deleteId)}>Remove Saved</Button>
      )}
    </Card>
  );
}

export default function Market() {
  const navigate = useNavigate();
  const token = getToken();
  const role = getRole();
  const farmerId = getFarmerId();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().slice(0, 10);

  const [commodity, setCommodity] = useState('Tomato');
  const [fromDate, setFromDate] = useState(defaultDate);
  const [toDate, setToDate] = useState(defaultDate);
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bangalore');

  const [marketData, setMarketData] = useState([]);
  const [savedData, setSavedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingMoreSaved, setLoadingMoreSaved] = useState(false);
  const [error, setError] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [removeAllStep, setRemoveAllStep] = useState(0);
  const [marketPage, setMarketPage] = useState(0);
  const [hasMoreMarketData, setHasMoreMarketData] = useState(false);
  const [activeQuery, setActiveQuery] = useState(null);
  const [savedPage, setSavedPage] = useState(0);
  const [hasMoreSavedData, setHasMoreSavedData] = useState(false);
  const [savedMarketLookup, setSavedMarketLookup] = useState({});

  const [filterCommodity, setFilterCommodity] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const autoFetchTimerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const loadMoreSavedRef = useRef(null);
  const toastTimerRef = useRef(null);

  const districts = useMemo(() => statesAndDistricts[state] || [], [state]);
  const savedDistricts = useMemo(() => statesAndDistricts[filterState] || [], [filterState]);

  const savedMarketIds = useMemo(() => new Set(Object.keys(savedMarketLookup)), [savedMarketLookup]);

  const stats = useMemo(() => {
    const modal = marketData.map((item) => Number(item.Modal_Price)).filter((n) => !Number.isNaN(n));
    const minItems = marketData
      .map((item) => ({ price: Number(item.Min_Price), market: item.Market }))
      .filter((v) => !Number.isNaN(v.price));
    const maxItems = marketData
      .map((item) => ({ price: Number(item.Max_Price), market: item.Market }))
      .filter((v) => !Number.isNaN(v.price));

    const average = modal.length ? (modal.reduce((a, b) => a + b, 0) / modal.length).toFixed(2) : null;
    const lowest = minItems.length ? minItems.reduce((p, c) => (c.price < p.price ? c : p)) : null;
    const highest = maxItems.length ? maxItems.reduce((p, c) => (c.price > p.price ? c : p)) : null;

    return { average, lowest, highest };
  }, [marketData]);

  const filteredSavedData = useMemo(() => {
    return savedData.filter((item) => {
      if (filterCommodity && item.Commodity !== filterCommodity) return false;
      if (filterState && item.State !== filterState) return false;
      if (filterDistrict && item.District !== filterDistrict) return false;
      if (minPrice && Number(item.Min_Price) < Number(minPrice)) return false;
      if (maxPrice && Number(item.Max_Price) > Number(maxPrice)) return false;
      return true;
    });
  }, [savedData, filterCommodity, filterState, filterDistrict, minPrice, maxPrice]);

  const showToast = (message, type = 'info', durationMs = 2500) => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast({ message: '', type: 'info' }), durationMs);
  };

  const fetchSavedData = useCallback(async (nextPage = 0, append = false) => {
    if (append) {
      setLoadingMoreSaved(true);
    } else {
      setLoadingSaved(true);
      setSavedData([]);
      setSavedPage(0);
      setHasMoreSavedData(false);
    }

    try {
      const pageData = await getSavedMarketData({ page: nextPage, size: PAGE_SIZE });
      const content = pageData?.content || [];
      const nextLookupEntries = (Array.isArray(content) ? content : [])
        .filter((item) => item?.marketId && item?.id)
        .map((item) => [String(item.marketId), item.id]);

      setSavedPage(pageData?.number ?? nextPage);
      setHasMoreSavedData(pageData?.last === false || ((pageData?.number ?? 0) + 1 < (pageData?.totalPages ?? 0)));
      setSavedData((prev) => (append ? [...prev, ...content] : (Array.isArray(content) ? content : [])));
      setSavedMarketLookup((prev) => {
        const nextLookup = append ? { ...prev } : {};
        nextLookupEntries.forEach(([marketId, savedId]) => {
          nextLookup[marketId] = savedId;
        });
        return nextLookup;
      });
    } catch {
      // ignore saved fetch errors silently
    } finally {
      if (append) {
        setLoadingMoreSaved(false);
      } else {
        setLoadingSaved(false);
      }
    }
  }, [farmerId]);

  const fetchMarketData = useCallback(async (manual = false, nextPage = 0, append = false) => {
    if (!state || !district || !commodity || !fromDate || !toDate) {
      if (manual) setError('Please select commodity, state, district, from date and to date.');
      return;
    }
    if (fromDate > toDate) {
      setError('From date cannot be after to date.');
      if (manual) showToast('From date cannot be after to date.', 'error');
      return;
    }

    let queryFromDate = fromDate;
    let queryToDate = toDate;
    const rangeDays = diffInDays(fromDate, toDate);
    if (rangeDays > MAX_RANGE_DAYS - 1) {
      queryToDate = addDays(queryFromDate, MAX_RANGE_DAYS - 1);
      const message = 'Date range is limited to 7 days from the start date. Showing the first allowed 7-day window.';
      setError(message);
      showToast(message, 'info', 10000);
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setMarketData([]);
      setMarketPage(0);
      setHasMoreMarketData(false);
    }
    if (rangeDays <= MAX_RANGE_DAYS - 1) {
      setError('');
    }

    const query = {
      crop: commodity,
      state,
      district,
      fromDate: queryFromDate,
      toDate: queryToDate,
    };

    try {
      const response = await getMarketPrice({ ...query, page: nextPage, size: PAGE_SIZE });
      const payload = response.data || {};
      const records = payload.items || [];

      setActiveQuery(query);
      setMarketPage(payload.page ?? nextPage);
      setHasMoreMarketData(Boolean(payload.hasNext));
      setMarketData((prev) => (append ? [...prev, ...records] : records));
      if (manual) {
        showToast(`Loaded ${payload.totalElements ?? records.length} records.`, 'success');
      }
    } catch (err) {
      if (!append) {
        setMarketData([]);
      }
      setError('Unable to fetch market data right now. Please try again.');
      if (manual) showToast('Unable to fetch market prices.', 'error');
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [state, district, commodity, fromDate, toDate]);

  const handleRunAnalysis = useCallback(async () => {
    if (!activeQuery) {
      showToast('Search market prices first, then run analysis.', 'info');
      return;
    }
    const params = new URLSearchParams({
      commodity: activeQuery.crop,
      state: activeQuery.state,
      fromDate: activeQuery.fromDate,
      toDate: activeQuery.toDate,
      range: '1M',
    });
    if (activeQuery.district) {
      params.set('district', activeQuery.district);
    }
    navigate(`/market/analytics?${params.toString()}`);
  }, [activeQuery, navigate]);

  useEffect(() => {
    if (!role) {
      navigate('/login');
      return;
    }
    if (role === 'buyer') {
      navigate('/404');
      return;
    }
  }, [role, navigate]);

  useEffect(() => {
    if (role === 'buyer' || !token || !farmerId) return;
    fetchSavedData(0, false);
  }, [role, token, farmerId, fetchSavedData]);

  useEffect(() => {
    if (!state || !district || !commodity || !fromDate || !toDate) return;
    clearTimeout(autoFetchTimerRef.current);
    autoFetchTimerRef.current = setTimeout(() => {
      fetchMarketData(false);
    }, 600);

    return () => clearTimeout(autoFetchTimerRef.current);
  }, [state, district, commodity, fromDate, toDate, fetchMarketData]);

  useEffect(() => {
    return () => {
      clearTimeout(autoFetchTimerRef.current);
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMoreMarketData || loading || loadingMore || !activeQuery || showSaved) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) {
        return;
      }
      fetchMarketData(false, marketPage + 1, true);
    }, {
      rootMargin: '200px 0px',
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [activeQuery, fetchMarketData, hasMoreMarketData, loading, loadingMore, marketPage, showSaved]);

  useEffect(() => {
    if (!showSaved || !loadMoreSavedRef.current || !hasMoreSavedData || loadingSaved || loadingMoreSaved) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) {
        return;
      }
      fetchSavedData(savedPage + 1, true);
    }, {
      rootMargin: '200px 0px',
    });

    observer.observe(loadMoreSavedRef.current);
    return () => observer.disconnect();
  }, [fetchSavedData, hasMoreSavedData, loadingMoreSaved, loadingSaved, savedPage, showSaved]);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (!nearBottom) {
        return;
      }

      if (!showSaved && hasMoreMarketData && !loading && !loadingMore && activeQuery) {
        fetchMarketData(false, marketPage + 1, true);
      }

      if (showSaved && hasMoreSavedData && !loadingSaved && !loadingMoreSaved) {
        fetchSavedData(savedPage + 1, true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [
    activeQuery,
    fetchMarketData,
    fetchSavedData,
    hasMoreMarketData,
    hasMoreSavedData,
    loading,
    loadingMore,
    loadingMoreSaved,
    loadingSaved,
    marketPage,
    savedPage,
    showSaved,
  ]);

  const handleStateChange = (nextState) => {
    setState(nextState);
    setDistrict('');
  };

  const handleSave = async (item) => {
    try {
      const res = await saveMarketData({ marketId: item.id });
      if (!res.ok) {
        showToast('Unable to save this record.', 'error');
        return;
      }
      const saved = await res.json().catch(() => null);
      setSavedMarketLookup((prev) => ({
        ...prev,
        [String(item.id)]: saved?.id ?? prev[String(item.id)] ?? item.id,
      }));
      if (saved?.id) {
        setSavedData((prev) => {
          const exists = prev.some((entry) => entry.id === saved.id);
          return exists ? prev : [saved, ...prev];
        });
      }
      showToast('Saved successfully.', 'success');
      if (showSaved) {
        fetchSavedData(0, false);
      }
    } catch {
      showToast('Server busy. Try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      showToast('Unable to identify saved item.', 'error');
      return;
    }
    try {
      const res = await deleteSavedMarketData(id);
      if (!res.ok) {
        showToast('Unable to delete saved item.', 'error');
        return;
      }
      setSavedData((prev) => prev.filter((item) => item.id !== id));
      setSavedMarketLookup((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((marketId) => {
          if (next[marketId] === id) {
            delete next[marketId];
          }
        });
        return next;
      });
      showToast('Removed from saved.', 'success');
      if (showSaved) {
        fetchSavedData(0, false);
      }
    } catch {
      showToast('Server busy. Try again.', 'error');
    }
  };

  const handleDeleteAllSaved = async () => {
    try {
      const res = await deleteAllSavedMarketData();
      if (!res.ok) {
        showToast('Unable to remove all saved data.', 'error');
        return;
      }
      setSavedData([]);
      setSavedPage(0);
      setHasMoreSavedData(false);
      setSavedMarketLookup({});
      setRemoveAllStep(0);
      showToast('All saved market data removed.', 'success');
    } catch {
      showToast('Server busy. Try again.', 'error');
    }
  };

  return (
    <section className="page market-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <header className="market-header">
          <h1>{showSaved ? 'Saved Market Data' : 'Market Prices'}</h1>
          <p>{showSaved ? 'Your saved market records with filters and scroll pagination.' : 'Market prices from stored mandi data with up to 7 days of history.'}</p>
        </header>

        {!showSaved ? (
          <>
            <Card className="market-filter-card">
              <div className="market-filter-grid">
                <div className="market-field">
                  <label htmlFor="commodity">Commodity</label>
                  <select id="commodity" value={commodity} onChange={(e) => setCommodity(e.target.value)}>
                    {commodities.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="market-field">
                  <label htmlFor="fromDate">From Date</label>
                  <input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    max={defaultDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div className="market-field">
                  <label htmlFor="toDate">To Date</label>
                  <input
                    id="toDate"
                    type="date"
                    value={toDate}
                    max={defaultDate}
                    min={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                <div className="market-field">
                  <label htmlFor="state">State</label>
                  <select id="state" value={state} onChange={(e) => handleStateChange(e.target.value)}>
                    <option value="">Select State</option>
                    {Object.keys(statesAndDistricts).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="market-field">
                  <label htmlFor="district">District</label>
                  <select
                    id="district"
                    value={district}
                    disabled={!state}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    <option value="">Select District</option>
                    {districts.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="market-actions">
                <Button onClick={() => fetchMarketData(true)} disabled={!state || !district || !commodity || !fromDate || !toDate}>
                  Fetch Prices
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaved(true);
                    fetchSavedData(0, false);
                  }}
                >
                  Saved Data
                </Button>
              </div>
            </Card>

            {error && <p className="market-error">{error}</p>}

            {!loading && (stats.average || stats.lowest || stats.highest) && (
              <div className="market-stats-grid">
                <StatCard title="Average (Modal)" value={fmtPrice(stats.average)} tone="primary" />
                <StatCard
                  title="Lowest Available"
                  value={fmtPrice(stats.lowest?.price)}
                  description={stats.lowest?.market || ''}
                  tone="success"
                />
                <StatCard
                  title="Highest Available"
                  value={fmtPrice(stats.highest?.price)}
                  description={stats.highest?.market || ''}
                  tone="warning"
                />
              </div>
            )}

            {!loading && activeQuery && (
              <Card className="market-analysis-prompt">
                <div>
                  <h3>Ready for deeper insights?</h3>
                  <p>We already fetched the market records. Run AI-style analysis to reveal trend lines, district heatmap, seasonal movement, and supply-price patterns.</p>
                </div>
                <Button onClick={handleRunAnalysis}>
                  Do Analysis
                </Button>
              </Card>
            )}

            {loading && (
              <div className="market-loading">
                <div className="ui-spinner ui-spinner--lg" />
                <span>Fetching market data...</span>
              </div>
            )}

            {!loading && marketData.length > 0 && (
              <>
                <div className="market-grid">
                  {marketData.map((item, index) => (
                    <PriceCard
                      key={`${marketRecordKey(item)}-${index}`}
                      item={item}
                      isSaved={savedMarketIds.has(String(item.id))}
                      deleteId={savedMarketLookup[String(item.id)]}
                      onSave={handleSave}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
                {hasMoreMarketData && <div ref={loadMoreRef} style={{ height: '1px' }} />}
                {loadingMore && (
                  <div className="market-loading">
                    <div className="ui-spinner" />
                    <span>Loading more prices...</span>
                  </div>
                )}
              </>
            )}

            {!loading && !error && marketData.length === 0 && state && district && (
              <Card className="market-empty">
                No data found for {commodity} in {district}, {state} from {fromDate} to {toDate}.
              </Card>
            )}
          </>
        ) : (
          <section className="market-saved">
            <div className="market-saved__head">
              <h2>Saved Market Data</h2>
            </div>

            <Card className="market-filter-card">
              <div className="market-filter-grid market-filter-grid--saved">
                <div className="market-field">
                  <label htmlFor="fCommodity">Commodity</label>
                  <select id="fCommodity" value={filterCommodity} onChange={(e) => setFilterCommodity(e.target.value)}>
                    <option value="">All</option>
                    {commodities.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="market-field">
                  <label htmlFor="fState">State</label>
                  <select
                    id="fState"
                    value={filterState}
                    onChange={(e) => {
                      setFilterState(e.target.value);
                      setFilterDistrict('');
                    }}
                  >
                    <option value="">All</option>
                    {Object.keys(statesAndDistricts).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="market-field">
                  <label htmlFor="fDistrict">District</label>
                  <select id="fDistrict" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
                    <option value="">All</option>
                    {savedDistricts.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="market-field">
                  <label htmlFor="minPrice">Min Price</label>
                  <input id="minPrice" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
                </div>

                <div className="market-field">
                  <label htmlFor="maxPrice">Max Price</label>
                  <input id="maxPrice" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="market-actions">
                <Button variant="outline" onClick={() => setShowSaved(false)}>
                  Back To Market
                </Button>
                <Button variant="danger" onClick={() => setRemoveAllStep(1)} disabled={savedData.length === 0}>
                  Remove All
                </Button>
              </div>
            </Card>

            {loadingSaved && (
              <div className="market-loading">
                <div className="ui-spinner ui-spinner--lg" />
                <span>Loading saved data...</span>
              </div>
            )}

            {!loadingSaved && filteredSavedData.length > 0 ? (
              <>
                <div className="market-grid">
                  {filteredSavedData.map((item, index) => (
                    <PriceCard key={`${item.id || marketRecordKey(item)}-${index}`} item={item} isSaved deleteId={item.id} onDelete={handleDelete} />
                  ))}
                </div>
                {hasMoreSavedData && <div ref={loadMoreSavedRef} style={{ height: '1px' }} />}
                {loadingMoreSaved && (
                  <div className="market-loading">
                    <div className="ui-spinner" />
                    <span>Loading more saved data...</span>
                  </div>
                )}
              </>
            ) : null}

            {!loadingSaved && filteredSavedData.length === 0 && (
              <Card className="market-empty">No saved data found for selected filters.</Card>
            )}
          </section>
        )}
      </div>

      <Modal
        isOpen={removeAllStep === 1}
        title="Remove All Saved Data"
        message="This will remove every saved market record from your account. You can’t undo this action."
        onClose={() => setRemoveAllStep(0)}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setRemoveAllStep(0),
        }}
        primaryAction={{
          label: 'Continue',
          onClick: () => setRemoveAllStep(2),
        }}
      />
      <Modal
        isOpen={removeAllStep === 2}
        title="Final Confirmation"
        message="Please confirm once more. All saved market data will be permanently deleted."
        onClose={() => setRemoveAllStep(0)}
        secondaryAction={{
          label: 'Back',
          onClick: () => setRemoveAllStep(1),
        }}
        primaryAction={{
          label: 'Delete All',
          onClick: handleDeleteAllSaved,
        }}
      />
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
