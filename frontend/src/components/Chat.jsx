import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { confirmChatDeal, getChatConversation, getChatConversations, getChatMessages, openChatSocket } from '../api/chatApi';
import { getFarmerId, getRole, getToken } from '../lib/auth';

function sortConversations(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.lastMessageAt || left.updatedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.lastMessageAt || right.updatedAt || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function groupConversationsByStatus(items) {
  const buckets = {
    active: [],
    completed: [],
    expired: [],
    failed: [],
  };

  items.forEach((item) => {
    const status = String(item.status || 'ACTIVE').toUpperCase();
    if (status === 'COMPLETED') {
      buckets.completed.push(item);
      return;
    }
    if (status === 'EXPIRED') {
      buckets.expired.push(item);
      return;
    }
    if (status === 'FAILED') {
      buckets.failed.push(item);
      return;
    }
    buckets.active.push(item);
  });

  return buckets;
}

function formatQuantity(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return 'Not set';
  }
  const numeric = Number(value);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
}

function buildConversationPreview(item) {
  if (item.status === 'COMPLETED') {
    return `Deal closed for ${formatQuantity(item.pendingDealQuantity ?? item.requestedQuantity)} quantity.`;
  }
  if (item.status === 'EXPIRED') {
    return 'Conversation expired due to inactivity.';
  }
  if (item.status === 'FAILED') {
    return 'Deal was not completed.';
  }
  if (item.pendingDealQuantity) {
    return `Latest offer: ${formatQuantity(item.pendingDealQuantity)} quantity awaiting confirmation.`;
  }
  if (item.buyerDealConfirmed || item.farmerDealConfirmed) {
    return 'Deal confirmation has started.';
  }
  return 'Open the chat to continue negotiation.';
}

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const role = getRole();
  const currentUserId = Number(getFarmerId() || 0);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [composer, setComposer] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [socketReady, setSocketReady] = useState(false);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [useRequestedQuantity, setUseRequestedQuantity] = useState(true);
  const [dealQuantity, setDealQuantity] = useState('');
  const [dealLoading, setDealLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  const activeConversationIdRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  const scrollMessagesToBottom = (behavior = 'auto') => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  const updateStickiness = () => {
    const container = messageListRef.current;
    if (!container) {
      stickToBottomRef.current = true;
      return;
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 56;
  };

  const resolvedConversationId = useMemo(() => {
    if (conversationId) {
      return Number(conversationId);
    }
    return activeConversation?.conversationId || null;
  }, [conversationId, activeConversation]);

  const counterpartyName = activeConversation
    ? (currentUserId === activeConversation.buyerId ? activeConversation.farmerName : activeConversation.buyerName)
    : '';

  const isBuyer = activeConversation ? currentUserId === activeConversation.buyerId : false;
  const agreedQuantity = activeConversation?.pendingDealQuantity ?? activeConversation?.requestedQuantity ?? null;
  const dealStatusText = activeConversation
    ? activeConversation.status === 'COMPLETED'
      ? 'Deal completed'
      : activeConversation.status === 'EXPIRED'
        ? 'Conversation expired'
        : activeConversation.status === 'FAILED'
          ? 'Deal failed'
          : activeConversation.buyerDealConfirmed && activeConversation.farmerDealConfirmed
            ? 'Ready to close'
            : activeConversation.buyerDealConfirmed || activeConversation.farmerDealConfirmed
              ? 'Waiting for the other user'
              : 'Negotiation in progress'
    : '';

  const groupedConversations = useMemo(
    () => groupConversationsByStatus(conversations),
    [conversations]
  );

  useEffect(() => {
    activeConversationIdRef.current = resolvedConversationId;
  }, [resolvedConversationId]);

  const loadConversations = async () => {
    setLoadingList(true);
    try {
      const data = await getChatConversations();
      const list = Array.isArray(data) ? data : [];
      const sorted = sortConversations(list);
      setConversations(sorted);

      const targetId = conversationId ? Number(conversationId) : sorted[0]?.conversationId;
      if (targetId) {
        const selected = sorted.find((item) => item.conversationId === targetId) || null;
        if (selected) {
          setActiveConversation(selected);
        } else {
          const fetched = await getChatConversation(targetId);
          setActiveConversation(fetched);
          setConversations((prev) => sortConversations([...prev, fetched]));
        }
      } else {
        setActiveConversation(null);
      }
    } catch (error) {
      showToast(error.message || 'Unable to load conversations.', 'error');
      setConversations([]);
      setActiveConversation(null);
    } finally {
      setLoadingList(false);
    }
  };

  const loadMessages = async (targetConversationId) => {
    if (!targetConversationId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const data = await getChatMessages(targetConversationId);
      setMessages(Array.isArray(data) ? data : []);
      stickToBottomRef.current = true;
      window.requestAnimationFrame(() => scrollMessagesToBottom('auto'));
    } catch (error) {
      showToast(error.message || 'Unable to load chat messages.', 'error');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!role) {
      navigate('/login');
      return;
    }
    loadConversations();
  }, [conversationId]);

  useEffect(() => {
    if (!resolvedConversationId) {
      return;
    }
    loadMessages(resolvedConversationId);
  }, [resolvedConversationId]);

  useEffect(() => {
    if (!token || !role) {
      return undefined;
    }

    try {
      const socket = openChatSocket({
        onOpen: () => setSocketReady(true),
        onClose: () => setSocketReady(false),
        onError: () => setSocketReady(false),
        onMessage: (payload) => {
          if (payload?.type === 'CHAT_MESSAGE' && payload.data) {
            const incoming = payload.data;
            setConversations((prev) => sortConversations(prev.map((item) =>
              item.conversationId === incoming.conversationId
                ? { ...item, lastMessageAt: incoming.createdAt, updatedAt: incoming.createdAt }
                : item
            )));
            setMessages((prev) => {
              if (incoming.conversationId !== activeConversationIdRef.current) {
                return prev;
              }
              if (prev.some((item) => item.messageId === incoming.messageId)) {
                return prev;
              }
              return [...prev, incoming];
            });
            if (incoming.conversationId === activeConversationIdRef.current && stickToBottomRef.current) {
              window.requestAnimationFrame(() => scrollMessagesToBottom('smooth'));
            }
          }

          if (payload?.type === 'CONVERSATION_UPDATE' && payload.data) {
            const updatedConversation = payload.data;
            setConversations((prev) => {
              const withoutCurrent = prev.filter((item) => item.conversationId !== updatedConversation.conversationId);
              return sortConversations([updatedConversation, ...withoutCurrent]);
            });
            if (updatedConversation.conversationId === resolvedConversationId) {
              setActiveConversation(updatedConversation);
            }
            if (payload.message) {
              showToast(payload.message, updatedConversation.status === 'COMPLETED' ? 'success' : 'info');
            }
          }

          if (payload?.type === 'ERROR' && payload.message) {
            showToast(payload.message, 'error');
          }
        },
      });
      socketRef.current = socket;
      return () => {
        socket.close();
        socketRef.current = null;
      };
    } catch (error) {
      showToast(error.message || 'Unable to connect chat.', 'error');
      return undefined;
    }
  }, [token, role]);

  const openConversation = async (targetConversation) => {
    navigate(`/chat/${targetConversation.conversationId}`);
  };

  const renderConversationSection = (title, tone, items) => {
    if (!items.length) {
      return null;
    }

    return (
      <div className="chat-section">
        <div className={`chat-section__head chat-section__head--${tone}`}>
          <strong>{title}</strong>
          <span>{items.length}</span>
        </div>

        <div className="chat-conversation-list">
          {items.map((item) => {
            const active = item.conversationId === resolvedConversationId;
            const counterpart = currentUserId === item.buyerId ? item.farmerName : item.buyerName;
            const statusTone = String(item.status || 'ACTIVE').toLowerCase();

            return (
              <button
                key={item.conversationId}
                type="button"
                className={
                  active
                    ? `chat-conversation-card chat-conversation-card--${statusTone} chat-conversation-card--active`
                    : `chat-conversation-card chat-conversation-card--${statusTone}`
                }
                onClick={() => openConversation(item)}
              >
                <div className="chat-conversation-card__top">
                  <strong>{item.listingName}</strong>
                  <span className={`chat-status-dot chat-status-dot--${statusTone}`} aria-hidden="true" />
                </div>
                <span>{counterpart}</span>
                <small>{buildConversationPreview(item)}</small>
                <em className={`chat-conversation-card__status chat-conversation-card__status--${statusTone}`}>
                  {item.status}
                </em>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSend = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      showToast('Chat connection is not ready yet.', 'error');
      return;
    }
    if (!resolvedConversationId) {
      showToast('Choose a conversation first.', 'error');
      return;
    }
    if (!composer.trim()) {
      return;
    }

    socketRef.current.send(JSON.stringify({
      conversationId: resolvedConversationId,
      messageText: composer.trim(),
    }));
    stickToBottomRef.current = true;
    setComposer('');
  };

  const handleDealConfirm = async () => {
    if (!activeConversation) {
      return;
    }
    if (!useRequestedQuantity) {
      const numericQuantity = Number(dealQuantity);
      if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        showToast('Enter a valid updated quantity.', 'error');
        return;
      }
    }

    setDealLoading(true);
    try {
      const result = await confirmChatDeal(activeConversation.conversationId, {
        useRequestedQuantity,
        quantity: useRequestedQuantity ? null : Number(dealQuantity),
      });
      if (result?.conversation) {
        setActiveConversation(result.conversation);
        setConversations((prev) => {
          const withoutCurrent = prev.filter((item) => item.conversationId !== result.conversation.conversationId);
          return sortConversations([result.conversation, ...withoutCurrent]);
        });
      }
      showToast(result?.message || 'Deal confirmation updated.', result?.completed ? 'success' : 'info');
      setDealModalOpen(false);
      setUseRequestedQuantity(true);
      setDealQuantity('');
    } catch (error) {
      showToast(error.message || 'Unable to confirm deal.', 'error');
    } finally {
      setDealLoading(false);
    }
  };

  if (loadingList) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  return (
    <section className="page chat-page">
      <ValidateToken token={token} role={role} />

      <div className="ag-container chat-shell">
        <Card className="chat-sidebar">
          <div className="chat-sidebar__head">
            <div>
              <span className="settings-kicker">Negotiation Space</span>
              <h1>Marketplace Chat</h1>
              <p className="chat-sidebar__subcopy">
                Live negotiation stays tied to the accepted request, so both sides can talk clearly and close the deal with context.
              </p>
            </div>
            <span className={socketReady ? 'chat-connection chat-connection--live' : 'chat-connection'}>
              {socketReady ? 'Live' : 'Offline'}
            </span>
          </div>

          {conversations.length === 0 ? (
            <div className="chat-empty">
              <h3>No chats yet</h3>
              <p>Accepted requests will create conversations here for buyers and farmers.</p>
            </div>
          ) : (
            <div className="chat-sidebar__sections">
              {renderConversationSection('Active Chats', 'active', groupedConversations.active)}
              {renderConversationSection('Completed', 'completed', groupedConversations.completed)}
              {renderConversationSection('Expired', 'expired', groupedConversations.expired)}
              {renderConversationSection('Failed', 'failed', groupedConversations.failed)}
            </div>
          )}
        </Card>

        <Card className="chat-panel">
          {!activeConversation ? (
            <div className="chat-empty chat-empty--panel">
              <h3>Select a conversation</h3>
              <p>Choose an accepted request to continue the negotiation and confirm the final deal.</p>
            </div>
          ) : (
            <>
              <div className="chat-panel__head">
                <div>
                  <h2>{activeConversation.listingName}</h2>
                  <p>Talking with <strong>{counterpartyName}</strong></p>
                </div>
                <div className="chat-panel__meta">
                  <span className={`chat-status chat-status--${(activeConversation.status || 'active').toLowerCase()}`}>
                    {activeConversation.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDealModalOpen(true)}
                    disabled={activeConversation.status !== 'ACTIVE'}
                  >
                    {activeConversation.status === 'COMPLETED' ? 'Deal Completed' : 'Deal Confirmation'}
                  </Button>
                </div>
              </div>

              <div className="chat-message-list" ref={messageListRef} onScroll={updateStickiness}>
                {activeConversation.status === 'ACTIVE' ? (
                  <div className="chat-offer-card">
                    <div className="chat-offer-card__copy">
                      <strong>Deal Summary Inline</strong>
                      <span>
                        Last offer: {formatQuantity(agreedQuantity)} quantity
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setDealModalOpen(true)}
                    >
                      Confirm Deal
                    </Button>
                  </div>
                ) : null}

                {loadingMessages ? (
                  <div className="chat-empty">
                    <div className="ui-spinner ui-spinner--lg" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty">
                    <h3>No messages yet</h3>
                    <p>Start the conversation here. The full history is stored even if real-time delivery is interrupted.</p>
                  </div>
                ) : (
                  messages.map((item) => {
                    const isSystem = item.messageType === 'SYSTEM';
                    const mine = item.senderId === currentUserId;
                    return (
                      <div
                        key={item.messageId}
                        className={
                          isSystem
                            ? 'chat-event-card'
                            : mine
                              ? 'chat-message chat-message--mine'
                              : 'chat-message chat-message--other'
                        }
                      >
                        {!isSystem ? (
                          <strong className="chat-message__sender">
                            {mine ? 'You' : counterpartyName}
                          </strong>
                        ) : (
                          <strong className="chat-event-card__title">Deal Update</strong>
                        )}
                        <p>{item.messageText}</p>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-composer">
                <div className="chat-composer__head">
                  <strong>{activeConversation.status === 'ACTIVE' ? 'Send a message' : 'Conversation closed'}</strong>
                  <span>
                    {activeConversation.status === 'ACTIVE'
                      ? 'Keep negotiation inside the app so the history stays clear for both sides.'
                      : 'This chat is now read-only because the deal has already been resolved.'}
                  </span>
                </div>
                <textarea
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                  placeholder={activeConversation.status === 'ACTIVE'
                    ? 'Write a message for negotiation...'
                    : 'This conversation is closed.'}
                  disabled={activeConversation.status !== 'ACTIVE'}
                  rows={3}
                />
                <div className="chat-composer__actions">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/view-details/${activeConversation.listingId}`)}
                  >
                    View Listing
                  </Button>
                  <Button onClick={handleSend} disabled={activeConversation.status !== 'ACTIVE' || !composer.trim()}>
                    Send Message
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        <Card className="chat-deal-panel">
          {!activeConversation ? (
            <div className="chat-empty chat-empty--deal">
              <h3>Deal Summary</h3>
              <p>Select a conversation to see the current negotiation status and available actions.</p>
            </div>
          ) : (
            <>
              <div className="chat-deal-panel__head">
                <span className="settings-kicker">Deal Summary</span>
                <h3>{dealStatusText}</h3>
                <p>
                  Keep the negotiation visible here while the center panel stays focused on the conversation itself.
                </p>
              </div>

              <div className="chat-deal-summary">
                <div className="chat-deal-summary__row">
                  <span>Requested</span>
                  <strong>{formatQuantity(activeConversation.requestedQuantity)}</strong>
                </div>
                <div className="chat-deal-summary__row">
                  <span>Agreed</span>
                  <strong>{formatQuantity(agreedQuantity)}</strong>
                </div>
                <div className="chat-deal-summary__row">
                  <span>Status</span>
                  <strong>{dealStatusText}</strong>
                </div>
                <div className="chat-deal-summary__row">
                  <span>Buyer</span>
                  <strong>{activeConversation.buyerDealConfirmed ? 'Confirmed' : 'Pending'}</strong>
                </div>
                <div className="chat-deal-summary__row">
                  <span>Farmer</span>
                  <strong>{activeConversation.farmerDealConfirmed ? 'Confirmed' : 'Pending'}</strong>
                </div>
              </div>

              <div className="chat-deal-panel__card">
                <strong>Who should act next?</strong>
                <p>
                  {activeConversation.status !== 'ACTIVE'
                    ? 'This conversation is no longer active, so no more deal action is needed.'
                    : isBuyer
                      ? activeConversation.buyerDealConfirmed
                        ? 'Your confirmation is saved. Waiting for the farmer to respond.'
                        : 'Review the latest quantity and confirm when you are ready to close the deal.'
                      : activeConversation.farmerDealConfirmed
                        ? 'Your confirmation is saved. Waiting for the buyer to respond.'
                        : 'Review the latest quantity and confirm when you are ready to close the deal.'}
                </p>
              </div>

              <div className="chat-deal-panel__actions">
                <Button
                  onClick={() => setDealModalOpen(true)}
                  disabled={activeConversation.status !== 'ACTIVE'}
                >
                  {activeConversation.status === 'COMPLETED' ? 'Deal Completed' : 'Confirm Deal'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/view-details/${activeConversation.listingId}`)}
                >
                  View Listing
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {dealModalOpen && activeConversation ? (
        <div className="confirm-overlay">
          <Card className="confirm-card chat-deal-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Deal Confirmation</h3>
            <p className="confirm-card__subtitle">
              Confirm whether the final deal uses the requested quantity or an updated agreed quantity.
            </p>

            <div className="chat-deal-options">
              <label className={useRequestedQuantity ? 'chat-radio chat-radio--active' : 'chat-radio'}>
                <input
                  type="radio"
                  checked={useRequestedQuantity}
                  onChange={() => setUseRequestedQuantity(true)}
                />
                <div className="chat-radio__content">
                  <strong>Use requested quantity</strong>
                  <span>{activeConversation.requestedQuantity}</span>
                </div>
              </label>

              <label className={!useRequestedQuantity ? 'chat-radio chat-radio--active' : 'chat-radio'}>
                <input
                  type="radio"
                  checked={!useRequestedQuantity}
                  onChange={() => setUseRequestedQuantity(false)}
                />
                <div className="chat-radio__content">
                  <strong>Use updated quantity</strong>
                  <span>Enter the final agreed quantity for both sides.</span>
                </div>
              </label>

              {!useRequestedQuantity ? (
                <div className="confirm-field">
                  <label htmlFor="dealQuantity">Updated Quantity</label>
                  <input
                    id="dealQuantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={dealQuantity}
                    onChange={(event) => setDealQuantity(event.target.value)}
                    placeholder="Enter agreed quantity"
                  />
                </div>
              ) : null}
            </div>

            <div className="confirm-actions">
              <Button variant="outline" onClick={() => setDealModalOpen(false)}>Cancel</Button>
              <Button onClick={handleDealConfirm} loading={dealLoading}>
                {dealLoading ? 'Saving...' : 'Confirm Deal'}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
