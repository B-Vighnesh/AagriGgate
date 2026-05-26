import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Card from './common/Card';
import Button from './common/Button';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';
import { requestJson, ApiError } from '../lib/api';
import farmerIcon from '../images/farmer.jpg';
import buyerIcon from '../images/buyer.jpg';

function InfoItem({ label, value }) {
  if (!value) return null;
  return (
    <div className="account-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="account-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDob(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
}

export default function Account() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const role = getRole();
  const token = getToken();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !farmerId || !role) {
      navigate('/login');
      return;
    }

    const endpoint = role === 'buyer'
      ? `/buyers/me`
      : `/farmers/me`;

    let mounted = true;
    (async () => {
      try {
        const data = await requestJson(endpoint, { method: 'GET' });
        if (mounted) setUserData(data);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiError && err.status === 401) {
          setError('Your session expired. Please login again.');
        } else {
          setError(err.message || 'Unable to load account details.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate, farmerId, role, token]);

  const onLogout = () => {
    navigate('/logout');
  };

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page page--center">
        <Card className="narrow-card text-center">
          <h2>Account Error</h2>
          <p className="error-text">{error}</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </Card>
      </section>
    );
  }

  const isFarmer = role === 'farmer';
  const displayName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || userData?.username || 'User';
  const location = [userData?.district, userData?.state].filter(Boolean).join(', ') || 'Location not added yet';
  const formattedDob = formatDob(userData?.dob);
  const completedProfileFields = [
    userData?.state,
    userData?.district,
    userData?.phoneNo,
    userData?.email,
    userData?.aadharNo,
    formattedDob,
  ].filter(Boolean).length;
  const profileCompleteness = Math.round((completedProfileFields / 6) * 100);
  const completenessItems = [
    { label: 'State added', done: Boolean(userData?.state) },
    { label: 'District added', done: Boolean(userData?.district) },
    { label: 'Phone in profile', done: Boolean(userData?.phoneNo) },
    { label: 'Email added', done: Boolean(userData?.email) },
    { label: 'Aadhaar added', done: Boolean(userData?.aadharNo) },
    { label: 'Date of birth added', done: Boolean(formattedDob) },
  ];
  const quickActions = isFarmer
    ? [
      { label: 'Add Crop', to: '/add-crop', note: 'Create a fresh listing', icon: 'fa-seedling' },
      { label: 'My Crops', to: '/view-crop', note: 'Manage inventory', icon: 'fa-list' },
      { label: 'Mandi Prices', to: '/market', note: 'Mandi prices & insights', icon: 'fa-chart-simple' },
      { label: 'Requests', to: '/view-approach', note: 'Incoming buyer interest', icon: 'fa-message' },
      { label: 'Weather', to: '/weather', note: 'Local conditions', icon: 'fa-cloud-sun' },
      { label: 'Support', to: '/enquiry', note: 'Get assistance', icon: 'fa-circle-question' },
    ]
    : [
      { label: 'Browse Crops', to: '/view-all-crops', note: 'Explore fresh listings', icon: 'fa-basket-shopping' },
      { label: 'Mandi Prices', to: '/market', note: 'Mandi prices & insights', icon: 'fa-chart-simple' },
      { label: 'My Requests', to: '/view-approaches-user', note: 'Track active requests', icon: 'fa-message' },
      { label: 'Support', to: '/enquiry', note: 'Get assistance', icon: 'fa-circle-question' },
    ];

  return (
    <section className="page account-page">
      <ValidateToken token={token} />
      <div className="ag-container account-shell">
        <Card className="account-hero-card">
          <div className="account-hero">
            <div className="account-hero__identity">
              <div className="account-avatar-wrap">
                <img src={isFarmer ? farmerIcon : buyerIcon} alt="" className="account-avatar account-avatar--image" />
                <span className="account-avatar__initials">{getInitials(displayName)}</span>
              </div>
              <div className="account-hero__copy">
                <span className="account-role-badge">{isFarmer ? 'Farmer Dashboard' : 'Buyer Dashboard'}</span>
                <h1>{displayName}</h1>
                <p>@{userData?.username || 'user'}</p>
                <div className="account-hero__meta">
                  <span><i className="fa-solid fa-location-dot" aria-hidden="true" />{location}</span>
                  <span><i className="fa-regular fa-envelope" aria-hidden="true" />{userData?.email || 'Email not added yet'}</span>
                </div>
              </div>
            </div>

            <div className="account-hero__actions">
              <Link
                to="/update-account"
                className="account-icon-action account-icon-action--primary"
                aria-label="Edit Profile"
                title="Edit Profile"
              >
                <i className="fa-regular fa-pen-to-square" aria-hidden="true" />
                <span>Edit</span>
              </Link>
              <button
                type="button"
                className="account-icon-action account-icon-action--danger"
                onClick={onLogout}
                aria-label="Logout"
                title="Logout"
              >
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="account-stats-grid">
            <SummaryStat label="Role" value={isFarmer ? 'Seller' : 'Buyer'} />
            <SummaryStat label="Username" value={userData?.username || 'Pending'} />
            <SummaryStat label="District" value={userData?.district || 'Not set'} />
            <SummaryStat label="Phone" value={userData?.phoneNo || 'Not set'} />
          </div>
        </Card>

        <div className="account-grid">
          <div className="account-content">
            <Card className="account-panel-card">
              <div className="account-section-head">
                <div>
                  <h3>Quick Actions</h3>
                  <p>Jump into the tools you use most often.</p>
                </div>
              </div>
              <div className="quick-actions-grid">
                {quickActions.map((item) => (
                  <Link key={item.to} to={item.to} className="quick-action quick-action--rich">
                    <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                    <strong>{item.label}</strong>
                    <span>{item.note}</span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="account-panel-card">
              <div className="account-section-head">
                <div>
                  <h3>Account Details</h3>
                  <p>Your profile information that helps keep trade and communication smooth.</p>
                </div>
              </div>
              <div className="account-info-list">
                <InfoItem label="Username" value={userData?.username} />
                <InfoItem label="Email" value={userData?.email} />
                <InfoItem label="Phone" value={userData?.phoneNo} />
                <InfoItem label="State" value={userData?.state} />
                <InfoItem label="District" value={userData?.district} />
                <InfoItem label="Aadhaar" value={userData?.aadharNo} />
                <InfoItem label="Date of Birth" value={formattedDob} />
              </div>
            </Card>
          </div>

          <div className="account-side-stack">
            <Card className="account-spotlight-card account-completeness-card">
              <h3>Profile Completeness</h3>
              <p>{completedProfileFields} of 6 fields filled</p>
              <div className="account-completeness-bar" aria-hidden="true">
                <span style={{ width: `${profileCompleteness}%` }} />
              </div>
              <div className="account-completeness-list">
                {completenessItems.map((item) => (
                  <span key={item.label} className={item.done ? 'is-complete' : ''}>
                    <i className={`fa-${item.done ? 'solid' : 'regular'} fa-circle-check`} aria-hidden="true" />
                    {item.label}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="account-spotlight-card account-spotlight-card--soft">
              <h3>Settings</h3>
              <p>Manage your password, account preferences, and security settings from one focused place.</p>
              <Link to="/settings" className="account-settings-tile">
                <span className="account-settings-tile__icon" aria-hidden="true">
                  <i className="fa-solid fa-gear" />
                </span>
                <span className="account-settings-tile__copy">
                  <strong>Open Settings</strong>
                  <small>Update your security and preferences</small>
                </span>
              </Link>
            </Card>

            <Card className="account-spotlight-card account-spotlight-card--soft">
              <h3>Next Best Step</h3>
              <p>
                {isFarmer
                  ? 'List a new crop or review incoming requests to keep your marketplace activity moving.'
                  : 'Browse crops and track your active requests to stay on top of the deals you care about.'}
              </p>
              <Link
                to={isFarmer ? '/add-crop' : '/view-all-crops'}
                className="ui-btn ui-btn--primary text-center full-width"
              >
                {isFarmer ? 'Add New Crop' : 'Browse Crops'}
              </Link>
              
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
