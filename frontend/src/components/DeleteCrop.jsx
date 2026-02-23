import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import ValidateToken from './ValidateToken';

export default function DeleteCrop({ cropId, onClose }) {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/crops/farmer/delete1/${cropId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setDone(true);
      else setError('Failed to delete the crop. Please try again.');
    } catch {
      setError('Server busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      <div className="card p-7 w-full max-w-sm text-center animate-fade-in-up">
        <ValidateToken farmerId={farmerId} token={token} role={role} />

        {!done ? (
          <>
            <div className="text-5xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>Delete Crop</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              This action is permanent. Are you sure you want to delete this crop?
            </p>
            {error && (
              <p className="text-sm mb-3 font-medium" style={{ color: 'var(--color-error)' }}>{error}</p>
            )}
            <div className="flex gap-3">
              <button className="btn-danger flex-1 py-2.5" onClick={handleDelete} disabled={loading}>
                {loading ? <><span className="spinner" /> Deleting…</> : 'Yes, Delete'}
              </button>
              <button className="btn-outline flex-1 py-2.5" onClick={onClose}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-success)' }}>Deleted!</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>The crop has been removed successfully.</p>
            <button className="btn-primary w-full" onClick={() => navigate('/view-crop')}>View My Crops</button>
          </>
        )}
      </div>
    </div>
  );
}
