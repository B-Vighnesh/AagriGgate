import React, { useState } from 'react';
import { getToken } from '../lib/auth';
import { apiFetch } from '../lib/api';

/**
 * DeleteApproach — inline button component (no modal, no alert).
 * Props:
 *   approachId  — ID of the approach to delete
 *   onDeleted   — callback called after successful deletion
 */
export default function DeleteApproach({ approachId, onDeleted }) {
  const token = getToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!token) { setError('Not authenticated.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/buyer/approach/delete/${approachId}`, { method: 'DELETE' });
      if (res.ok) { if (onDeleted) onDeleted(approachId); }
      else setError('Failed to delete. Try again.');
    } catch { setError('Server busy.'); }
    finally { setLoading(false); }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button className="btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
        {loading ? <><span className="spinner" /> Deleting…</> : 'Withdraw'}
      </button>
      {error && <span className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>}
    </span>
  );
}
