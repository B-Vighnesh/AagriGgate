import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import { apiGet, apiFetch } from '../lib/api';
import ValidateToken from './ValidateToken';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';

const STATUS_CLASS = {
  pending: 'user-requests-status--pending',
  accepted: 'user-requests-status--accepted',
  rejected: 'user-requests-status--rejected',
};

export default function ViewApproachForUser() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();

  const [approaches, setApproaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 3000);
  };

  useEffect(() => {
    if (!role) {
      navigate('/login');
      return;
    }

    if (role === 'farmer') {
      navigate('/404');
      return;
    }

    const loadApproaches = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiGet(`/buyer/approach/requests/user/${farmerId}`);
        if (!response.ok) throw new Error('Unable to load requests.');
        const data = await response.json();
        setApproaches(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load requests.');
        setApproaches([]);
      } finally {
        setLoading(false);
      }
    };

    loadApproaches();
  }, []);

  const handleWithdraw = async (approachId) => {
    try {
      const response = await apiFetch(`/buyer/approach/delete/${approachId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to withdraw request.');
      setApproaches((prev) => prev.filter((item) => item.approachId !== approachId));
      showToast('Request withdrawn.', 'success');
    } catch (requestError) {
      showToast(requestError.message || 'Server busy. Please try again.', 'error');
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
    <section className="page user-requests-page">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="ag-container">
        <div className="user-requests-head">
          <div>
            <h1>My Requests</h1>
            <p>Track the status of your approach requests to farmers.</p>
          </div>

          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {(error || filteredApproaches.length === 0) && (
          <Card className="user-requests-empty">
            <h3>{error || `No ${filter !== 'All' ? filter.toLowerCase() : ''} requests`}</h3>
            <p>{error ? 'Try again or browse crops to send a new request.' : 'Requests appear here after you approach a farmer.'}</p>
            <Button onClick={() => navigate('/view-all-crops')}>Browse Crops</Button>
          </Card>
        )}

        {!error && filteredApproaches.length > 0 && (
          <div className="user-requests-list">
            {filteredApproaches.map((item) => (
              <Card key={item.approachId} className="user-requests-card">
                <div className="user-requests-card__main">
                  <h3>{item.cropName}</h3>
                  <p>Farmer: <strong>{item.farmerName}</strong></p>
                </div>

                <span className={`user-requests-status ${STATUS_CLASS[(item.status || '').toLowerCase()] || ''}`}>
                  {item.status || 'Pending'}
                </span>

                <div className="user-requests-actions">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/view-details/${item.cropId}`)}>
                    View Crop
                  </Button>

                  {(item.status || '').toLowerCase() === 'pending' && (
                    <Button variant="danger" size="sm" onClick={() => handleWithdraw(item.approachId)}>
                      Withdraw
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
