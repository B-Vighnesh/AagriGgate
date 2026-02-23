import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import { apiGet } from '../lib/api';

const FIELDS = [
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNo', label: 'Phone' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'state', label: 'State' },
  { key: 'district', label: 'District' },
];

export default function BuyerDetails() {
  const { buyerId } = useParams();
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <button className="link-back" onClick={() => navigate(-1)}>Back</button>

        <Card className="buyer-profile-card">
          <div className="buyer-profile-head">
            <div className="buyer-avatar">B</div>
            <div>
              <h1>{buyer?.firstName} {buyer?.lastName}</h1>
              <p>Buyer Profile</p>
            </div>
          </div>

          <div className="buyer-profile-list">
            {FIELDS.map((item) => (
              buyer?.[item.key] ? (
                <div key={item.key} className="buyer-profile-row">
                  <span>{item.label}</span>
                  <strong>{buyer[item.key]}</strong>
                </div>
              ) : null
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
