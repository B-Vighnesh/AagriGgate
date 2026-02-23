import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet, apiFetch } from '../lib/api';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import ValidateToken from './ValidateToken';

const LEAF_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23d8f3dc" width="100" height="100"/><text y="60" x="50" text-anchor="middle" font-size="40">🌾</text></svg>';

export default function ViewCrop() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [crops, setCrops] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token || !farmerId) { navigate('/login'); return; }
    if (role === 'buyer') { navigate('/404'); return; }

    apiGet(`/crops/farmer/viewCrop/${farmerId}`)
      .then(res => {
        if (!res.ok) throw new Error('session_expired');
        return res.json();
      })
      .then(data => {
        setCrops(data);
        data.forEach(c => {
          apiFetch(`/crops/viewUrl/${c.cropID}`)
            .then(r => r.ok ? r.blob() : null)
            .then(blob => blob && setImageUrls(prev => ({ ...prev, [c.cropID]: URL.createObjectURL(blob) })))
            .catch(() => { });
        });
      })
      .catch(err => setError(err.message === 'session_expired' ? 'Session expired. Please log in again.' : 'Server busy. Try again.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return crops;
    return crops.filter(c =>
      c.cropName.toLowerCase().includes(q) ||
      c.cropType.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
    );
  }, [crops, searchQuery]);

  if (loading) return (
    <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
      <span className="spinner" style={{ color: 'var(--color-primary)', width: '32px', height: '32px', borderWidth: '3px' }} />
    </div>
  );

  if (error) return (
    <div className="page-wrapper text-center">
      <p className="text-3xl mb-3">⚠️</p>
      <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>
      <button className="btn-primary" onClick={() => navigate('/login')}>Login</button>
    </div>
  );

  return (
    <div className="page-wrapper max-w-7xl mx-auto">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="section-title text-3xl">My Crops Dashboard</h1>
          <p className="section-subtitle">{crops.length} crop{crops.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link to="/add-crop" className="btn-primary shrink-0">+ Add New Crop</Link>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          className="form-input max-w-md"
          type="text"
          placeholder="🔍 Search by name, type or region…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🌱</p>
          <p className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            {crops.length === 0 ? 'No crops yet. Add your first one!' : 'No crops match your search.'}
          </p>
          {crops.length === 0 && (
            <Link to="/add-crop" className="btn-primary mt-4 inline-flex">+ Add Your First Crop</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(crop => (
            <div key={crop.cropID} className="card card-hover flex flex-col overflow-hidden cursor-pointer"
              onClick={() => navigate(`/view-details/${crop.cropID}`)}>
              <div className="h-40 overflow-hidden bg-gray-50">
                <img
                  src={imageUrls[crop.cropID] || LEAF_PLACEHOLDER}
                  alt={crop.cropName}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={e => { e.currentTarget.src = LEAF_PLACEHOLDER; }}
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm" style={{ color: 'var(--color-primary-dark)' }}>{crop.cropName}</h3>
                  <span className="badge badge-green shrink-0">{crop.cropType}</span>
                </div>
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>📍 {crop.region}</p>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold" style={{ color: 'var(--color-primary)' }}>₹{crop.marketPrice?.toFixed(2)}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>per {crop.unit}</p>
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {crop.quantity} {crop.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
