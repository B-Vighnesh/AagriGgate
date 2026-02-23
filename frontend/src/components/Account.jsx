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
      ? `/buyer/getBuyer/${farmerId}`
      : `/users/getFarmer/${farmerId}`;

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
  const quickActions = isFarmer
    ? [
      { label: 'Add Crop', to: '/add-crop' },
      { label: 'My Crops', to: '/view-crop' },
      { label: 'Market', to: '/market' },
      { label: 'Requests', to: '/view-approach' },
      { label: 'Weather', to: '/weather' },
      { label: 'Enquiry', to: '/enquiry' },
    ]
    : [
      { label: 'Browse Crops', to: '/view-all-crops' },
      { label: 'My Requests', to: '/view-approaches-user' },
      { label: 'Enquiry', to: '/enquiry' },
    ];

  return (
    <section className="page account-page">
      <ValidateToken token={token} />
      <div className="ag-container account-grid">
        <Card className="account-profile-card">
          <img src={isFarmer ? farmerIcon : buyerIcon} alt="Profile" className="account-avatar" />
          <h2>{userData?.firstName} {userData?.lastName}</h2>
          <p>@{userData?.username || 'user'}</p>
          <div className="account-actions">
            <Link to="/update-account" className="ui-btn ui-btn--primary full-width text-center">Edit Profile</Link>
            <Link to="/settings" className="ui-btn ui-btn--outline full-width text-center">Settings</Link>
            <Button variant="danger" className="full-width" onClick={onLogout}>Logout</Button>
          </div>
        </Card>

        <div className="account-content">
          <Card>
            <h3>Account Details</h3>
            <div className="account-info-list">
              <InfoItem label="Email" value={userData?.email} />
              <InfoItem label="Phone" value={userData?.phoneNo} />
              <InfoItem label="State" value={userData?.state} />
              <InfoItem label="District" value={userData?.district} />
              <InfoItem label="Date of Birth" value={userData?.dob} />
            </div>
          </Card>

          <Card>
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              {quickActions.map((item) => (
                <Link key={item.to} to={item.to} className="quick-action">
                  {item.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
