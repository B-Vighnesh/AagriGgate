import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { getRole } from '../lib/auth';
import { requestJson } from '../lib/api';
import { confirmChatDeal, createOrGetChatConversation, failChatConversation } from '../api/chatApi';

const STATUS_CLASS = {
  pending: 'user-requests-status--pending',
  accepted: 'user-requests-status--accepted',
  rejected: 'user-requests-status--rejected',
  completed: 'user-requests-status--completed',
  failed: 'user-requests-status--failed',
  expired: 'user-requests-status--expired',
};

const STATUS_HINTS = {
  pending: 'Waiting for farmer response',
  accepted: 'Chat active',
  rejected: 'Closed',
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

  const isFarmer = role === 'farmer';
  const statusKey = String(requestDetails?.status || 'pending').toLowerCase();
  const isAccepted = statusKey === 'accepted';
  const isClosed = ['rejected', 'completed', 'failed', 'expired'].includes(statusKey);

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
    if (!requestDetails || !isAccepted) {
      setConversation(null);
      return undefined;
    }

    let active = true;

    (async () => {
      try {
        const summary = await createOrGetChatConversation(requestDetails.approachId);
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
  }, [requestDetails, isAccepted]);

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
      showToast(`Request ${decision === 'accept' ? 'accepted' : 'rejected'} successfully.`, 'success');
    } catch (error) {
      showToast(error.message || 'Unable to update request.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkCompleted = async () => {
    if (!conversation) return;
    setActionLoading('complete');
    try {
      const result = await confirmChatDeal(conversation.conversationId, {
        useRequestedQuantity: true,
        quantity: null,
      });
      if (result?.conversation) {
        setConversation(result.conversation);
      }
      await refreshRequest();
      showToast(result?.message || 'Deal marked complete.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to complete the deal.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkFailed = async () => {
    if (!conversation) return;
    setActionLoading('fail');
    try {
      const updated = await failChatConversation(conversation.conversationId);
      setConversation(updated);
      await refreshRequest();
      showToast('Deal cancelled successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to cancel the deal.', 'error');
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
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            <div className="request-lifecycle-head__status">
              <span className={`user-requests-status ${STATUS_CLASS[statusKey] || ''}`}>
                {requestDetails.status}
              </span>
              <small>{STATUS_HINTS[statusKey] || 'Request lifecycle in progress'}</small>
            </div>
          </div>

          <div className="ntf-detail-content request-detail-content request-lifecycle-content">
            <div className="request-detail-hero request-lifecycle-hero">
              <div className="request-detail-hero__copy">
                <span className="request-detail-hero__eyebrow">Buyer–Farmer Request</span>
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
                  <span>Requested Quantity</span>
                  <strong>{requestDetails.requestedQuantity ?? 'Not set'}</strong>
                </span>
              </div>
            </div>

            <section className="request-lifecycle-panel">
              <div className="request-lifecycle-panel__head">
                <h2>Request Details</h2>
                <p>Only the most important request information is shown here.</p>
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
                  <span>Requested Quantity</span>
                  <strong>{requestDetails.requestedQuantity ?? 'Not set'}</strong>
                </div>
                <div className="request-lifecycle-stat">
                  <span>Status</span>
                  <strong>{requestDetails.status}</strong>
                </div>
                <div className="request-lifecycle-stat">
                  <span>Requested Time</span>
                  <strong>{formatDateTime(requestDetails.requestedAt)}</strong>
                </div>
                {isAccepted && (
                  <div className="request-lifecycle-stat request-lifecycle-stat--highlight">
                    <span>Accepted Time</span>
                    <strong>{formatDateTime(requestDetails.acceptedAt)}</strong>
                  </div>
                )}
                {statusKey === 'rejected' && (
                  <div className="request-lifecycle-stat">
                    <span>Rejected Time</span>
                    <strong>{formatDateTime(requestDetails.rejectedAt)}</strong>
                  </div>
                )}
                <div className="request-lifecycle-stat request-lifecycle-stat--action">
                  <span>Crop</span>
                  <Button size="sm" onClick={() => navigate(`/view-details/${requestDetails.cropId}`)}>
                    View Crop
                  </Button>
                </div>
              </div>
            </section>

            <section className="request-lifecycle-panel">
              <div className="request-lifecycle-panel__head">
                <h2>Actions</h2>
                <p>Available actions change automatically based on your role and the current request state.</p>
              </div>
              <div className="request-lifecycle-actions">
                {isFarmer && statusKey === 'pending' && (
                  <div className="request-lifecycle-action-group">
                    <Button loading={actionLoading === 'accept'} onClick={() => handleFarmerDecision('accept')}>
                      Accept Request
                    </Button>
                    <Button
                      variant="outline"
                      loading={actionLoading === 'reject'}
                      onClick={() => handleFarmerDecision('reject')}
                    >
                      Reject Request
                    </Button>
                  </div>
                )}

                {isAccepted && (
                  <div className="request-lifecycle-action-group">
                    <Button variant="outline" onClick={() => navigate(`/chat?approach=${requestDetails.approachId}`)}>
                      Open Chat
                    </Button>
                    <Button
                      loading={actionLoading === 'complete'}
                      onClick={handleMarkCompleted}
                    >
                      Mark Deal Complete
                    </Button>
                    <Button
                      variant="outline"
                      loading={actionLoading === 'fail'}
                      onClick={handleMarkFailed}
                    >
                      Cancel Deal
                    </Button>
                  </div>
                )}

                {isClosed && (
                  <div className="request-lifecycle-action-group">
                    <Button variant="outline" onClick={() => navigate(`/view-details/${requestDetails.cropId}`)}>
                      View Crop Again
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </Card>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
