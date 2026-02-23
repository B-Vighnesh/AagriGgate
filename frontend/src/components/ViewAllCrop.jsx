import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet, apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import ValidateToken from './ValidateToken';

const LEAF_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23d8f3dc" width="100" height="100"/><text y="60" x="50" text-anchor="middle" font-size="40">🌾</text></svg>';

function CropCard({ crop, imageUrl, onViewDetails }) {
  return (
    <div className="card card-hover flex flex-col overflow-hidden">
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        <img
          src={imageUrl || LEAF_PLACEHOLDER}
          alt={crop.cropName}
          className="w-full h-full object-cover transition-transform duration-300"
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          onError={e => { e.currentTarget.src = LEAF_PLACEHOLDER; }}
        />
        <span className="badge badge-green absolute top-2 right-2">{crop.cropType}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-base mb-1" style={{ color: 'var(--color-primary-dark)' }}>{crop.cropName}</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          👨‍🌾 {crop.farmer?.firstName || 'N/A'} &nbsp;·&nbsp; 📍 {crop.region}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-lg font-extrabold" style={{ color: 'var(--color-primary)' }}>
              ₹{crop.marketPrice?.toFixed(2)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>per {crop.unit}</p>
          </div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Qty: {crop.quantity} {crop.unit}
          </p>
        </div>
        <button
          className="btn-primary w-full mt-3 text-sm py-2"
          onClick={() => onViewDetails(crop.cropID)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function ViewAllCrop() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [crops, setCrops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ region: '', price: '', category: '', farmerName: '' });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    apiGet('/crops/viewCrop')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setCrops(data);
        data.forEach(c => fetchImage(c.cropID));
      })
      .catch(() => setError('Failed to load crops. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const fetchImage = async (cropID) => {
    try {
      const res = await apiFetch(`/crops/viewUrl/${cropID}`);
      if (res.ok) {
        const blob = await res.blob();
        setImageUrls(prev => ({ ...prev, [cropID]: URL.createObjectURL(blob) }));
      }
    } catch { /* silently skip */ }
  };

  const filteredCrops = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return crops.filter(c => {
      const matchSearch =
        !q ||
        c.cropName.toLowerCase().includes(q) ||
        c.cropType.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        (c.farmer?.firstName || '').toLowerCase().includes(q);

      const matchRegion = !filters.region || c.region.toLowerCase().includes(filters.region.toLowerCase());
      const matchPrice = !filters.price || c.marketPrice <= parseFloat(filters.price);
      const matchCat = !filters.category || c.cropType.toLowerCase().includes(filters.category.toLowerCase());
      const matchFarmer = !filters.farmerName || (c.farmer?.firstName || '').toLowerCase().includes(filters.farmerName.toLowerCase());

      return matchSearch && matchRegion && matchPrice && matchCat && matchFarmer;
    });
  }, [crops, searchQuery, filters]);

  return (
    <div className="page-wrapper max-w-7xl mx-auto">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="section-title text-3xl">Available Crops</h1>
          <p className="section-subtitle">Browse fresh produce directly from farmers.</p>
        </div>
        {role === 'buyer' && (
          <Link to="/view-approaches-user" className="btn-outline text-sm shrink-0">
            📨 My Requests
          </Link>
        )}
      </div>

      {/* Search + Filters */}
      <div className="card p-4 mb-6">
        <div className="flex gap-3 mb-4">
          <input
            className="form-input flex-1"
            type="text"
            placeholder="🔍 Search by name, type, region or farmer…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            className="form-input text-xs"
            placeholder="Filter by Region"
            value={filters.region}
            onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
          />
          <input
            className="form-input text-xs"
            type="number"
            placeholder="Max Price (₹)"
            value={filters.price}
            onChange={e => setFilters(f => ({ ...f, price: e.target.value }))}
          />
          <input
            className="form-input text-xs"
            placeholder="Filter by Category"
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          />
          <input
            className="form-input text-xs"
            placeholder="Filter by Farmer"
            value={filters.farmerName}
            onChange={e => setFilters(f => ({ ...f, farmerName: e.target.value }))}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20 gap-3">
          <span className="spinner" style={{ color: 'var(--color-primary)', width: '28px', height: '28px', borderWidth: '3px' }} />
          <span style={{ color: 'var(--color-text-muted)' }}>Loading crops…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="card p-6 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm mb-3" style={{ color: 'var(--color-error)' }}>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* Results count */}
      {!loading && !error && (
        <p className="text-sm mb-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Crops Grid */}
      {!loading && !error && filteredCrops.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCrops.map(crop => (
            <CropCard
              key={crop.cropID}
              crop={crop}
              imageUrl={imageUrls[crop.cropID]}
              onViewDetails={id => navigate(`/view-details/${id}`)}
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredCrops.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🌱</p>
          <p className="text-base font-semibold" style={{ color: 'var(--color-text-muted)' }}>No crops match your search.</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Try adjusting filters or search differently.</p>
        </div>
      )}
    </div>
  );
}
