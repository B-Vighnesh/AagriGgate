import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, apiGet, apiDelete, apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import ValidateToken from './ValidateToken';
import commodities from './commodities';
import statesAndDistricts from './statesAndDistricts';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-2xl font-extrabold" style={{ color }}>₹{value ?? '—'}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
  );
}

function MarketItemCard({ item, onSave, onDelete, isSaved }) {
  return (
    <div className="card card-hover p-4 flex flex-col gap-1">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-sm" style={{ color: 'var(--color-primary-dark)' }}>
          {item.Commodity || 'N/A'}
        </h3>
        {item.Grade && <span className="badge badge-green">{item.Grade}</span>}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {item.Market && <p><span className="font-medium">Market:</span> {item.Market}</p>}
        {item.State && <p><span className="font-medium">State:</span> {item.State}</p>}
        {item.District && <p><span className="font-medium">District:</span> {item.District}</p>}
        {item.Variety && <p><span className="font-medium">Variety:</span> {item.Variety}</p>}
        {item.Arrival_Date && <p><span className="font-medium">Arrival:</span> {item.Arrival_Date}</p>}
      </div>
      <div className="flex gap-3 mt-2 text-xs font-bold">
        {item.Min_Price && <span style={{ color: 'var(--color-success)' }}>Low ₹{item.Min_Price}</span>}
        {item.Modal_Price && <span style={{ color: 'var(--color-primary)' }}>Modal ₹{item.Modal_Price}</span>}
        {item.Max_Price && <span style={{ color: 'var(--color-warning)' }}>High ₹{item.Max_Price}</span>}
      </div>
      <div className="mt-3">
        {isSaved ? (
          <button className="btn btn-sm btn-danger w-full" onClick={() => onDelete(item.id)}>
            🗑 Remove Saved
          </button>
        ) : (
          <button className="btn btn-sm btn-outline w-full" onClick={() => onSave(item)}>
            💾 Save
          </button>
        )}
      </div>
    </div>
  );
}

