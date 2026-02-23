import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet } from '../lib/api';

const FIELDS = [
  { key: 'username', label: 'Username', icon: '👤' },
  { key: 'email', label: 'Email', icon: '📧' },
  { key: 'phoneNo', label: 'Phone', icon: '📞' },
  { key: 'dob', label: 'Date of Birth', icon: '🎂' },
  { key: 'state', label: 'State', icon: '🏙️' },
  { key: 'district', label: 'District', icon: '📍' },
];

export default function BuyerDetails() {
  const { buyerId } = useParams();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiGet(`/users/getBuyer/${buyerId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setBuyer)
      .catch(() => setError(true));
  }, [buyerId]);

  if (error) return (
    <div className="page-wrapper flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-4xl mb-3">❌</p>
      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Could not load buyer details.</p>
      <button className="btn-outline mt-4" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  if (!buyer) return (
    <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
      <span className="spinner" style={{ color: 'var(--color-primary)', width: '32px', height: '32px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div className="page-wrapper max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>← Back</button>
        <h1 className="section-title text-3xl">Buyer Profile</h1>
      </div>

      <div className="card p-6">
        {/* Avatar header */}
        <div className="flex flex-col items-center mb-6 pb-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-3"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', color: '#fff' }}
          >
            🛒
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {buyer.firstName} {buyer.lastName}
          </h2>
          <span className="badge badge-blue mt-1">Buyer</span>
        </div>

        {/* Detail rows */}
        <div className="space-y-3">
          {FIELDS.map(({ key, label, icon }) => buyer[key] && (
            <div key={key} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {icon} {label}
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{buyer[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
