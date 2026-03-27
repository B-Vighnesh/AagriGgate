import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getFarmerId, getRole } from '../lib/auth';
import { apiFetch, requestJson } from '../lib/api';
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
        const params = new URLSearchParams({
          page: String(page),
          size: '10',
        });
        if (filter !== 'All') {
          params.set('status', filter);
        }

        const data = await requestJson(`/buyer/approach/requests/me?${params.toString()}`, {
          method: 'GET',
        });
        setApproaches(Array.isArray(data?.content) ? data.content : []);
        setTotalPages(Number(data?.totalPages || 0));
      } catch (loadError) {
        setApproaches([]);
        setTotalPages(0);
        if ([204, 400, 404].includes(loadError?.status)) {
          setError('');
        } else {
          setError(loadError.message || 'Unable to load requests.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadApproaches();
  }, [page, filter]);

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

          <select value={filter} onChange={(event) => { setPage(0); setFilter(event.target.value); }}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {(error || approaches.length === 0) && (
          <Card className="user-requests-empty">
            <h3>{error || `No ${filter !== 'All' ? filter.toLowerCase() : 'approach'} requests yet`}</h3>
            <p>
              {error
                ? 'We could not load your requests right now. Please try again or browse crops to send a new request.'
                : 'Your requests to farmers will appear here once you approach a crop listing.'}
            </p>
            {!error && (
              <p>
                You can come back here anytime to track whether a farmer has accepted, rejected, or is still reviewing your request.
              </p>
            )}
            <div className="confirm-actions">
              <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
              <Button onClick={() => navigate('/view-all-crops')}>Browse Crops</Button>
            </div>
          </Card>
        )}

        {!error && approaches.length > 0 && (
          <div className="user-requests-list">
            {approaches.map((item) => (
              <Card key={item.approachId} className="user-requests-card">
                <div className="user-requests-card__main">
                  <h3>{item.cropName}</h3>
                  <p>Farmer: <strong>{item.farmerName}</strong></p>
                  {item.requestedQuantity ? <p>Requested: <strong>{item.requestedQuantity}</strong></p> : null}
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

        {!loading && !error && totalPages > 1 ? (
          <div className="view-all-pagination">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="view-all-pagination__info">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
