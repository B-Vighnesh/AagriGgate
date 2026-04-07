import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Modal from './Modal';
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [actionLoading, setActionLoading] = useState({ approachId: null, type: null });
  const [pendingDecision, setPendingDecision] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  const emptyFilterLabel = filterStatus === 'All' ? '' : `${filterStatus.toLowerCase()} `;

  const loadApproaches = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(page),
        size: '10',
      });
      if (filterStatus !== 'All') {
        params.set('status', filterStatus);
      }

      const data = await requestJson(`/seller/approach/requests/me/${cropId}?${params.toString()}`, {
        method: 'GET',
      });
      setApproaches(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(Number(data?.totalPages || 0));
      setTotalElements(Number(data?.totalElements || 0));
    } catch (loadError) {
      setApproaches([]);
      setTotalPages(0);
      setTotalElements(0);
      if ([204, 400, 404].includes(loadError?.status)) {
        setError('');
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
  }, [farmerId, cropId, role, page, filterStatus]);

  const handleAction = async (approachId, accept) => {
    const endpoint = accept
      ? `/seller/approach/accept/${approachId}`
      : `/seller/approach/reject/${approachId}`;

    try {
      setActionLoading({ approachId, type: accept ? 'accept' : 'reject' });
      const response = await apiFetch(endpoint, { method: 'POST' });
      if (!response.ok) throw new Error('Action failed. Try again.');
      showToast(accept ? 'Request accepted.' : 'Request rejected.', accept ? 'success' : 'info');
      await loadApproaches();
    } catch (requestError) {
      showToast(requestError.message || 'Unable to process request.', 'error');
    } finally {
      setActionLoading({ approachId: null, type: null });
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
      <ValidateToken token={token} role={role} />

      <div className="ag-container">
        <div className="approach-crop-head">
          <div>
            <button className="link-back" onClick={() => navigate(-1)}>Back</button>
            <h1>Crop Requests</h1>
            <p>Manage buyer requests for this crop.</p>
            {!error && approaches.length > 0 ? (
              <p className="view-all-pagination__info">
                Showing {approaches.length} request{approaches.length !== 1 ? 's' : ''}
                {totalElements ? ` | ${totalElements} total` : ''}
              </p>
            ) : null}
          </div>

          <div className="approach-crop-filter">
            <label htmlFor="status-filter">Filter by Status</label>
            <select id="status-filter" value={filterStatus} onChange={(event) => { setPage(0); setFilterStatus(event.target.value); }}>
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

        {!error && approaches.length === 0 ? (
          <Card className="approach-crop-empty">
            <h3>No {emptyFilterLabel}requests</h3>
          </Card>
        ) : null}

        {!error && approaches.length > 0 ? (
          <div className="approach-crop-list">
            {approaches.map((approach) => {
              const status = (approach.status || 'pending').toLowerCase();
              const isPending = status === 'pending';
              const isAccepting = actionLoading.approachId === approach.approachId && actionLoading.type === 'accept';
              const isRejecting = actionLoading.approachId === approach.approachId && actionLoading.type === 'reject';
              const rowBusy = actionLoading.approachId === approach.approachId;

              return (
                <Card key={approach.approachId} className="approach-crop-card">
                  <div className="approach-crop-card__main">
                    <h3>{approach.cropName}</h3>
                    <p>Buyer: <strong>{approach.userName}</strong></p>
                    {approach.requestedQuantity ? <p>Requested: <strong>{approach.requestedQuantity}</strong></p> : null}
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
                        <Button
                          size="sm"
                          onClick={() => setPendingDecision({ approachId: approach.approachId, type: 'accept', step: 1 })}
                          loading={isAccepting}
                          disabled={rowBusy}
                        >
                          {isAccepting ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setPendingDecision({ approachId: approach.approachId, step: 1 })}
                          loading={isRejecting}
                          disabled={rowBusy}
                        >
                          {isRejecting ? 'Rejecting...' : 'Reject'}
                        </Button>
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

      <Modal
        isOpen={pendingDecision?.step === 1}
        title={pendingDecision?.type === 'accept' ? 'Accept Request' : 'Reject Request'}
        message={pendingDecision?.type === 'accept'
          ? 'This buyer request will be accepted for the selected crop.'
          : 'This buyer request will be rejected for the selected crop.'}
        onClose={() => setPendingDecision(null)}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setPendingDecision(null),
        }}
        primaryAction={{
          label: 'Continue',
          onClick: () => setPendingDecision((prev) => prev ? { ...prev, step: 2 } : prev),
        }}
      />
      <Modal
        isOpen={pendingDecision?.step === 2}
        title="Final Confirmation"
        message={pendingDecision?.type === 'accept'
          ? 'Please confirm once more. This request will be marked as accepted.'
          : 'Please confirm once more. This request will be marked as rejected.'}
        onClose={() => setPendingDecision(null)}
        secondaryAction={{
          label: 'Back',
          onClick: () => setPendingDecision((prev) => prev ? { ...prev, step: 1 } : prev),
        }}
        primaryAction={{
          label: pendingDecision?.type === 'accept' ? 'Accept Request' : 'Reject Request',
          onClick: async () => {
            const approachId = pendingDecision?.approachId;
            const accept = pendingDecision?.type === 'accept';
            setPendingDecision(null);
            if (approachId) {
              await handleAction(approachId, accept);
            }
          },
        }}
      />

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
