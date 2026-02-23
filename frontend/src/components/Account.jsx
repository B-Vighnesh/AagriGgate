import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToken, getFarmerId, getRole, clearAuth } from '../lib/auth';
import { apiGet } from '../lib/api';
import ValidateToken from './ValidateToken';
import farmerIcon from '../images/farmer.jpg';
import buyerIcon from '../images/buyer.jpg';

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-base w-6 text-center">{icon}</span>
      <span className="text-xs font-semibold w-28 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{value}</span>
    </div>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!role) { navigate('/login'); return; }
    if (!farmerId || !token) { navigate('/login'); return; }

    const endpoint = role === 'buyer'
      ? `/buyer/getBuyer/${farmerId}`
      : `/users/getFarmer/${farmerId}`;

    apiGet(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error('session_expired');
        return res.json();
      })
      .then((data) => setUserData(data))
      .catch((err) => {
        if (err.message === 'session_expired') setError('Your session has expired. Please log in again.');
        else setError('Server busy. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/logout');
  };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[60vh]">
        <span className="spinner" style={{ color: 'var(--color-primary)', width: '32px', height: '32px', borderWidth: '3px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[60vh]">
        <div className="card p-8 text-center max-w-sm">
          <p className="text-3xl mb-3">{'\u26A0\uFE0F'}</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>
          <button className="btn-primary w-full" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  const isFarmer = role === 'farmer';

  const quickActions = isFarmer
    ? [
      { icon: '\u{1F331}', label: 'Add Crop', to: '/add-crop' },
      { icon: '\u{1F4CB}', label: 'My Crops', to: '/view-crop' },
      { icon: '\u{1F4CA}', label: 'Market', to: '/market' },
      { icon: '\u{1F4E8}', label: 'Requests', to: '/view-approach' },
      { icon: '\u{1F324}\uFE0F', label: 'Weather', to: '/weather' },
      { icon: '\u2709\uFE0F', label: 'Enquiry', to: '/enquiry' },
    ]
    : [
      { icon: '\u{1F33E}', label: 'Browse Crops', to: '/view-all-crops' },
      { icon: '\u{1F4E8}', label: 'My Requests', to: '/view-approaches-user' },
      { icon: '\u2709\uFE0F', label: 'Enquiry', to: '/enquiry' },
    ];

  return (
    <div className="page-wrapper max-w-4xl mx-auto">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={isFarmer ? farmerIcon : buyerIcon}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover shadow-md"
              style={{ border: '3px solid var(--color-primary-light)' }}
            />
            <span
              className="absolute bottom-0 right-0 text-xs badge"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
              {isFarmer ? '\u{1F33E} Farmer' : '\u{1F6D2} Buyer'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--color-primary-dark)' }}>
            {userData?.firstName} {userData?.lastName}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>@{userData?.username}</p>

          <div className="flex gap-2 mt-5 w-full flex-col">
            <Link to="/update-account" className="btn-primary w-full text-sm py-2 text-center">{'\u270F\uFE0F'} Edit Profile</Link>
            <Link to="/settings" className="btn-outline  w-full text-sm py-2 text-center">{'\u2699\uFE0F'} Settings</Link>
            <button className="btn-ghost w-full text-sm py-2" onClick={() => setShowLogoutModal(true)}>
              {'\u{1F6AA}'} Logout
            </button>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="card p-5">
            <h3 className="font-bold mb-3 text-base" style={{ color: 'var(--color-primary-dark)' }}>Account Details</h3>
            <div>
              <InfoRow icon={'\u{1F4E7}'} label="Email" value={userData?.email} />
              <InfoRow icon={'\u{1F4DE}'} label="Phone" value={userData?.phoneNo} />
              <InfoRow icon={'\u{1F5FA}\uFE0F'} label="State" value={userData?.state} />
              <InfoRow icon={'\u{1F4CD}'} label="District" value={userData?.district} />
              <InfoRow icon={'\u{1F382}'} label="DOB" value={userData?.dob} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-3 text-base" style={{ color: 'var(--color-primary-dark)' }}>Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map(({ icon, label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="card card-hover flex flex-col items-center gap-1 p-3 text-center text-xs font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  <span className="text-xl">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <div className="card p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>Confirm Logout</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button className="btn-danger flex-1" onClick={handleLogout}>Yes, Logout</button>
              <button className="btn-outline flex-1" onClick={() => setShowLogoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
