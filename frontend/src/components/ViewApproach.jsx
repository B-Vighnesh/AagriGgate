import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Modal from './Modal';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiFetch, requestJson } from '../lib/api';
import { createOrGetChatConversation } from '../api/chatApi';
import { getFarmerId, getRole, getToken } from '../lib/auth';

const STATUS_CLASS = {
  pending: 'approach-badge--pending',
  accepted: 'approach-badge--accepted',
  rejected: 'approach-badge--rejected',
  completed: 'approach-badge--completed',
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [actionLoading, setActionLoading] = useState({ approachId: null, type: null });
  const [pendingDecision, setPendingDecision] = useState(null);
  const [chatLoadingId, setChatLoadingId] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  const emptyFilterLabel = filter === 'All' ? 'buyer' : filter.toLowerCase();

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

      const data = await requestJson(`/seller/approach/requests/me?${params.toString()}`, {
        method: 'GET',
      });
      setApproaches(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(Number(data?.totalPages || 0));
      setTotalElements(Number(data?.totalElements || 0));
    } catch (err) {
      setApproaches([]);
      setTotalPages(0);
      setTotalElements(0);
      if ([204, 400, 404].includes(err?.status)) {
        setError('');
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
  }, [page, filter]);

  const onAction = async (approachId, accept) => {
    const endpoint = accept
      ? `/seller/approach/accept/${approachId}`
      : `/seller/approach/reject/${approachId}`;
    try {
      setActionLoading({ approachId, type: accept ? 'accept' : 'reject' });
      const response = await apiFetch(endpoint, { method: 'POST' });
      if (!response.ok) throw new Error('Action failed.');
      showToast(accept ? 'Request accepted.' : 'Request rejected.', accept ? 'success' : 'info');
      await loadApproaches();
    } catch (err) {
      showToast(err.message || 'Unable to process request.', 'error');
    } finally {
      setActionLoading({ approachId: null, type: null });
    }
  };

  const onViewBuyer = (buyerId) => {
    navigate(`/view-buyer/${buyerId}`);
  };

  const openChat = async (approachId) => {
    try {
      setChatLoadingId(approachId);
      const conversation = await createOrGetChatConversation(approachId);
      navigate(`/chat/${conversation.conversationId}`);
    } catch (err) {
      showToast(err.message || 'Unable to open chat right now.', 'error');
    } finally {
      setChatLoadingId(null);
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
    <section className="page view-approach-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <div className="view-approach-head">
          <div>
            <h1>Buying Proposals</h1>
            <p>Manage buyer requests for your crops.</p>
            {!error && approaches.length > 0 ? (
              <p className="view-all-pagination__info">
                Showing {approaches.length} request{approaches.length !== 1 ? 's' : ''}
                {totalElements ? ` | ${totalElements} total` : ''}
              </p>
            ) : null}
          </div>
          <select value={filter} onChange={(event) => { setPage(0); setFilter(event.target.value); }}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {error ? (
          <Card className="view-approach-empty">
            <h3>{error}</h3>
            <p>We could not load buyer requests right now.</p>
            <p>Please refresh this page in a moment. If the issue continues, check whether the backend is running and your session is still valid.</p>
            <Button variant="outline" onClick={loadApproaches}>Try Again</Button>
          </Card>
        ) : null}

        {!error && approaches.length === 0 ? (
          <Card className="view-approach-empty">
            <h3>No {emptyFilterLabel} requests</h3>
            <p>Requests from buyers will appear here after they approach one of your crops.</p>
            <p>Once a request arrives, you can review the buyer details, open the crop listing, and accept or reject the proposal from this page.</p>
            <div className="confirm-actions">
              <Button variant="outline" onClick={() => navigate('/view-crop')}>View My Crops</Button>
              <Button onClick={loadApproaches}>Refresh</Button>
            </div>
          </Card>
        ) : null}

        <div className="view-approach-list">
          {approaches.map((item) => (
            <Card key={item.approachId} className="approach-card">
              {(() => {
                const isAccepting = actionLoading.approachId === item.approachId && actionLoading.type === 'accept';
                const isRejecting = actionLoading.approachId === item.approachId && actionLoading.type === 'reject';
                const rowBusy = actionLoading.approachId === item.approachId;

                return (
                  <>
              <div className="approach-card__head">
                <div>
                  <h3>{item.cropName}</h3>
                  <p>Buyer: <strong>{item.userName}</strong></p>
                  {item.requestedQuantity ? <p>Requested: <strong>{item.requestedQuantity}</strong></p> : null}
                </div>
                <span className={`approach-badge ${STATUS_CLASS[(item.status || '').toLowerCase()] || ''}`}>
                  {item.status}
                </span>
              </div>

              <div className="approach-actions">
                <Button variant="outline" size="sm" onClick={() => navigate(`/requests/${item.approachId}`)}>
                  Request Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/view-details/${item.cropId}`)}>View Crop</Button>
                <Button variant="ghost" size="sm" onClick={() => onViewBuyer(item.userId)}>
                  View Buyer
                </Button>
                {(item.status || '').toLowerCase() === 'accepted' || (item.status || '').toLowerCase() === 'completed' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="chat-launch-btn"
                    onClick={() => openChat(item.approachId)}
                    loading={chatLoadingId === item.approachId}
                    disabled={chatLoadingId !== null}
                  >
                    {chatLoadingId === item.approachId ? 'Opening Chat...' : 'Open Chat'}
                  </Button>
                ) : null}
                {(item.status || '').toLowerCase() === 'pending' ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setPendingDecision({ approachId: item.approachId, type: 'accept', step: 1 })}
                      loading={isAccepting}
                      disabled={rowBusy}
                    >
                      {isAccepting ? 'Accepting...' : 'Accept'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setPendingDecision({ approachId: item.approachId, step: 1 })}
                      loading={isRejecting}
                      disabled={rowBusy}
                    >
                      {isRejecting ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </>
                ) : null}
              </div>
                  </>
                );
              })()}
            </Card>
          ))}
        </div>

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
          ? 'This buyer request will be accepted for this crop.'
          : 'This buyer request will be rejected for this crop.'}
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
              await onAction(approachId, accept);
            }
          },
        }}
      />

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
