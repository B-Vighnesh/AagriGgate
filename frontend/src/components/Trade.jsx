import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToken, getRole } from '../lib/auth';

export default function Trade() {
  const navigate = useNavigate();
  const token = getToken();
  const role = getRole();

  // Unauthenticated → Login
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (role === 'buyer') { navigate('/view-all-crops'); }
  }, [token, role]);

  // Buyer auto-navigates; this UI is only for farmers
  if (!token || role === 'buyer') return null;

  const actions = [
    { icon: '🌱', label: 'Add Crop', desc: 'List a new crop for buyers to discover.', to: '/add-crop' },
    { icon: '📦', label: 'My Crops', desc: 'View and manage all your listed crops.', to: '/view-crop' },
    { icon: '🤝', label: 'Proposals', desc: 'Review and respond to buyer approach requests.', to: '/view-approach' },
  ];

  return (
    <div className="page-wrapper max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="section-title text-4xl">Trade Dashboard</h1>
        <p className="section-subtitle text-base">Manage your crops and buyer interactions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map(({ icon, label, desc, to }) => (
          <Link
            key={to}
            to={to}
            className="card card-hover p-6 text-center flex flex-col items-center gap-2 no-underline"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-4xl">{icon}</span>
            <p className="font-bold text-base mt-1" style={{ color: 'var(--color-primary-dark)' }}>{label}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
