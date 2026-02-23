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

export default function ViewApproachForUser() {
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

  useEffect(() => {
    if (!role) { navigate('/login'); return; }
    if (role === 'farmer') { navigate('/404'); return; }

    apiGet(`/buyer/approach/requests/user/${farmerId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setApproaches)
      .catch(() => setError('No approaches found.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (approachId) => {
    try {
      const res = await apiFetch(`/buyer/approach/delete/${approachId}`, { method: 'DELETE' });
      if (res.ok) {
        setApproaches(prev => prev.filter(a => a.approachId !== approachId));
        showToast('Approach request withdrawn.', 'info');
      } else { showToast('Failed to withdraw. Try again.', 'error'); }
    } catch { showToast('Server busy.', 'error'); }
  };

  const filtered = useMemo(() =>
    filter === 'All' ? approaches : approaches.filter(a => a.status?.toLowerCase() === filter.toLowerCase()),
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
          <h1 className="section-title text-3xl">My Requests</h1>
          <p className="section-subtitle">Track the status of your approach requests to farmers.</p>
        </div>
        <select className="form-select w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
          {['All', 'Pending', 'Accepted', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {(error || filtered.length === 0) && (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">{error ? '📭' : '🔍'}</p>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {error || `No ${filter !== 'All' ? filter.toLowerCase() + ' ' : ''}requests`}
          </p>
          {error && <button className="btn-primary mt-4" onClick={() => navigate('/view-all-crops')}>Browse Crops</button>}
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map(a => (
          <div key={a.approachId} className="card p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>{a.cropName}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Farmer: <strong>{a.farmerName}</strong></p>
            </div>
            <span className={`badge ${STATUS_COLORS[a.status?.toLowerCase()] || 'badge-blue'}`}>{a.status}</span>
            <div className="flex gap-2 flex-wrap">
              <button className="btn-outline btn-sm" onClick={() => navigate(`/view-details/${a.cropId}`)}>View Crop</button>
              {a.status?.toLowerCase() === 'pending' && (
                <button className="btn-danger btn-sm" onClick={() => handleDelete(a.approachId)}>Withdraw</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? '✅' : 'ℹ️'} {toast.msg}</div>}
    </div>
  );
}
