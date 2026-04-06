import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const quickActions = isFarmer
    ? [
      { label: 'Add Crop', to: '/add-crop', note: 'Create a fresh listing and reach buyers faster.' },
      { label: 'My Crops', to: '/view-crop', note: 'Track all current inventory and listing status.' },
      { label: 'Market', to: '/market', note: 'Review mandi prices and AI-style analysis.' },
      { label: 'Requests', to: '/view-approach', note: 'Respond to incoming buyer interest in one place.' },
      { label: 'Weather', to: '/weather', note: 'Check local conditions before harvest or transport.' },
      { label: 'Enquiry', to: '/enquiry', note: 'Reach support when you need a hand.' },
    ]
    : [
      { label: 'Browse Crops', to: '/view-all-crops', note: 'Explore fresh listings from nearby farmers.' },
      { label: 'My Requests', to: '/view-approaches-user', note: 'Follow the crops you have approached so far.' },
      { label: 'Enquiry', to: '/enquiry', note: 'Contact support for account or platform help.' },
    ];

  return (
    <section className="page account-page">
      <ValidateToken token={token} />
      <div className="ag-container account-shell">
        <Card className="account-hero-card">
          <div className="account-hero">
            <div className="account-hero__identity">
              <div className="account-avatar-wrap">
                <img src={isFarmer ? farmerIcon : buyerIcon} alt="Profile" className="account-avatar" />
              </div>
              <div className="account-hero__copy">
                <span className="account-role-badge">{isFarmer ? 'Farmer Dashboard' : 'Buyer Dashboard'}</span>
                <h1>{displayName}</h1>
                <p>@{userData?.username || 'user'}</p>
                <div className="account-hero__meta">
                  <span>{location}</span>
                  <span>{userData?.email || 'Email not added yet'}</span>
                </div>
              </div>
            </div>

            <div className="account-hero__actions">
              <Link to="/update-account" className="ui-btn ui-btn--primary text-center">Edit Profile</Link>
              <Link to="/settings" className="ui-btn ui-btn--outline text-center">Settings</Link>
              <Button variant="danger" onClick={onLogout}>Logout</Button>
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
                <InfoItem label="Date of Birth" value={userData?.dob} />
              </div>
            </Card>

            <Card className="account-panel-card">
              <div className="account-section-head">
                <div>
                  <h3>Quick Actions</h3>
                  <p>Jump into the tools you use most often without hunting through the menu.</p>
                </div>
              </div>
              <div className="quick-actions-grid">
                {quickActions.map((item) => (
                  <Link key={item.to} to={item.to} className="quick-action quick-action--rich">
                    <strong>{item.label}</strong>
                    <span>{item.note}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <div className="account-side-stack">
            <Card className="account-spotlight-card">
              <h3>{isFarmer ? 'Seller Focus' : 'Buyer Focus'}</h3>
              <p>
                {isFarmer
                  ? 'Keep your profile updated so buyers can trust your location, listings, and contact details at a glance.'
                  : 'A complete profile helps farmers respond faster and improves confidence when you send crop requests.'}
              </p>
              <div className="account-highlight-list">
                <span>{userData?.state ? 'State added' : 'Add your state'}</span>
                <span>{userData?.district ? 'District added' : 'Add your district'}</span>
                <span>{userData?.phoneNo ? 'Phone verified in profile' : 'Add your phone number'}</span>
              </div>
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
