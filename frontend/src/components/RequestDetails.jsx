import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { getRole } from '../lib/auth';
import { apiFetch, requestJson } from '../lib/api';
import { createOrGetChatConversation, getChatConversationByApproach } from '../api/chatApi';
import Modal from './Modal';

const STATUS_CLASS = {
  pending: 'request-lifecycle-status--pending',
  active: 'request-lifecycle-status--active',
  accepted: 'request-lifecycle-status--active',
  completed: 'request-lifecycle-status--completed',
  failed: 'request-lifecycle-status--failed',
  expired: 'request-lifecycle-status--expired',
};

const STATUS_HINTS = {
  pending: 'Waiting for farmer response',
  active: 'Chat active',
  accepted: 'Chat active',
  completed: 'Deal successful',
  failed: 'Cancelled',
  expired: 'Auto closed due to inactivity',
};

function formatDateTime(value) {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not yet';
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RequestDetails() {
  const { approachId } = useParams();
  const navigate = useNavigate();
  const role = getRole();

  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [conversation, setConversation] = useState(null);
  const [withdrawLoading, setWithdrawLoading] = useState(null);
  const [pendingWithdraw, setPendingWithdraw] = useState(null);

  const isFarmer = role === 'farmer';
  const conversationStatusKey = String(conversation?.status || '').toLowerCase();
  const requestStatusKey = String(requestDetails?.status || 'pending').toLowerCase();
  const fallbackStatusKey = requestStatusKey === 'accepted'
    ? 'active'
    : requestStatusKey === 'rejected'
      ? 'failed'
      : requestStatusKey;
  const statusKey = conversationStatusKey || fallbackStatusKey;
  const statusLabel = statusKey === 'accepted' ? 'ACTIVE' : statusKey.toUpperCase();
  const canOpenChat = statusKey === 'active' || statusKey === 'accepted';

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const path = isFarmer
          ? `/seller/approach/requests/${approachId}`
          : `/buyer/approach/requests/${approachId}`;
        const data = await requestJson(path, { method: 'GET' });
        if (!active) return;
        setRequestDetails(data || null);
      } catch (error) {
        if (!active) return;
        setToast({ message: error.message || 'Unable to load request details.', type: 'error' });
        setRequestDetails(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [approachId, isFarmer]);

  useEffect(() => {
    if (!requestDetails || requestStatusKey !== 'accepted') {
      setConversation(null);
      return undefined;
    }

    let active = true;

    (async () => {
      try {
        let summary = null;
        try {
          summary = await getChatConversationByApproach(requestDetails.approachId);
        } catch (error) {
          if (error?.status !== 404) {
            throw error;
          }
          summary = await createOrGetChatConversation(requestDetails.approachId);
        }
        if (!active) return;
        setConversation(summary);
      } catch (error) {
        if (!active) return;
        setToast({ message: error.message || 'Unable to load request chat.', type: 'error' });
      }
    })();

    return () => {
      active = false;
    };
  }, [requestDetails, requestStatusKey]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  const refreshRequest = async () => {
    const path = isFarmer
      ? `/seller/approach/requests/${approachId}`
      : `/buyer/approach/requests/${approachId}`;
    const data = await requestJson(path, { method: 'GET' });
    setRequestDetails(data || null);
  };

  const handleFarmerDecision = async (decision) => {
    setActionLoading(decision);
    try {
      await requestJson(`/seller/approach/${decision}/${approachId}`, { method: 'POST' });
      await refreshRequest();
      window.dispatchEvent(new CustomEvent('requests:count-updated'));
      showToast(`Request ${decision === 'accept' ? 'accepted' : 'rejected'} successfully.`, 'success');
    } catch (error) {
      showToast(error.message || 'Unable to update request.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleWithdraw = async (targetApproachId) => {
    try {
      setWithdrawLoading(targetApproachId);
      const response = await apiFetch(`/buyer/approach/delete/${targetApproachId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to withdraw request.');
      window.dispatchEvent(new CustomEvent('requests:count-updated'));
      showToast('Request withdrawn.', 'success');
      navigate('/view-approaches-user');
    } catch (error) {
      showToast(error.message || 'Unable to withdraw request.', 'error');
    } finally {
      setWithdrawLoading(null);
    }
  };

  const handleOpenChat = async () => {
    if (conversation?.conversationId) {
      navigate(`/chat/${conversation.conversationId}`);
      return;
    }
    if (requestStatusKey !== 'accepted') {
      showToast('Chat is available after the request is accepted.', 'info');
      return;
    }

    setActionLoading('chat');
    try {
      const summary = await createOrGetChatConversation(requestDetails.approachId);
      setConversation(summary);
      navigate(`/chat/${summary.conversationId}`);
    } catch (error) {
      showToast(error.message || 'Unable to open chat right now.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  if (!requestDetails) {
    return (
      <section className="page ntf-detail-page">
        <div className="ag-container ntf-detail-wrap">
          <Card className="ntf-detail-card ntf-detail-card--empty">
            <h1>Request not found</h1>
            <p>This request may have been deleted or is no longer available for your account.</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </Card>
        </div>
        <Toast message={toast.message} type={toast.type} />
      </section>
    );
  }

  return (
    <section className="page ntf-detail-page request-lifecycle-page">
      <div className="ag-container ntf-detail-wrap">
        <Card className="ntf-detail-card request-detail-card request-lifecycle-card">
          <div className="ntf-detail-head request-lifecycle-head">
            <button
              type="button"
              className="chat-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              title="Go back"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <div className="request-lifecycle-head__status">
              <span className={`request-lifecycle-status ${STATUS_CLASS[statusKey] || ''}`}>
                {statusLabel}
              </span>
              <small>{STATUS_HINTS[statusKey] || 'Request lifecycle in progress'}</small>
            </div>
          </div>

          <div className="ntf-detail-content request-detail-content request-lifecycle-content">
            <div className="request-detail-hero request-lifecycle-hero">
              <div className="request-detail-hero__copy">
                <span className="request-detail-hero__eyebrow">Buyer-Farmer Request</span>
                <h1>{requestDetails.cropName}</h1>
                <p>
                  View only the key request information for this request.
                </p>
                <div className="request-detail-hero__meta">
                  <span className="request-detail-hero__meta-pill">
                    {isFarmer ? 'Seller view' : 'Buyer view'}
                  </span>
                  <span className="request-detail-hero__meta-pill">
                    {STATUS_HINTS[statusKey] || 'Request lifecycle in progress'}
                  </span>
                </div>
              </div>

              <div className="request-detail-hero__chips">
                <span className="request-detail-chip">
                  <span>Request ID</span>
                  <strong>#{requestDetails.approachId}</strong>
                </span>
                <span className="request-detail-chip">
                  <span>Quantity</span>
                  <strong>{requestDetails.requestedQuantity ?? 'Not set'}</strong>
                </span>
              </div>
            </div>

            <div className="request-lifecycle-panels">
              <section className="request-lifecycle-panel request-lifecycle-panel--details">
                <div className="request-lifecycle-panel__head">
                  <h2>Request Details</h2>
                  <p>Most important fields only</p>
                </div>
                <div className="request-lifecycle-stats request-lifecycle-stats--compact">
                  <div className="request-lifecycle-stat">
                    <span>Request ID</span>
                    <strong>#{requestDetails.approachId}</strong>
                  </div>
                  <div className="request-lifecycle-stat">
                    <span>Crop Name</span>
                    <strong>{requestDetails.cropName}</strong>
                  </div>
                  <div className="request-lifecycle-stat">
                    <span>Quantity</span>
                    <strong>{requestDetails.requestedQuantity ?? 'Not set'}</strong>
                  </div>
                  <div className="request-lifecycle-stat">
                    <span>Status</span>
                    <strong>{statusLabel}</strong>
                  </div>
                  <div className="request-lifecycle-stat">
                    <span>Requested</span>
                    <strong>{formatDateTime(requestDetails.requestedAt)}</strong>
                  </div>
                  {requestStatusKey === 'accepted' && (
                    <div className="request-lifecycle-stat request-lifecycle-stat--highlight">
                      <span>Accepted</span>
                      <strong>{formatDateTime(requestDetails.acceptedAt)}</strong>
                    </div>
                  )}
                  {requestStatusKey === 'rejected' && (
                    <div className="request-lifecycle-stat request-lifecycle-stat--highlight">
                      <span>Rejected</span>
                      <strong>{formatDateTime(requestDetails.rejectedAt)}</strong>
                    </div>
                  )}
                </div>
              </section>

              <section className="request-lifecycle-panel request-lifecycle-panel--conversation">
                <div className="request-lifecycle-panel__head">
                  <h2>Actions</h2>
                  <p>Manage this request from here</p>
                </div>
                <div className="request-lifecycle-actions">
                  <div className="request-lifecycle-action-group">
                    <Button
                      size="sm"
                      className="request-lifecycle-crop-link request-lifecycle-action"
                      onClick={() => navigate(`/view-details/${requestDetails.cropId}`)}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      View Crop
                    </Button>
                  </div>

                  {isFarmer && statusKey === 'pending' && (
                    <div className="request-lifecycle-action-group">
                      <Button
                        className="request-lifecycle-action request-lifecycle-action--accept"
                        loading={actionLoading === 'accept'}
                        onClick={() => handleFarmerDecision('accept')}
                      >
                        Accept Request
                      </Button>
                      <Button
                        variant="danger"
                        className="request-lifecycle-action request-lifecycle-action--danger"
                        loading={actionLoading === 'reject'}
                        onClick={() => handleFarmerDecision('reject')}
                      >
                        Reject Request
                      </Button>
                    </div>
                  )}

                  {!isFarmer && statusKey === 'pending' && (
                    <div className="request-lifecycle-action-group">
                      <Button
                        variant="danger"
                        className="request-lifecycle-action request-lifecycle-action--danger"
                        loading={withdrawLoading === requestDetails.approachId}
                        disabled={withdrawLoading !== null}
                        onClick={() => setPendingWithdraw({ approachId: requestDetails.approachId, step: 1 })}
                      >
                        {withdrawLoading === requestDetails.approachId ? 'Withdrawing...' : 'Withdraw'}
                      </Button>
                    </div>
                  )}

                  {canOpenChat && (
                    <div className="request-lifecycle-action-group">
                      <Button
                        variant="outline"
                        className="request-lifecycle-action request-lifecycle-action--chat"
                        onClick={handleOpenChat}
                        loading={actionLoading === 'chat'}
                      >
                        Open Chat
                        <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </Card>
      </div>
      <Modal
        isOpen={pendingWithdraw?.step === 1}
        title="Withdraw Request"
        message="This pending request will be withdrawn from the farmer."
        onClose={() => setPendingWithdraw(null)}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setPendingWithdraw(null),
        }}
        primaryAction={{
          label: 'Continue',
          onClick: () => setPendingWithdraw((prev) => prev ? { ...prev, step: 2 } : prev),
        }}
      />
      <Modal
        isOpen={pendingWithdraw?.step === 2}
        title="Final Confirmation"
        message="Please confirm once more. This request will be permanently withdrawn."
        onClose={() => setPendingWithdraw(null)}
        secondaryAction={{
          label: 'Back',
          onClick: () => setPendingWithdraw((prev) => prev ? { ...prev, step: 1 } : prev),
        }}
        primaryAction={{
          label: 'Withdraw Request',
          onClick: async () => {
            const targetApproachId = pendingWithdraw?.approachId;
            setPendingWithdraw(null);
            if (targetApproachId) {
              await handleWithdraw(targetApproachId);
            }
          },
        }}
      />
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
