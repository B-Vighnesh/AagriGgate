import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import {
  archiveChatConversation,
  confirmChatDeal,
  deleteChatConversation,
  getChatConversation,
  getChatConversations,
  getChatMessages,
  openChatSocket,
  unarchiveChatConversation,
} from '../api/chatApi';
import { getFarmerId, getRole, getToken } from '../lib/auth';
import '../assets/Chat.css';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function sortConversations(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.lastMessageAt || left.updatedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.lastMessageAt || right.updatedAt || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function groupConversationsByStatus(items) {
  const buckets = { active: [], archived: [], completed: [], expired: [], failed: [] };
  items.forEach((item) => {
    if (item.archived) { buckets.archived.push(item); return; }
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
  if (item.status === 'EXPIRED')   return 'Conversation expired.';
  if (item.status === 'FAILED')    return 'Deal was not completed.';
  if (item.pendingDealQuantity)    return `Offer: ${formatQuantity(item.pendingDealQuantity)} quantity.`;
  return 'Continue negotiation...';
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

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const getRelativeDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
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
        aria-expanded={open}
        aria-haspopup="menu"
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
  const [useRequestedQty,    setUseRequestedQty]    = useState(true);
  const [dealQuantity,       setDealQuantity]       = useState('');
  const [dealLoading,        setDealLoading]        = useState(false);
  const [showScrollDown,     setShowScrollDown]     = useState(false);
  const [isTyping,           setIsTyping]           = useState(false);
  const [actionDialog,       setActionDialog]       = useState({ open: false, type: '', conversation: null });
  const [actionLoading,      setActionLoading]      = useState(false);

  const socketRef               = useRef(null);
  const messageListRef          = useRef(null);
  const activeConversationIdRef = useRef(null);
  const stickToBottomRef        = useRef(true);
  const composerRef             = useRef(null);

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
    stickToBottomRef.current = distanceFromBottom < 80;
    setShowScrollDown(distanceFromBottom > 300);
  };

  /* ── auto-resize textarea ── */
  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.style.height = 'auto';
      composerRef.current.style.height = `${Math.min(composerRef.current.scrollHeight, 120)}px`;
    }
  }, [composer]);

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
              ? 'Waiting for counterparty'
              : 'Negotiating'
    : '';

  const groupedConversations = useMemo(
    () => groupConversationsByStatus(conversations),
    [conversations]
  );

  const buyerStatusLabel  = activeConversation?.buyerDealConfirmed  ? 'Confirmed' : 'Pending';
  const farmerStatusLabel = activeConversation?.farmerDealConfirmed ? 'Confirmed' : 'Pending';
  const canDeleteConversation = (conversation) => ['COMPLETED', 'FAILED', 'EXPIRED'].includes(String(conversation?.status || '').toUpperCase());
  const canArchiveConversation = (conversation) => String(conversation?.status || '').toUpperCase() === 'ACTIVE';

  /* ── buyer profile route ── */
  const buyerProfilePath = activeConversation?.buyerId && !isBuyer
    ? `/view-buyer/${activeConversation.buyerId}`
    : null;

  const handleBackNavigation = () => {
   
    navigate('/chat');
  };

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

  /* ── on mount / conversationId change ── */
  useEffect(() => {
    if (!role) { navigate('/login'); return; }
    loadConversations();
  }, [conversationId]);

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
            mergeConversationUpdate(updated);
            if (payload.message) showToast(payload.message, updated.status === 'COMPLETED' ? 'success' : 'info');
          }

          if (payload?.type === 'CONVERSATION_REMOVED' && payload.data?.conversationId) {
            removeConversationLocally(payload.data.conversationId);
            if (payload.message) showToast(payload.message, 'info');
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

  const mergeConversationUpdate = (updatedConversation) => {
    setConversations((prev) => {
      const rest = prev.filter((item) => item.conversationId !== updatedConversation.conversationId);
      return sortConversations([updatedConversation, ...rest]);
    });
    if (updatedConversation.conversationId === resolvedConversationId) {
      setActiveConversation(updatedConversation);
    }
  };

  const removeConversationLocally = (conversationIdToRemove) => {
    setConversations((prev) => prev.filter((item) => item.conversationId !== conversationIdToRemove));
    if (resolvedConversationId === conversationIdToRemove) {
      setActiveConversation(null);
      setMessages([]);
      navigate('/chat');
    }
  };

  const openActionDialog = (type, conversation = activeConversation) => {
    if (!conversation) return;
    setActionDialog({ open: true, type, conversation });
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: '', conversation: null });
  };

  const handleConversationAction = async () => {
    if (!actionDialog.conversation) return;
    setActionLoading(true);
    try {
      if (actionDialog.type === 'archive') {
        const updated = await archiveChatConversation(actionDialog.conversation.conversationId);
        mergeConversationUpdate(updated);
        if (resolvedConversationId === actionDialog.conversation.conversationId) {
          navigate('/chat');
        }
        showToast('Conversation archived.', 'success');
      } else if (actionDialog.type === 'unarchive') {
        const updated = await unarchiveChatConversation(actionDialog.conversation.conversationId);
        mergeConversationUpdate(updated);
        showToast('Conversation moved back to active.', 'success');
      } else if (actionDialog.type === 'delete') {
        const result = await deleteChatConversation(actionDialog.conversation.conversationId);
        removeConversationLocally(actionDialog.conversation.conversationId);
        showToast(result?.message || 'Conversation deleted.', 'success');
      }
      closeActionDialog();
    } catch (error) {
      showToast(error.message || 'Unable to update conversation.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      showToast('Connection not ready.', 'error');
      return;
    }
    if (!resolvedConversationId) { showToast('Choose a conversation.', 'error'); return; }
    if (!composer.trim()) return;
    socketRef.current.send(JSON.stringify({
      conversationId: resolvedConversationId,
      messageText: composer.trim(),
    }));
    stickToBottomRef.current = true;
    setComposer('');
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleDealConfirm = async () => {
    if (!activeConversation) return;
    if (!useRequestedQty) {
      const numericQty = Number(dealQuantity);
      if (!Number.isFinite(numericQty) || numericQty <= 0) {
        showToast('Enter a valid quantity.', 'error');
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
      showToast(result?.message || 'Deal updated.', result?.completed ? 'success' : 'info');
      setDealModalOpen(false);
      setUseRequestedQty(true);
      setDealQuantity('');
    } catch (error) {
      showToast(error.message || 'Unable to confirm deal.', 'error');
    } finally {
      setDealLoading(false);
    }
  };

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
                      <time>{lastTime ? getRelativeDate(lastTime) : ''}</time>
                    </div>
                  </div>
                  <small>{buildConversationPreview(item)}</small>
                </div>
                {active && <div className="chat-conversation-card__active-indicator" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

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
          <span>Buyer</span>
          <strong className={`status-pill status-pill--${activeConversation.buyerDealConfirmed ? 'success' : 'pending'}`}>
            {buyerStatusLabel}
          </strong>
        </div>
        <div className="chat-deal-summary__row">
          <span>Farmer</span>
          <strong className={`status-pill status-pill--${activeConversation.farmerDealConfirmed ? 'success' : 'pending'}`}>
            {farmerStatusLabel}
          </strong>
        </div>
      </div>

      <div className="chat-deal-panel__card">
        <strong>Next Steps</strong>
        <p>
          {activeConversation.status !== 'ACTIVE'
            ? 'Deal closed.'
            : isBuyer
              ? activeConversation.buyerDealConfirmed
                ? 'Waiting for farmer.'
                : 'Confirm the final quantity.'
              : activeConversation.farmerDealConfirmed
                ? 'Waiting for buyer.'
                : 'Confirm the final quantity.'}
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

  const renderedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt);
      const dateStr = getRelativeDate(msg.createdAt);

      if (dateStr !== lastDate) {
        groups.push({ type: 'DATE', label: dateStr, key: `date-${msg.messageId}` });
        lastDate = dateStr;
      }
      groups.push({ type: 'MSG', ...msg, key: msg.messageId });
    });

    return groups.map((item) => {
      if (item.type === 'DATE') {
        return (
          <div key={item.key} className="chat-date-separator">
            <span>{item.label}</span>
          </div>
        );
      }

      const isSystem = item.messageType === 'SYSTEM';
      const mine     = item.senderId === currentUserId;

      if (isSystem) {
        return (
          <div key={item.key} className="chat-event-pill">
            <span>{item.messageText}</span>
            <em>{formatTime(item.createdAt)}</em>
          </div>
        );
      }

      return (
        <div key={item.key} className={`chat-message-row ${mine ? 'chat-message-row--mine' : 'chat-message-row--other'}`}>
          {!mine && (
            <div className="chat-message-avatar" style={colorFor(counterpartyName)}>
              {initialsFor(counterpartyName)}
            </div>
          )}
          <div className="chat-message-bubble">
            <p>{item.messageText}</p>
            <div className="chat-message-footer">
              <time>{formatTime(item.createdAt)}</time>
              {mine && <i className="fa-solid fa-check-double chat-message-status" />}
            </div>
          </div>
        </div>
      );
    });
  }, [messages, currentUserId, counterpartyName]);

  /* ─────────────────────────────── render ─────────────────────────────────── */
  if (loadingList) {
    return (
      <section className="page page--center chat-loading-page">
        <div className="ui-spinner ui-spinner--lg" />
        <p>Loading your conversations...</p>
      </section>
    );
  }

  const isMobileConversation = Boolean(activeConversation);

  return (
    <section className="page chat-page premium-chat">
      <ValidateToken token={token} role={role} />

      <div className={`ag-container chat-shell${isMobileConversation ? ' chat-shell--conversation' : ''}${dealDrawerOpen ? ' chat-shell--dealopen' : ''}`}>

        {/* ── sidebar ── */}
        <Card className="chat-sidebar">
          <div className="chat-sidebar__header">
            <div className="chat-sidebar__header-top">
              <h1>Messages</h1>
              <div className="chat-connection-status">
                <span className={`status-dot ${socketReady ? 'status-dot--online' : 'status-dot--offline'}`} />
                {socketReady ? 'Live' : 'Connecting...'}
              </div>
            </div>
            <div className="chat-search">
              <i className="fa-solid fa-magnifying-glass" />
              <input type="text" placeholder="Search chats..." disabled />
            </div>
          </div>

          <div className="chat-sidebar__content">
            {conversations.length === 0 ? (
              <div className="chat-empty-sidebar">
                <i className="fa-regular fa-comment-dots" />
                <p>No conversations found.</p>
              </div>
            ) : (
              <div className="chat-sidebar__sections">
                {renderConversationSection('Active',    'active',    groupedConversations.active)}
                {renderConversationSection('Archived',  'archived',  groupedConversations.archived)}
                {renderConversationSection('Completed',    'completed',  groupedConversations.completed)}
                {renderConversationSection('Failed',    'failed',     groupedConversations.failed)}
                {renderConversationSection('Expired',  'expired',    groupedConversations.expired)}
              </div>
            )}
          </div>
        </Card>

        {/* ── chat panel ── */}
        <Card className="chat-panel">
          {!activeConversation ? (
            <div className="chat-panel__empty">
              <div className="chat-panel__empty-content">
                <div className="chat-illustration">
                  <i className="fa-regular fa-comments" />
                </div>
                <h2>Your Negotiation Space</h2>
                <p>Select a chat from the sidebar to start negotiating deals with farmers or buyers.</p>
              </div>
            </div>
          ) : (
            <>
              {/* panel header */}
              <div className="chat-panel__header">
                <div className="chat-header__info">
                  <button
                    type="button"
                    className="chat-back-btn"
                    onClick={handleBackNavigation}
                    aria-label="Go back"
                    title="Go back"
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  <div 
                    className={`chat-header__avatar${buyerProfilePath ? ' chat-header__avatar--clickable' : ''}`}
                    style={colorFor(counterpartyName)}
                    onClick={() => buyerProfilePath && navigate(buyerProfilePath)}
                  >
                    {initialsFor(counterpartyName)}
                  </div>
                  <div className="chat-header__details">
                    <h3
                      className={buyerProfilePath ? 'chat-header__name--clickable' : ''}
                      onClick={() => buyerProfilePath && navigate(buyerProfilePath)}
                    >
                      {counterpartyName}
                    </h3>
                    <p>{activeConversation.listingName}</p>
                  </div>
                </div>

                <div className="chat-header__actions">
                  <div className="chat-status-badge">
                    {activeConversation.status}
                  </div>
                  <IconBtn
                    icon={<i className="fa-solid fa-handshake" />}
                    label="Deal"
                    onClick={openDealModal}
                    disabled={activeConversation.status !== 'ACTIVE'}
                  />
                  <PanelMenu
                    items={[
                      {
                        icon: <i className="fa-solid fa-circle-info" />,
                        label: 'Listing Details',
                        action: () => navigate(`/view-details/${activeConversation.listingId}`),
                      },
                      {
                        icon: <i className="fa-solid fa-chart-simple" />,
                        label: 'Deal Summary',
                        action: () => setDealDrawerOpen(true),
                      },
                      ...(canArchiveConversation(activeConversation) ? [{
                        icon: <i className={`fa-solid ${activeConversation.archived ? 'fa-box-open' : 'fa-box-archive'}`} />,
                        label: activeConversation.archived ? 'Unarchive Chat' : 'Archive Chat',
                        action: () => openActionDialog(activeConversation.archived ? 'unarchive' : 'archive'),
                      }] : []),
                      ...(canDeleteConversation(activeConversation) ? [{
                        icon: <i className="fa-solid fa-trash" />,
                        label: 'Delete Chat',
                        action: () => openActionDialog('delete'),
                        danger: true,
                      }] : []),
                      ...(buyerProfilePath ? [{
                        icon: <i className="fa-solid fa-user" />,
                        label: 'View Buyer Profile',
                        action: () => navigate(buyerProfilePath),
                      }] : []),
                    ]}
                  />
                </div>
              </div>

              {/* message list */}
              <div className="chat-message-list-container">
                <div className="chat-message-list" ref={messageListRef} onScroll={updateStickiness}>
                  {loadingMessages ? (
                    <div className="chat-messages-loading">
                      <div className="ui-spinner" />
                    </div>
                  ) : (
                    <>
                      {renderedMessages}
                      {isTyping && (
                        <div className="chat-message-row chat-message-row--other">
                          <div className="chat-message-avatar" style={colorFor(counterpartyName)}>
                            {initialsFor(counterpartyName)}
                          </div>
                          <div className="chat-typing-indicator">
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {showScrollDown && (
                  <button className="chat-scroll-down" onClick={() => scrollMessagesToBottom('smooth')}>
                    <i className="fa-solid fa-chevron-down" />
                  </button>
                )}
              </div>

              {/* composer */}
              <div className="chat-composer-area">
                <div className="chat-composer__inner">
                  <div className="chat-composer__tools">
                    <button className="chat-tool-btn" title="Add file" disabled><i className="fa-solid fa-paperclip" /></button>
                    <button className="chat-tool-btn" title="Add emoji" disabled><i className="fa-regular fa-face-smile" /></button>
                  </div>
                  <textarea
                    ref={composerRef}
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={activeConversation.status === 'ACTIVE' ? 'Type a message...' : 'Conversation closed'}
                    disabled={activeConversation.status !== 'ACTIVE'}
                    rows={1}
                  />
                  <button
                    className="chat-send-button"
                    onClick={handleSend}
                    disabled={activeConversation.status !== 'ACTIVE' || !composer.trim()}
                  >
                    <i className="fa-solid fa-paper-plane" />
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>

        
      </div>

      {/* ── Deal Modal ── */}
      {dealModalOpen && activeConversation && (
        <div className="premium-modal-overlay" onClick={() => setDealModalOpen(false)}>
          <Card className="premium-modal chat-deal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Deal Terms</h2>
              <button className="modal-close" onClick={() => setDealModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Finalize the quantity before closing the deal.</p>
              
              <div className="deal-option-grid">
                <div 
                  className={`deal-option ${useRequestedQty ? 'deal-option--active' : ''}`}
                  onClick={() => setUseRequestedQty(true)}
                >
                  <div className="deal-option__check"><i className="fa-solid fa-check" /></div>
                  <div className="deal-option__info">
                    <strong>Requested Quantity</strong>
                    <span>{activeConversation.requestedQuantity} units</span>
                  </div>
                </div>

                <div 
                  className={`deal-option ${!useRequestedQty ? 'deal-option--active' : ''}`}
                  onClick={() => setUseRequestedQty(false)}
                >
                  <div className="deal-option__check"><i className="fa-solid fa-check" /></div>
                  <div className="deal-option__info">
                    <strong>Updated Quantity</strong>
                    <span>Enter manually below</span>
                  </div>
                </div>
              </div>

              {!useRequestedQty && (
                <div className="deal-quantity-input">
                  <label>Agreed Quantity</label>
                  <input
                    type="number"
                    value={dealQuantity}
                    onChange={(e) => setDealQuantity(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setDealModalOpen(false)}>Cancel</Button>
              <Button onClick={handleDealConfirm} loading={dealLoading}>Confirm Deal</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Mobile Summary Drawer ── */}
      {dealDrawerOpen && activeConversation && (
        <div className="premium-modal-overlay" onClick={() => setDealDrawerOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-handle" />
            <div className="drawer-header">
              <h2>Deal Summary</h2>
              <button className="drawer-close" onClick={() => setDealDrawerOpen(false)}>✕</button>
            </div>
            <div className="drawer-body">
              <DealSummaryBody />
            </div>
          </div>
        </div>
      )}

      {actionDialog.open && actionDialog.conversation && (
        <div className="premium-modal-overlay" onClick={closeActionDialog}>
          <Card className="premium-modal chat-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {actionDialog.type === 'delete'
                  ? 'Delete Conversation'
                  : actionDialog.type === 'unarchive'
                    ? 'Unarchive Conversation'
                    : 'Archive Conversation'}
              </h2>
              <button className="modal-close" onClick={closeActionDialog}>âœ•</button>
            </div>
            <div className="modal-body">
              <p>
                {actionDialog.type === 'delete'
                  ? 'This will soft delete the conversation only for you. The other participant will still keep their copy.'
                  : actionDialog.type === 'unarchive'
                    ? 'This will move the conversation back into your active list.'
                    : 'This will move the active conversation into your archived section without deleting it.'}
              </p>
              <div className="chat-action-modal__meta">
                <strong>{actionDialog.conversation.listingName}</strong>
                <span>{actionDialog.conversation.status}</span>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={closeActionDialog} disabled={actionLoading}>Cancel</Button>
              <Button
                onClick={handleConversationAction}
                loading={actionLoading}
                className={actionDialog.type === 'delete' ? 'chat-action-modal__danger-btn' : ''}
              >
                {actionDialog.type === 'delete'
                  ? 'Delete'
                  : actionDialog.type === 'unarchive'
                    ? 'Unarchive'
                    : 'Archive'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
