import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { getFarmerId, getRole } from '../lib/auth';
import { requestJson } from '../lib/api';
import {
  confirmChatDeal,
  createOrGetChatConversation,
  failChatConversation,
  getChatMessages,
  openChatSocket,
} from '../api/chatApi';

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

function formatMessageTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function RequestDetails() {
  const { approachId } = useParams();
  const navigate = useNavigate();
  const role = getRole();
  const currentUserId = Number(getFarmerId() || 0);

  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [composer, setComposer] = useState('');
  const [socketReady, setSocketReady] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

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
      setMessages([]);
      return undefined;
    }

    let active = true;
    setMessagesLoading(true);

    (async () => {
      try {
        const summary = await createOrGetChatConversation(requestDetails.approachId);
        if (!active) return;
        setConversation(summary);

        const history = await getChatMessages(summary.conversationId);
        if (!active) return;
        setMessages(Array.isArray(history) ? history : []);
      } catch (error) {
        if (!active) return;
        setToast({ message: error.message || 'Unable to load request chat.', type: 'error' });
      } finally {
        if (active) setMessagesLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [requestDetails, isAccepted]);

  useEffect(() => {
    if (!conversation) return undefined;

    try {
      const socket = openChatSocket({
        onOpen: () => setSocketReady(true),
        onClose: () => setSocketReady(false),
        onError: () => setSocketReady(false),
        onMessage: (payload) => {
          if (payload?.type === 'CHAT_MESSAGE' && payload.data?.conversationId === conversation.conversationId) {
            setMessages((prev) => (
              prev.some((item) => item.messageId === payload.data.messageId)
                ? prev
                : [...prev, payload.data]
            ));
          }
          if (payload?.type === 'CONVERSATION_UPDATE' && payload.data?.conversationId === conversation.conversationId) {
            setConversation(payload.data);
          }
        },
      });
      socketRef.current = socket;
      return () => {
        socket.close();
        socketRef.current = null;
      };
    } catch (error) {
      setToast({ message: error.message || 'Unable to connect request chat.', type: 'error' });
      return undefined;
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const counterpartLabel = isFarmer ? 'Buyer' : 'Farmer';
  const counterpartName = isFarmer ? requestDetails?.userName : requestDetails?.farmerName;
  const counterpartPhone = isFarmer ? requestDetails?.userPhoneNo : requestDetails?.farmerPhoneNo;
  const counterpartEmail = isFarmer ? requestDetails?.userEmail : requestDetails?.farmerEmail;
  const buyerProfilePath = isFarmer && requestDetails?.userId ? `/view-buyer/${requestDetails.userId}` : null;
  const activeTimelineCount = timelineItemsWithValuesCount(requestDetails);

  const timelineItems = useMemo(() => ([
    { label: 'Requested At', value: requestDetails?.requestedAt },
    { label: 'Accepted At', value: requestDetails?.acceptedAt },
    { label: 'Rejected At', value: requestDetails?.rejectedAt },
    { label: 'Last Message At', value: requestDetails?.lastMessageAt },
    { label: 'Notified At', value: requestDetails?.notifiedAt },
    { label: 'Completed At', value: requestDetails?.completedAt },
    { label: 'Failed At', value: requestDetails?.failedAt },
    { label: 'Expired At', value: requestDetails?.expiredAt },
  ]), [requestDetails]);

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

  const handleSend = () => {
    if (!conversation || !composer.trim()) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      showToast('Chat connection is not ready yet.', 'error');
      return;
    }
    socketRef.current.send(JSON.stringify({
      conversationId: conversation.conversationId,
      messageText: composer.trim(),
    }));
    setComposer('');
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
                  Track the full lifecycle of this request, from the initial approach to chat activity,
                  inactivity notices, and final outcome.
                </p>
                <div className="request-detail-hero__meta">
                  <span className="request-detail-hero__meta-pill">
                    {isFarmer ? 'Seller view' : 'Buyer view'}
                  </span>
                  <span className="request-detail-hero__meta-pill">
                    {activeTimelineCount} lifecycle updates recorded
                  </span>
                  <span className="request-detail-hero__meta-pill">
                    {isAccepted ? (socketReady ? 'Chat connected' : 'Chat opening') : STATUS_HINTS[statusKey] || 'Request lifecycle in progress'}
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
                <span className="request-detail-chip">
                  <span>{counterpartLabel}</span>
                  <strong>{counterpartName || 'Not available'}</strong>
                </span>
              </div>
            </div>

            <div className="request-lifecycle-grid">
              <section className="request-lifecycle-panel">
                <div className="request-lifecycle-panel__head">
                  <h2>Basic Information</h2>
                  <p>Core request details and current state.</p>
                </div>
                <div className="request-lifecycle-stats">
                  <div className="request-lifecycle-stat">
                    <span>Crop Name</span>
                    <strong>{requestDetails.cropName}</strong>
                    <small>Primary crop linked to this buyer-farmer request.</small>
                  </div>
                  <div className="request-lifecycle-stat">
                    <span>Requested Quantity</span>
                    <strong>{requestDetails.requestedQuantity ?? 'Not set'}</strong>
                    <small>The quantity originally requested when the approach was created.</small>
                  </div>
                  <div className="request-lifecycle-stat">
                    <span>Current Status</span>
                    <strong>{requestDetails.status}</strong>
                    <small>{STATUS_HINTS[statusKey] || 'Request lifecycle in progress'}</small>
                  </div>
                  <div className="request-lifecycle-stat request-lifecycle-stat--action">
                    <span>Crop Redirect</span>
                    <Button size="sm" onClick={() => navigate(`/view-details/${requestDetails.cropId}`)}>
                      View Crop
                    </Button>
                    <small>Open the crop listing connected to this request.</small>
                  </div>
                </div>
              </section>

              <section className="request-lifecycle-panel">
                <div className="request-lifecycle-panel__head">
                  <h2>{counterpartLabel} Details</h2>
                  <p>Contact and identity information available for this request.</p>
                </div>
                <div className="request-lifecycle-stats">
                  <div className="request-lifecycle-stat">
                    <span>{counterpartLabel} Name</span>
                    <strong>{counterpartName || 'Not available'}</strong>
                    <small>The person on the other side of this request conversation.</small>
                  </div>
                  <div className="request-lifecycle-stat">
                    <span>Phone Number</span>
                    <strong>{counterpartPhone || 'Not available'}</strong>
                    <small>Reach out directly if coordination is needed offline.</small>
                  </div>
                  <div className="request-lifecycle-stat">
                    <span>Email</span>
                    <strong>{counterpartEmail || 'Not available'}</strong>
                    <small>Shown when it is available for this request record.</small>
                  </div>
                  <div className="request-lifecycle-stat request-lifecycle-stat--action">
                    <span>Profile</span>
                    {buyerProfilePath ? (
                      <Button size="sm" variant="outline" onClick={() => navigate(buyerProfilePath)}>
                        View Buyer
                      </Button>
                    ) : (
                      <strong>{requestDetails.farmerLocation || 'Available in chat context'}</strong>
                    )}
                    <small>{buyerProfilePath ? 'Jump to the buyer profile for more background.' : 'Location context for the farmer on this request.'}</small>
                  </div>
                </div>
              </section>
            </div>

            <section className="request-lifecycle-panel">
              <div className="request-lifecycle-panel__head">
                <h2>Timeline / Activity</h2>
                <p>Every important timestamp in this request lifecycle.</p>
              </div>
              <div className="request-lifecycle-timeline">
                {timelineItems.map((item) => (
                  <div key={item.label} className={`request-lifecycle-timeline__item${item.value ? ' is-active' : ''}`}>
                    <span>{item.label}</span>
                    <strong>{formatDateTime(item.value)}</strong>
                  </div>
                ))}
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
                      Open Full Chat
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

            {isAccepted && (
              <section className="request-lifecycle-panel request-lifecycle-panel--chat">
                <div className="request-lifecycle-panel__head">
                  <h2>Chat Section</h2>
                  <p>{socketReady ? 'Live chat connected.' : 'Connecting to request chat...'}</p>
                </div>

                <div className="request-lifecycle-chat">
                  <div className="request-lifecycle-chat__messages">
                    {messagesLoading ? (
                      <div className="request-lifecycle-chat__empty">
                        <div className="ui-spinner" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="request-lifecycle-chat__empty">
                        <p>No messages yet. Start the conversation here.</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const mine = message.senderId === currentUserId;
                        const isSystem = message.messageType === 'SYSTEM';
                        return (
                          <div
                            key={message.messageId}
                            className={`request-lifecycle-message${mine ? ' request-lifecycle-message--mine' : ''}${isSystem ? ' request-lifecycle-message--system' : ''}`}
                          >
                            <div className="request-lifecycle-message__bubble">
                              <p>{message.messageText}</p>
                              <time>{formatMessageTime(message.createdAt)}</time>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="request-lifecycle-chat__composer">
                    <textarea
                      value={composer}
                      onChange={(event) => setComposer(event.target.value)}
                      placeholder="Send a message to continue the accepted request..."
                      rows={2}
                      disabled={conversation?.status !== 'ACTIVE'}
                    />
                    <Button
                      className="request-lifecycle-chat__send"
                      onClick={handleSend}
                      disabled={!composer.trim() || conversation?.status !== 'ACTIVE'}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </Card>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}

function timelineItemsWithValuesCount(requestDetails) {
  return [
    requestDetails?.requestedAt,
    requestDetails?.acceptedAt,
    requestDetails?.rejectedAt,
    requestDetails?.lastMessageAt,
    requestDetails?.notifiedAt,
    requestDetails?.completedAt,
    requestDetails?.failedAt,
    requestDetails?.expiredAt,
  ].filter(Boolean).length;
}
