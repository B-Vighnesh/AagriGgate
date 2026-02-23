import React, { useState } from 'react';
import { getToken, getFarmerId } from '../lib/auth';

export default function ApproachFarmer({ cropId, farmerId, onClose }) {
  const token = getToken();
  const currentUserId = getFarmerId();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleApproach = async () => {
    if (!token) { setError('You are not logged in. Please log in first.'); return; }
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:8080/buyer/approach/create/${farmerId}/${cropId}/${currentUserId}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) setSuccess(true);
      else {
        const msg = await res.text();
        setError(msg || 'Failed to send approach request. You may have already requested this crop.');
      }
    } catch { setError('Server busy. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      <div className="card p-8 w-full max-w-sm text-center animate-fade-in-up">
        {!success && !error && (
          <>
            <div className="text-5xl mb-3">🤝</div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>Approach Farmer</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              Are you sure you want to send an approach request to the farmer for this crop?
            </p>
            <div className="flex gap-3">
              <button className="btn-primary flex-1 py-2.5" onClick={handleApproach} disabled={loading}>
                {loading ? <><span className="spinner" /> Sending…</> : 'Yes, Approach'}
              </button>
              <button className="btn-outline flex-1 py-2.5" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {success && (
          <>
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-success)' }}>Request Sent!</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              Your approach request was sent successfully. The farmer will review it and get in touch.
            </p>
            <button className="btn-primary w-full" onClick={onClose}>Done</button>
          </>
        )}

        {error && (
          <>
            <div className="text-5xl mb-3">⚠️</div>
            <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-error)' }}>Request Failed</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
            <button className="btn-outline w-full" onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}
