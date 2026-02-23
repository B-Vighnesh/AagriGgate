import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import { apiGet, apiFetch } from '../lib/api';
import ValidateToken from './ValidateToken';

const STATUS_COLORS = {
  pending: 'badge-amber',
  accepted: 'badge-green',
  rejected: 'badge-red',
};

export default function ViewApproach() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [approaches, setApproaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchApproaches = async () => {
    try {
      const res = await apiGet(`/seller/approach/requests/farmer/${farmerId}`);
      if (res.ok) setApproaches(await res.json());
      else setError('No requests found.');
    } catch { setError('Server busy. Please refresh.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!role) { navigate('/login'); return; }
    if (role === 'buyer') { navigate('/404'); return; }
    fetchApproaches();
  }, []);

  const handleAction = async (approachId, accept) => {
    const endpoint = accept
      ? `/seller/approach/accept/${approachId}`
      : `/seller/approach/reject/${approachId}`;
    try {
      const res = await apiFetch(endpoint, { method: 'POST' });
      if (res.ok) { showToast(accept ? 'Request accepted!' : 'Request rejected.', accept ? 'success' : 'info'); fetchApproaches(); }
      else showToast('Action failed.', 'error');
    } catch { showToast('Server busy.', 'error'); }
  };

  const filtered = useMemo(() =>
    filter === 'All' ? approaches : approaches.filter(a => a.status.toLowerCase() === filter.toLowerCase()),
    [approaches, filter]
  );

  if (loading) return (
    <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
      <span className="spinner" style={{ color: 'var(--color-primary)', width: '32px', height: '32px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div className="page-wrapper">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-3xl">Buying Proposals</h1>
          <p className="section-subtitle">Manage approach requests from buyers for your crops.</p>
        </div>
        <select
          className="form-select w-auto"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {['All', 'Pending', 'Accepted', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">📬</p>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{error}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>When buyers show interest in your crops, requests will appear here.</p>
        </div>
      )}

      {!error && filtered.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No {filter !== 'All' ? filter.toLowerCase() : ''} requests</p>
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map(a => (
          <div key={a.approachId} className="card p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>{a.cropName}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Buyer: <strong>{a.userName}</strong></p>
            </div>
            <span className={`badge ${STATUS_COLORS[a.status?.toLowerCase()] || 'badge-blue'}`}>
              {a.status}
            </span>
            <div className="flex gap-2 flex-wrap">
              <button className="btn-outline btn-sm" onClick={() => navigate(`/view-details/${a.cropId}`)}>View Crop</button>
              <button className="btn-ghost btn-sm" onClick={() => navigate(`/view-buyer/${a.userId}`)}>View Buyer</button>
              {a.status?.toLowerCase() === 'pending' && (
                <>
                  <button className="btn-primary btn-sm" onClick={() => handleAction(a.approachId, true)}>✓ Accept</button>
                  <button className="btn-danger btn-sm" onClick={() => handleAction(a.approachId, false)}>✕ Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? '✅' : 'ℹ️'} {toast.msg}</div>}
    </div>
  );
}
