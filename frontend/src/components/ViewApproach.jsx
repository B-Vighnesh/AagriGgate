import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiFetch, requestJson } from '../lib/api';
import { getFarmerId, getRole, getToken } from '../lib/auth';

const STATUS_CLASS = {
  pending: 'approach-badge--pending',
  accepted: 'approach-badge--accepted',
  rejected: 'approach-badge--rejected',
};

export default function ViewApproach() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [approaches, setApproaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  const loadApproaches = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await requestJson(`/seller/approach/requests/farmer/${farmerId}`, {
        method: 'GET',
      });
      setApproaches(Array.isArray(data) ? data : []);
    } catch (err) {
      setApproaches([]);
      if (err?.message === 'Request failed with status 404') {
        setError('No requests found.');
      } else {
        setError(err.message || 'Server busy. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!role) {
      navigate('/login');
      return;
    }
    if (role === 'buyer') {
      navigate('/404');
      return;
    }
    loadApproaches();
  }, []);

  const onAction = async (approachId, accept) => {
    const endpoint = accept
      ? `/seller/approach/accept/${approachId}`
      : `/seller/approach/reject/${approachId}`;
    try {
      const response = await apiFetch(endpoint, { method: 'POST' });
      if (!response.ok) throw new Error('Action failed.');
      showToast(accept ? 'Request accepted.' : 'Request rejected.', accept ? 'success' : 'info');
      loadApproaches();
    } catch (err) {
      showToast(err.message || 'Unable to process request.', 'error');
    }
  };

  const onViewBuyer = async (buyerId) => {
    setBuyerLoading(true);
    try {
      const data = await requestJson(`/buyers/me/${buyerId}`, {
        method: 'GET',
      });
      setSelectedBuyer(data);
    } catch (err) {
      showToast(err.message || 'Unable to load buyer details.', 'error');
    } finally {
      setBuyerLoading(false);
    }
  };

  const filteredApproaches = useMemo(() => {
    const matchedApproaches = filter === 'All'
      ? approaches
      : approaches.filter((item) => (item.status || '').toLowerCase() === filter.toLowerCase());

    return [...matchedApproaches].sort((a, b) => Number(b.approachId || 0) - Number(a.approachId || 0));
  }, [approaches, filter]);

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  return (
    <section className="page view-approach-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <div className="view-approach-head">
          <div>
            <h1>Buying Proposals</h1>
            <p>Manage buyer requests for your crops.</p>
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {error ? (
          <Card className="view-approach-empty">
            <h3>{error}</h3>
            <p>When buyers send requests, they will appear here.</p>
          </Card>
        ) : null}

        {!error && filteredApproaches.length === 0 ? (
          <Card className="view-approach-empty">
            <h3>No {filter !== 'All' ? filter.toLowerCase() : ''} requests</h3>
          </Card>
        ) : null}

        <div className="view-approach-list">
          {filteredApproaches.map((item) => (
            <Card key={item.approachId} className="approach-card">
              <div className="approach-card__head">
                <div>
                  <h3>{item.cropName}</h3>
                  <p>Buyer: <strong>{item.userName}</strong></p>
                </div>
                <span className={`approach-badge ${STATUS_CLASS[(item.status || '').toLowerCase()] || ''}`}>
                  {item.status}
                </span>
              </div>

              <div className="approach-actions">
                <Button variant="outline" size="sm" onClick={() => navigate(`/view-details/${item.cropId}`)}>View Crop</Button>
                <Button variant="ghost" size="sm" onClick={() => onViewBuyer(item.userId)}>
                  View Buyer
                </Button>
                {(item.status || '').toLowerCase() === 'pending' ? (
                  <>
                    <Button size="sm" onClick={() => onAction(item.approachId, true)}>Accept</Button>
                    <Button variant="danger" size="sm" onClick={() => onAction(item.approachId, false)}>Reject</Button>
                  </>
                ) : null}
              </div>
            </Card>
          ))}
        </div>

      </div>

      {buyerLoading ? (
        <div className="confirm-overlay">
          <Card className="confirm-card text-center">
            <h3>Loading Buyer Details</h3>
            <p>Please wait while we fetch buyer information.</p>
          </Card>
        </div>
      ) : null}

      {selectedBuyer ? (
        <div className="confirm-overlay" onClick={() => setSelectedBuyer(null)}>
          <Card className="confirm-card" onClick={(event) => event.stopPropagation()}>
            <h3>Buyer Details</h3>
            <p>Details for the selected buyer request.</p>

            <div className="account-info-list">
              <div className="account-info-row">
                <span>Username</span>
                <strong>{selectedBuyer?.username || '-'}</strong>
              </div>
              <div className="account-info-row">
                <span>Name</span>
                <strong>{`${selectedBuyer?.firstName || ''} ${selectedBuyer?.lastName || ''}`.trim() || '-'}</strong>
              </div>
              <div className="account-info-row">
                <span>Email</span>
                <strong>{selectedBuyer?.email || '-'}</strong>
              </div>
              <div className="account-info-row">
                <span>Phone</span>
                <strong>{selectedBuyer?.phoneNo || '-'}</strong>
              </div>
              <div className="account-info-row">
                <span>State</span>
                <strong>{selectedBuyer?.state || '-'}</strong>
              </div>
              <div className="account-info-row">
                <span>District</span>
                <strong>{selectedBuyer?.district || '-'}</strong>
              </div>
            </div>

            <div className="confirm-actions">
              <Button variant="outline" onClick={() => setSelectedBuyer(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
