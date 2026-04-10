import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import { apiGet } from '../lib/api';

const CONTACT_FIELDS = [
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNo', label: 'Phone' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'aadharNo', label: 'Aadhar No' },
];

const LOCATION_FIELDS = [
  { key: 'city', label: 'City' },
  { key: 'district', label: 'District' },
  { key: 'state', label: 'State' },
];

function ProfileField({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="buyer-profile-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function BuyerDetails() {
  const navigate = useNavigate();
  const { buyerId } = useParams();

  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fullName = `${buyer?.firstName || ''} ${buyer?.lastName || ''}`.trim() || buyer?.username || 'Buyer';
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'B';
  const locationLine = [buyer?.city, buyer?.district, buyer?.state].filter(Boolean).join(', ');

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet(`/buyers/${buyerId}`);
        if (!response.ok) throw new Error('Could not load buyer details.');
        const data = await response.json();
        setBuyer(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch buyer details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [buyerId]);

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
          <h3>Buyer Profile</h3>
          <p className="error-text">{error}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="page buyer-profile-page">
      <div className="ag-container">
        <div className="buyer-profile-topbar">
          <button
            type="button"
            className="buyer-profile-back"
            onClick={() => navigate(-1)}
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </button>
        </div>

        <div className="buyer-profile-layout">
          <Card className="buyer-profile-hero">
            <div className="buyer-profile-head">
              <div className="buyer-avatar">{initials}</div>
              <div className="buyer-profile-head__copy">
                <span className="buyer-profile-kicker">Buyer Profile</span>
                <h1>{fullName}</h1>
                <p>{locationLine || 'Buyer location details are available below.'}</p>
              </div>
            </div>

            <div className="buyer-profile-metrics">
              <div className="buyer-profile-metric">
                <span>Username</span>
                <strong>{buyer?.username || 'Not set'}</strong>
              </div>
              <div className="buyer-profile-metric">
                <span>Phone</span>
                <strong>{buyer?.phoneNo || 'Not set'}</strong>
              </div>
              <div className="buyer-profile-metric">
                <span>City</span>
                <strong>{buyer?.city || 'Not set'}</strong>
              </div>
            </div>
          </Card>

          <div className="buyer-profile-grid">
            <Card className="buyer-profile-card">
              <div className="buyer-profile-section-head">
                <h2>Contact Details</h2>
                <p>Identity and communication details shared by the buyer.</p>
              </div>
              <div className="buyer-profile-list">
                {CONTACT_FIELDS.map((item) => (
                  <ProfileField key={item.key} label={item.label} value={buyer?.[item.key]} />
                ))}
              </div>
            </Card>

            <Card className="buyer-profile-card">
              <div className="buyer-profile-section-head">
                <h2>Location Details</h2>
                <p>Region information useful for planning transport and coordination.</p>
              </div>
              <div className="buyer-profile-list">
                {LOCATION_FIELDS.map((item) => (
                  <ProfileField key={item.key} label={item.label} value={buyer?.[item.key]} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
