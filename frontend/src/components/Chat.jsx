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
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
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
            <div className="chat-conversation-list">
              {conversations.map((item) => {
                const active = item.conversationId === resolvedConversationId;
                const counterpart = currentUserId === item.buyerId ? item.farmerName : item.buyerName;
                return (
                  <button
                    key={item.conversationId}
                    type="button"
                    className={active ? 'chat-conversation-card chat-conversation-card--active' : 'chat-conversation-card'}
                    onClick={() => openConversation(item)}
                  >
                    <div className="chat-conversation-card__top">
                      <strong>{item.listingName}</strong>
                      <small>{item.status}</small>
                    </div>
                    <span>With {counterpart}</span>
                    <small>Requested quantity: {item.requestedQuantity ?? 'Not specified'}</small>
                  </button>
                );
              })}
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

              <div className="chat-deal-strip">
                <span>Requested: <strong>{activeConversation.requestedQuantity}</strong></span>
                {activeConversation.pendingDealQuantity ? (
                  <span>Pending deal: <strong>{activeConversation.pendingDealQuantity}</strong></span>
                ) : null}
                <span>Buyer confirmed: <strong>{activeConversation.buyerDealConfirmed ? 'Yes' : 'No'}</strong></span>
                <span>Farmer confirmed: <strong>{activeConversation.farmerDealConfirmed ? 'Yes' : 'No'}</strong></span>
              </div>

              <div className="chat-message-list" ref={messageListRef} onScroll={updateStickiness}>
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
                            ? 'chat-message chat-message--system'
                            : mine
                              ? 'chat-message chat-message--mine'
                              : 'chat-message chat-message--other'
                        }
                      >
                        {!isSystem ? (
                          <strong className="chat-message__sender">
                            {mine ? 'You' : counterpartyName}
                          </strong>
                        ) : null}
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
                <span>Use requested quantity ({activeConversation.requestedQuantity})</span>
              </label>

              <label className={!useRequestedQuantity ? 'chat-radio chat-radio--active' : 'chat-radio'}>
                <input
                  type="radio"
                  checked={!useRequestedQuantity}
                  onChange={() => setUseRequestedQuantity(false)}
                />
                <span>Use updated agreed quantity</span>
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
