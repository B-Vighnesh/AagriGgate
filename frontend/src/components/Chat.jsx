import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { confirmChatDeal, getChatConversation, getChatConversations, getChatMessages, openChatSocket } from '../api/chatApi';
import { getFarmerId, getRole, getToken } from '../lib/auth';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function sortConversations(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.lastMessageAt || left.updatedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.lastMessageAt || right.updatedAt || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function groupConversationsByStatus(items) {
  const buckets = { active: [], completed: [], expired: [], failed: [] };
  items.forEach((item) => {
    const status = String(item.status || 'ACTIVE').toUpperCase();
    if (status === 'COMPLETED') { buckets.completed.push(item); return; }
    if (status === 'EXPIRED')   { buckets.expired.push(item);   return; }
    if (status === 'FAILED')    { buckets.failed.push(item);    return; }
    buckets.active.push(item);
  });
  return buckets;
}

function formatQuantity(value) {
  if (value == null || Number.isNaN(Number(value))) return 'Not set';
  const numeric = Number(value);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
}

function buildConversationPreview(item) {
  if (item.status === 'COMPLETED') return `Deal closed for ${formatQuantity(item.pendingDealQuantity ?? item.requestedQuantity)} quantity.`;
  if (item.status === 'EXPIRED')   return 'Conversation expired due to inactivity.';
  if (item.status === 'FAILED')    return 'Deal was not completed.';
  if (item.pendingDealQuantity)    return `Latest offer: ${formatQuantity(item.pendingDealQuantity)} quantity awaiting confirmation.`;
  if (item.buyerDealConfirmed || item.farmerDealConfirmed) return 'Deal confirmation has started.';
  return 'Open the chat to continue negotiation.';
}

const initialsFor = (name) => {
  if (!name) return '??';
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join('');
};

const colorFor = (name) => {
  const palette = ['#e3f2f1', '#e9f1ff', '#f1e9ff', '#fff1e9', '#e9f7ed', '#ffe9f1'];
  const text    = ['#1f6f54', '#2d5ea7', '#6a3e91', '#b1562f', '#2f7a4f', '#9b2f5c'];
  const value   = String(name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const index   = value % palette.length;
  return { backgroundColor: palette[index], color: text[index] };
};

/* ─── Tooltip icon button ─────────────────────────────────────────────────── */
function IconBtn({ icon, label, onClick, disabled = false, className = '', danger = false }) {
  return (
    <button
      type="button"
      className={`chat-icon-btn${danger ? ' chat-icon-btn--danger' : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-tip={label}
    >
      <span className="chat-icon-btn__glyph" aria-hidden="true">{icon}</span>
    </button>
  );
}

/* ─── 3-dot dropdown menu ─────────────────────────────────────────────────── */
function PanelMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="chat-panel-menu" ref={ref}>
      <button
        type="button"
        className="chat-icon-btn chat-icon-btn--dots"
        aria-label="More options"
        data-tip="More options"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="chat-icon-btn__glyph" aria-hidden="true">
          <i className="fa-solid fa-ellipsis-vertical" />
        </span>
      </button>
      {open && (
        <div className="chat-panel-menu__dropdown">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`chat-panel-menu__item${item.danger ? ' chat-panel-menu__item--danger' : ''}`}
              onClick={() => { item.action(); setOpen(false); }}
              disabled={item.disabled}
            >
              <span className="chat-panel-menu__item-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */
export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const role  = getRole();
  const currentUserId = Number(getFarmerId() || 0);

  const [conversations,      setConversations]      = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages,           setMessages]           = useState([]);
  const [loadingList,        setLoadingList]        = useState(true);
  const [loadingMessages,    setLoadingMessages]    = useState(false);
  const [composer,           setComposer]           = useState('');
  const [toast,              setToast]              = useState({ message: '', type: 'info' });
  const [socketReady,        setSocketReady]        = useState(false);
  const [dealModalOpen,      setDealModalOpen]      = useState(false);
  const [dealDrawerOpen,     setDealDrawerOpen]     = useState(false);
  const [isMobileView,       setIsMobileView]       = useState(false);
  const [useRequestedQty,    setUseRequestedQty]    = useState(true);
  const [dealQuantity,       setDealQuantity]       = useState('');
  const [dealLoading,        setDealLoading]        = useState(false);

  const socketRef               = useRef(null);
  const messagesEndRef          = useRef(null);
  const messageListRef          = useRef(null);
  const activeConversationIdRef = useRef(null);
  const stickToBottomRef        = useRef(true);

  /* ── toast ── */
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  /* ── scroll ── */
  const scrollMessagesToBottom = (behavior = 'auto') => {
    const container = messageListRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const updateStickiness = () => {
    const container = messageListRef.current;
    if (!container) { stickToBottomRef.current = true; return; }
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 56;
  };

  /* ── derived ── */
  const resolvedConversationId = useMemo(() => {
    if (conversationId) return Number(conversationId);
    return activeConversation?.conversationId || null;
  }, [conversationId, activeConversation]);

  const counterpartyName = activeConversation
    ? (currentUserId === activeConversation.buyerId ? activeConversation.farmerName : activeConversation.buyerName)
    : '';

  const isBuyer       = activeConversation ? currentUserId === activeConversation.buyerId : false;
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

  const buyerStatusLabel  = activeConversation?.buyerDealConfirmed  ? 'Confirmed' : 'Pending';
  const farmerStatusLabel = activeConversation?.farmerDealConfirmed ? 'Confirmed' : 'Pending';

  /* ── buyer profile route ── */
  const buyerProfilePath = activeConversation?.buyerId
    ? `/view-buyer/${activeConversation.buyerId}`
    : null;

  /* ── sync ref ── */
  useEffect(() => {
    activeConversationIdRef.current = resolvedConversationId;
  }, [resolvedConversationId]);

  /* ── load conversations ── */
  const loadConversations = async () => {
    setLoadingList(true);
    try {
      const data   = await getChatConversations();
      const list   = Array.isArray(data) ? data : [];
      const sorted = sortConversations(list);
      setConversations(sorted);

      const targetId = conversationId ? Number(conversationId) : null;
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

  /* ── load messages ── */
  const loadMessages = async (targetConversationId) => {
    if (!targetConversationId) { setMessages([]); return; }
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

  /* ── mobile breakpoint ── */
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    const updateView = () => setIsMobileView(media.matches);
    updateView();
    if (media.addEventListener) {
      media.addEventListener('change', updateView);
      return () => media.removeEventListener('change', updateView);
    }
    media.addListener(updateView);
    return () => media.removeListener(updateView);
  }, []);

  /* ── on mount / conversationId change ── */
  useEffect(() => {
    if (!role) { navigate('/login'); return; }
    loadConversations();
  }, [conversationId, isMobileView]);

  /* ── load messages on conversation switch ── */
  useEffect(() => {
    if (!resolvedConversationId) return;
    loadMessages(resolvedConversationId);
  }, [resolvedConversationId]);

  /* ── websocket ── */
  useEffect(() => {
    if (!token || !role) return undefined;
    try {
      const socket = openChatSocket({
        onOpen:  () => setSocketReady(true),
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
              if (incoming.conversationId !== activeConversationIdRef.current) return prev;
              if (prev.some((item) => item.messageId === incoming.messageId)) return prev;
              return [...prev, incoming];
            });
            if (incoming.conversationId === activeConversationIdRef.current && stickToBottomRef.current) {
              window.requestAnimationFrame(() => scrollMessagesToBottom('smooth'));
            }
          }

          if (payload?.type === 'CONVERSATION_UPDATE' && payload.data) {
            const updated = payload.data;
            setConversations((prev) => {
              const rest = prev.filter((item) => item.conversationId !== updated.conversationId);
              return sortConversations([updated, ...rest]);
            });
            if (updated.conversationId === resolvedConversationId) setActiveConversation(updated);
            if (payload.message) showToast(payload.message, updated.status === 'COMPLETED' ? 'success' : 'info');
          }

          if (payload?.type === 'ERROR' && payload.message) showToast(payload.message, 'error');
        },
      });
      socketRef.current = socket;
      return () => { socket.close(); socketRef.current = null; };
    } catch (error) {
      showToast(error.message || 'Unable to connect chat.', 'error');
      return undefined;
    }
  }, [token, role]);

  /* ── handlers ── */
  const openConversation = (targetConversation) => {
    navigate(`/chat/${targetConversation.conversationId}`);
  };

  const handleSend = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      showToast('Chat connection is not ready yet.', 'error');
      return;
    }
    if (!resolvedConversationId) { showToast('Choose a conversation first.', 'error'); return; }
    if (!composer.trim()) return;
    socketRef.current.send(JSON.stringify({
      conversationId: resolvedConversationId,
      messageText: composer.trim(),
    }));
    stickToBottomRef.current = true;
    setComposer('');
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSend(); }
  };

  const handleDealConfirm = async () => {
    if (!activeConversation) return;
    if (!useRequestedQty) {
      const numericQty = Number(dealQuantity);
      if (!Number.isFinite(numericQty) || numericQty <= 0) {
        showToast('Enter a valid updated quantity.', 'error');
        return;
      }
    }
    setDealLoading(true);
    try {
      const result = await confirmChatDeal(activeConversation.conversationId, {
        useRequestedQuantity: useRequestedQty,
        quantity: useRequestedQty ? null : Number(dealQuantity),
      });
      if (result?.conversation) {
        setActiveConversation(result.conversation);
        setConversations((prev) => {
          const rest = prev.filter((item) => item.conversationId !== result.conversation.conversationId);
          return sortConversations([result.conversation, ...rest]);
        });
      }
      showToast(result?.message || 'Deal confirmation updated.', result?.completed ? 'success' : 'info');
      setDealModalOpen(false);
      setUseRequestedQty(true);
      setDealQuantity('');
    } catch (error) {
      showToast(error.message || 'Unable to confirm deal.', 'error');
    } finally {
      setDealLoading(false);
    }
  };

  /* open deal modal, close summary drawer first */
  const openDealModal = () => {
    setDealDrawerOpen(false);
    setDealModalOpen(true);
  };

  /* ── conversation sidebar section ── */
  const renderConversationSection = (title, tone, items) => {
    if (!items.length) return null;
    return (
      <div className="chat-section">
        <div className={`chat-section__head chat-section__head--${tone}`}>
          <strong>{title}</strong>
          <span>{items.length}</span>
        </div>
        <div className="chat-conversation-list">
          {items.map((item) => {
            const active       = item.conversationId === resolvedConversationId;
            const counterpart  = currentUserId === item.buyerId ? item.farmerName : item.buyerName;
            const statusTone   = String(item.status || 'ACTIVE').toLowerCase();
            const lastTime     = item.lastMessageAt || item.updatedAt || item.createdAt;
            return (
              <button
                key={item.conversationId}
                type="button"
                className={`chat-conversation-card chat-conversation-card--${statusTone}${active ? ' chat-conversation-card--active' : ''}`}
                onClick={() => openConversation(item)}
              >
                <div className="chat-conversation-card__avatar" aria-hidden="true" style={colorFor(counterpart)}>
                  {initialsFor(counterpart)}
                </div>
                <div className="chat-conversation-card__content">
                  <div className="chat-conversation-card__top">
                    <div>
                      <strong>{counterpart}</strong>
                      <span className="chat-conversation-card__listing">{item.listingName}</span>
                    </div>
                    <div className="chat-conversation-card__meta">
                      <span className={`chat-status-dot chat-status-dot--${statusTone}`} aria-hidden="true" />
                      <time>{lastTime ? new Date(lastTime).toLocaleDateString() : ''}</time>
                    </div>
                  </div>
                  <small>{buildConversationPreview(item)}</small>
                  <em className={`chat-conversation-card__status chat-conversation-card__status--${statusTone}`}>
                    {item.status}
                  </em>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── deal summary body (shared between right panel + drawer) ── */
  const DealSummaryBody = () => (
    <>
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
          <strong>{buyerStatusLabel}</strong>
        </div>
        <div className="chat-deal-summary__row">
          <span>Farmer</span>
          <strong>{farmerStatusLabel}</strong>
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
        <Button onClick={openDealModal} disabled={activeConversation.status !== 'ACTIVE'}>
          {activeConversation.status === 'COMPLETED' ? 'Deal Completed' : 'Confirm Deal'}
        </Button>
        <Button variant="outline" onClick={() => navigate(`/view-details/${activeConversation.listingId}`)}>
          View Listing
        </Button>
      </div>
    </>
  );

  /* ─────────────────────────────── render ─────────────────────────────────── */
  if (loadingList) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  const isMobileConversation = Boolean(activeConversation);

  return (
    <section className="page chat-page">
      <ValidateToken token={token} role={role} />

      <div className={`ag-container chat-shell${isMobileConversation ? ' chat-shell--conversation' : ''}${dealDrawerOpen ? ' chat-shell--dealopen' : ''}`}>

        {/* ── sidebar ── */}
        <Card className="chat-sidebar">
          <div className="chat-sidebar__head">
            <div>
              <span className="settings-kicker">Negotiation Space</span>
              <h1>Marketplace Chat</h1>
            </div>
            
          </div>

          {conversations.length === 0 ? (
            <div className="chat-empty">
              <h3>No chats yet</h3>
              <p>Accepted requests will create conversations here for buyers and farmers.</p>
            </div>
          ) : (
            <div className="chat-sidebar__sections">
              {renderConversationSection('Active Chats', 'active',    groupedConversations.active)}
              {renderConversationSection('Completed',   'completed',  groupedConversations.completed)}
              {renderConversationSection('Expired',     'expired',    groupedConversations.expired)}
              {renderConversationSection('Failed',      'failed',     groupedConversations.failed)}
            </div>
          )}
        </Card>

        {/* ── chat panel ── */}
        <Card className="chat-panel">
          {!activeConversation ? (
            <div className="chat-empty chat-empty--panel">
              <div className="chat-empty__icon" aria-hidden="true">
                <i className="fa-regular fa-comments" />
              </div>
              <h3>Select a conversation</h3>
              <p>Choose an accepted request to continue the negotiation and confirm the final deal.</p>
              <div className="chat-empty__tips">
                <div>
                  <strong>Tip</strong>
                  <span>Click a chat on the left to view negotiation history.</span>
                </div>
                <div>
                  <strong>Next</strong>
                  <span>Use the Summary button to review deal status anytime.</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* panel header */}
              <div className="chat-panel__head">
                {/* left: back + counterparty info */}
                <div className="chat-panel__title">
                  <IconBtn
                    icon={<i className="fa-solid fa-arrow-left" />}
                    label="Back to conversations"
                    className="chat-icon-btn--back"
                    onClick={() => {
                      setActiveConversation(null);
                      setDealDrawerOpen(false);
                      navigate('/chat');
                    }}
                  />

                  {/* clickable buyer/farmer name → profile */}
                  <button
                    type="button"
                    className="chat-counterparty-btn"
                    onClick={() => buyerProfilePath && navigate(buyerProfilePath)}
                    title={`View ${counterpartyName}'s profile`}
                    style={colorFor(counterpartyName)}
                  >
                    <span className="chat-counterparty-avatar">{initialsFor(counterpartyName)}</span>
                    <div>
                      <span className="chat-counterparty-name">{counterpartyName}</span>
                      <span className="chat-counterparty-listing">
                        {activeConversation.listingName}
                      </span>
                    </div>
                  </button>
                </div>

                {/* right: status + icon actions */}
                <div className="chat-panel__meta">
                  <span className={`chat-status chat-status--${(activeConversation.status || 'active').toLowerCase()}`}>
                    {activeConversation.status}
                  </span>

                  {/* deal icon */}
                  <IconBtn
                    icon={<i className="fa-solid fa-handshake" />}
                    label={activeConversation.status === 'COMPLETED' ? 'Deal Completed' : 'Confirm Deal'}
                    onClick={openDealModal}
                    disabled={activeConversation.status !== 'ACTIVE'}
                  />

                  {/* 3-dot menu */}
                  <PanelMenu
                    items={[
                      {
                        icon: <i className="fa-solid fa-file-lines" />,
                        label: 'View Listing',
                        action: () => navigate(`/view-details/${activeConversation.listingId}`),
                      },
                      {
                        icon: <i className="fa-solid fa-chart-column" />,
                        label: 'Summary',
                        action: () => setDealDrawerOpen(true),
                      },
                      {
                        icon: <i className="fa-solid fa-user" />,
                        label: 'View Buyer Profile',
                        action: () => buyerProfilePath && navigate(buyerProfilePath),
                        disabled: !buyerProfilePath,
                      },
                    ]}
                  />
                </div>
              </div>

              {/* message list */}
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
                    const mine     = item.senderId === currentUserId;
                    return (
                      <div
                        key={item.messageId}
                        className={
                          isSystem
                            ? 'chat-event-pill'
                            : mine
                              ? 'chat-message chat-message--mine'
                              : 'chat-message chat-message--other'
                        }
                      >
                        {!isSystem ? (
                          <>
                            <strong className="chat-message__sender">
                              {mine ? 'You' : counterpartyName}
                            </strong>
                            <p>{item.messageText}</p>
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                          </>
                        ) : (
                          <>
                            <span>{item.messageText}</span>
                            <em>{new Date(item.createdAt).toLocaleString()}</em>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* composer */}
              <div className="chat-composer">
                <div className="chat-composer__head">
                  <strong>{activeConversation.status === 'ACTIVE' ? 'Send a message' : 'Conversation closed'}</strong>
                  <span>
                    {activeConversation.status === 'ACTIVE'
                      ? 'Keep negotiation inside the app so the history stays clear for both sides.'
                      : 'This chat is now read-only because the deal has already been resolved.'}
                  </span>
                </div>
                <div className="chat-composer__input">
                  <input
                    type="text"
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={
                      activeConversation.status === 'ACTIVE'
                        ? 'Write a message for negotiation...'
                        : 'This conversation is closed.'
                    }
                    disabled={activeConversation.status !== 'ACTIVE'}
                  />
                  <button
                    type="button"
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={activeConversation.status !== 'ACTIVE' || !composer.trim()}
                    aria-label="Send message"
                  >
                    <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* ── right deal panel (desktop) ── */}
        <Card className="chat-deal-panel">
          {!activeConversation ? (
            <div className="chat-empty chat-empty--deal">
              <h3>Deal Summary</h3>
              <p>Select a conversation to see the current negotiation status and available actions.</p>
            </div>
          ) : (
            <>
              <div className="chat-deal-panel__head">
                <h3>{dealStatusText}</h3>
              </div>
              <DealSummaryBody />
            </>
          )}
        </Card>
      </div>

      {/* ── deal confirmation modal ── */}
      {dealModalOpen && activeConversation ? (
        <div className="confirm-overlay" onClick={() => setDealModalOpen(false)}>
          <Card className="confirm-card chat-deal-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Deal Confirmation</h3>
            <p className="confirm-card__subtitle">
              Confirm whether the final deal uses the requested quantity or an updated agreed quantity.
            </p>

            <div className="chat-deal-options">
              <label className={useRequestedQty ? 'chat-radio chat-radio--active' : 'chat-radio'}>
                <input
                  type="radio"
                  checked={useRequestedQty}
                  onChange={() => setUseRequestedQty(true)}
                />
                <span className="chat-radio__check" aria-hidden="true" />
                <div className="chat-radio__content">
                  <strong>Use requested quantity</strong>
                  <span>{activeConversation.requestedQuantity}</span>
                </div>
              </label>

              <label className={!useRequestedQty ? 'chat-radio chat-radio--active' : 'chat-radio'}>
                <input
                  type="radio"
                  checked={!useRequestedQty}
                  onChange={() => setUseRequestedQty(false)}
                />
                <span className="chat-radio__check" aria-hidden="true" />
                <div className="chat-radio__content">
                  <strong>Use updated quantity</strong>
                  <span>Enter the final agreed quantity for both sides.</span>
                </div>
              </label>

              {!useRequestedQty && (
                <div className="confirm-field">
                  <label htmlFor="dealQuantity">Updated Quantity</label>
                  <input
                    id="dealQuantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={dealQuantity}
                    onChange={(e) => setDealQuantity(e.target.value)}
                    placeholder="Enter agreed quantity"
                  />
                </div>
              )}
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

      {/* ── deal summary drawer (mobile / summary button) ── */}
      {dealDrawerOpen && activeConversation ? (
        <div className="confirm-overlay" onClick={() => setDealDrawerOpen(false)}>
          <Card className="confirm-card chat-summary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-summary-modal__head">
              <strong>Deal Summary</strong>
              <button type="button" onClick={() => setDealDrawerOpen(false)}>✕</button>
            </div>
            <div className="chat-deal-panel chat-deal-panel--drawer">
              <div className="chat-deal-panel__head">
                <h3>{dealStatusText}</h3>
              </div>
              <DealSummaryBody />
            </div>
          </Card>
        </div>
      ) : null}

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}