export default function Market() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [marketData, setMarketData] = useState([]);
  const [savedData, setSavedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSaved, setShowSaved] = useState(false);

  const [commodity, setCommodity] = useState('Tomato');
  const [arrivalDate, setArrivalDate] = useState(todayStr);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [districtOptions, setDistrictOptions] = useState([]);

  const [averagePrice, setAveragePrice] = useState(null);
  const [bestPriceData, setBestPriceData] = useState(null);
  const [highestPriceData, setHighestPriceData] = useState(null);

  // Saved-data filters
  const [filterCommodity, setFilterCommodity] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const API_KEY = '579b464db66ec23bdd000001602edb9ef1a64cd961329419d730f705';

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const r = getRole();
    if (!r) navigate('/login');
    else if (r === 'buyer') navigate('/404');
    else fetchSavedData();
  }, []);

  const fetchMarketData = useCallback(async () => {
    if (!state || !district || !commodity) return;
    setLoading(true);
    setError(null);
    const url = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${API_KEY}&format=json&offset=0&limit=1000&filters[State]=${state}&filters[District]=${district}&filters[Commodity]=${commodity}&filters[Arrival_Date]=${arrivalDate}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const records = data.records || [];
      setMarketData(records);

      const modal = records.map(r => parseFloat(r.Modal_Price)).filter(v => !isNaN(v));
      const mins = records.map(r => ({ price: parseFloat(r.Min_Price), market: r.Market })).filter(v => !isNaN(v.price));
      const maxs = records.map(r => ({ price: parseFloat(r.Max_Price), market: r.Market })).filter(v => !isNaN(v.price));

      setAveragePrice(modal.length ? (modal.reduce((a, b) => a + b, 0) / modal.length).toFixed(2) : null);
      setBestPriceData(mins.length ? mins.reduce((p, c) => c.price < p.price ? c : p, mins[0]) : null);
      setHighestPriceData(maxs.length ? maxs.reduce((p, c) => c.price > p.price ? c : p, maxs[0]) : null);
    } catch {
      setError('Server is busy or no data available. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [commodity, arrivalDate, state, district]);

  const fetchSavedData = async () => {
    try {
      const res = await apiFetch('/api/saved-market-data/getAll', {
        method: 'GET',
        headers: { 'X-Farmer-Id': getFarmerId() },
      });
      if (res.ok) setSavedData(await res.json());
    } catch { /* silently fail */ }
  };

  const handleSave = async (item) => {
    try {
      const res = await apiPost('/api/saved-market-data/save', { ...item, farmerId: getFarmerId() });
      if (res.ok) { showToast(`${item.Commodity} saved!`, 'success'); fetchSavedData(); }
      else showToast('Save failed. Try again.', 'error');
    } catch { showToast('Server busy.', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch('/api/saved-market-data/delete', { method: 'DELETE', headers: { 'X-Id': id } });
      if (res.ok) { showToast('Removed from saved.', 'success'); fetchSavedData(); }
      else showToast('Delete failed.', 'error');
    } catch { showToast('Server busy.', 'error'); }
  };

  const handleStateChange = (val) => {
    setState(val);
    setDistrictOptions(statesAndDistricts[val] || []);
    setDistrict('');
  };

  const filteredSaved = savedData.filter(item => {
    if (filterCommodity && item.Commodity !== filterCommodity) return false;
    if (filterState && item.State !== filterState) return false;
    if (filterDistrict && item.District !== filterDistrict) return false;
    if (minPrice && parseFloat(item.Min_Price) < parseFloat(minPrice)) return false;
    if (maxPrice && parseFloat(item.Max_Price) > parseFloat(maxPrice)) return false;
    return true;
  });

  const savedIds = new Set(savedData.map(s => s.id));

  return (
    <div className="page-wrapper max-w-7xl mx-auto">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="mb-6">
        <h1 className="section-title text-3xl">Market Prices</h1>
        <p className="section-subtitle">Live commodity prices from government data — updated daily.</p>
      </div>

      {/* ── Search Form ── */}
      <div className="card p-5 mb-6">
        <form
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
          onSubmit={(e) => { e.preventDefault(); fetchMarketData(); }}
        >
          <div className="form-group mb-0">
            <label className="form-label">Commodity</label>
            <select className="form-select" value={commodity} onChange={e => setCommodity(e.target.value)}>
              {commodities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Arrival Date</label>
            <input type="date" className="form-input" value={arrivalDate}
              max={todayStr()} onChange={e => setArrivalDate(e.target.value)} />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">State</label>
            <select className="form-select" value={state} required onChange={e => handleStateChange(e.target.value)}>
              <option value="">Select State</option>
              {Object.keys(statesAndDistricts).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">District</label>
            <select className="form-select" value={district} required onChange={e => setDistrict(e.target.value)} disabled={!state}>
              <option value="">Select District</option>
              {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="lg:col-span-4 flex gap-3 justify-end mt-1">
            <button type="submit" className="btn-primary" disabled={!state || !district}>
              🔍 Fetch Prices
            </button>
            <button type="button" className="btn-outline" onClick={() => { setShowSaved(!showSaved); fetchSavedData(); }}>
              {showSaved ? 'Hide Saved' : '💾 Saved Data'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Stats ── */}
      {averagePrice && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-in">
          <StatCard label="Average (Modal)" value={averagePrice} color="var(--color-primary)" />
          <StatCard label="Lowest Available" value={bestPriceData?.price} sub={bestPriceData?.market} color="var(--color-success)" />
          <StatCard label="Highest Available" value={highestPriceData?.price} sub={highestPriceData?.market} color="var(--color-warning)" />
        </div>
      )}

      {/* ── Market Data Grid ── */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <span className="spinner" style={{ color: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--color-text-muted)' }}>Fetching market data…</span>
        </div>
      )}
      {error && (
        <div className="card p-4 text-center mb-6" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
          <p style={{ color: 'var(--color-error)' }}>⚠️ {error}</p>
        </div>
      )}
      {!loading && !error && marketData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {marketData.map((item, i) => (
            <MarketItemCard key={i} item={item} onSave={handleSave} onDelete={handleDelete} isSaved={savedIds.has(item.id)} />
          ))}
        </div>
      )}
      {!loading && !error && marketData.length === 0 && state && district && (
        <div className="text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
          <p className="text-4xl mb-2">🌾</p>
          <p>No data found for <strong>{commodity}</strong> in {district}, {state} on {arrivalDate}.</p>
        </div>
      )}

      {/* ── Saved Data Panel ── */}
      {showSaved && savedData.length > 0 && (
        <div className="mt-6 animate-fade-in">
          <h2 className="section-title text-xl mb-4">💾 Saved Market Data</h2>
          {/* Filters */}
          <div className="card p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <select className="form-select" value={filterCommodity} onChange={e => setFilterCommodity(e.target.value)}>
              <option value="">All Commodities</option>
              {commodities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-select" value={filterState} onChange={e => setFilterState(e.target.value)}>
              <option value="">All States</option>
              {Object.keys(statesAndDistricts).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
              <option value="">All Districts</option>
              {statesAndDistricts[filterState]?.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className="form-input" type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            <input className="form-input" type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSaved.map((item, i) => (
              <MarketItemCard key={i} item={item} onSave={handleSave} onDelete={handleDelete} isSaved />
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.msg}
        </div>
      )}
    </div>
  );
}
