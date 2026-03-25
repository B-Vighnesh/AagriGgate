import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiFetch, requestJson } from '../lib/api';
import { getRole, getToken } from '../lib/auth';

const STATUS_CLASS = {
  pending: 'approach-crop-status--pending',
  accepted: 'approach-crop-status--accepted',
  rejected: 'approach-crop-status--rejected',
};

export default function ViewApproachByFarmerAndCrop() {
  const { farmerId, cropId } = useParams();
  const navigate = useNavigate();

  const token = getToken();
  const role = getRole();

  const [approaches, setApproaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  const loadApproaches = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await requestJson(`/seller/approach/requests/farmer/${farmerId}/${cropId}`, {
        method: 'GET',
      });
      setApproaches(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setApproaches([]);
      if (loadError?.message === 'Request failed with status 404') {
        setError('No approach records found for this crop.');
      } else {
        setError(loadError.message || 'Unable to load requests.');
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

    if (!farmerId || !cropId) {
      setLoading(false);
      setError('Farmer ID or Crop ID is missing.');
      return;
    }

    loadApproaches();
  }, [farmerId, cropId, role]);

  const filteredApproaches = useMemo(() => {
    if (filterStatus === 'All') return approaches;
    return approaches.filter((approach) => (approach.status || '').toLowerCase() === filterStatus.toLowerCase());
  }, [approaches, filterStatus]);

  const handleAction = async (approachId, accept) => {
    const endpoint = accept
      ? `/seller/approach/accept/${approachId}`
      : `/seller/approach/reject/${approachId}`;

    try {
      const response = await apiFetch(endpoint, { method: 'POST' });
      if (!response.ok) throw new Error('Action failed. Try again.');
      showToast(accept ? 'Request accepted.' : 'Request rejected.', accept ? 'success' : 'info');
      loadApproaches();
    } catch (requestError) {
      showToast(requestError.message || 'Unable to process request.', 'error');
    }
  };

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  return (
    <section className="page approach-crop-page">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="ag-container">
        <div className="approach-crop-head">
          <div>
            <button className="link-back" onClick={() => navigate(-1)}>Back</button>
            <h1>Crop Requests</h1>
            <p>Manage buyer requests for this crop.</p>
          </div>

          <div className="approach-crop-filter">
            <label htmlFor="status-filter">Filter by Status</label>
            <select id="status-filter" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {error ? (
          <Card className="approach-crop-empty">
            <h3>{error}</h3>
            <p>Requests will appear here when buyers approach this crop.</p>
          </Card>
        ) : null}

        {!error && filteredApproaches.length === 0 ? (
          <Card className="approach-crop-empty">
            <h3>No {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} requests</h3>
          </Card>
        ) : null}

        {!error && filteredApproaches.length > 0 ? (
          <div className="approach-crop-list">
            {filteredApproaches.map((approach) => {
              const status = (approach.status || 'pending').toLowerCase();
              const isPending = status === 'pending';

              return (
                <Card key={approach.approachId} className="approach-crop-card">
                  <div className="approach-crop-card__main">
                    <h3>{approach.cropName}</h3>
                    <p>Buyer: <strong>{approach.userName}</strong></p>
                  </div>

                  <span className={`approach-crop-status ${STATUS_CLASS[status] || ''}`}>
                    {approach.status || 'Pending'}
                  </span>

                  <div className="approach-crop-actions">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/view-details/${approach.cropId}`)}>
                      View Crop
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/view-buyer/${approach.userId}`)}>
                      View Buyer
                    </Button>

                    {isPending ? (
                      <>
                        <Button size="sm" onClick={() => handleAction(approach.approachId, true)}>Accept</Button>
                        <Button variant="danger" size="sm" onClick={() => handleAction(approach.approachId, false)}>Reject</Button>
                      </>
                    ) : (
                      <span className="approach-crop-done">Action completed</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
