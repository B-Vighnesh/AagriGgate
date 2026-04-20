import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/Notifications.css';
import Toast from './common/Toast';
import { getRole, isLoggedIn } from '../lib/auth';
import {
  acknowledgeAlert,
  countUnread,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '../lib/notificationApi';
import { resolveNotificationRoute } from '../lib/notificationRouting';

const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const syncNotificationCount = (count) => {
  window.dispatchEvent(new CustomEvent('notifications:count-updated', { detail: { count } }));
};

function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return TIME_FORMATTER.format(date);
}

function NotificationItem({ item, isSeen, onOpen }) {
  const deliveryType = String(item.deliveryType || 'NOTIFICATION').toUpperCase();

  return (
    <button
      type="button"
      className={`ntf-item ${isSeen ? 'ntf-item--read' : 'ntf-item--unread'}`}
      onClick={() => onOpen(item, isSeen)}
      aria-label={`${isSeen ? '' : 'Unread: '}${item.title}`}
    >
      <span className={`ntf-item__dot ${isSeen ? 'ntf-item__dot--read' : 'ntf-item__dot--unread'}`} aria-hidden="true" />
      <div className="ntf-item__body">
        <div className="ntf-item__title-row">
          <span className={`ntf-item__title ${isSeen ? '' : 'ntf-item__title--bold'}`}>
            {item.title}
          </span>
          <div className="ntf-item__title-meta">
            <span className={`ntf-item__state ${isSeen ? 'ntf-item__state--read' : 'ntf-item__state--unread'}`}>
              {isSeen ? 'Read' : 'Unread'}
            </span>
            {item.severity ? (
              <span className={`ntf-item__pill ntf-item__pill--${String(item.severity).toLowerCase()}`}>
                {item.severity}
              </span>
            ) : null}
            <time className="ntf-item__time" dateTime={item.createdAt}>
              {formatTimestamp(item.createdAt)}
            </time>
          </div>
        </div>
        <p className="ntf-item__message">{item.message}</p>
        <div className="ntf-item__meta">
          <span className="ntf-item__type">{deliveryType}</span>
          {item.categoryName ? <span>{item.categoryName}</span> : null}
        </div>
        <span className="ntf-item__cta">View Details</span>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="ntf-empty" role="status">
      <div className="ntf-empty__icon" aria-hidden="true">
        <i className="fa-regular fa-bell-slash" />
      </div>
      <strong>Nothing new right now</strong>
      <p>Your notifications will appear here when there&apos;s something important.</p>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="ntf-skeleton" aria-busy="true" aria-label="Loading notifications">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="ntf-skeleton__row">
          <div className="ntf-skeleton__dot" />
          <div className="ntf-skeleton__lines">
            <div className="ntf-skeleton__line ntf-skeleton__line--short" />
            <div className="ntf-skeleton__line ntf-skeleton__line--long" />
          </div>
          <div className="ntf-skeleton__line ntf-skeleton__line--time" />
        </div>
      ))}
    </div>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const role = getRole();
  const loggedIn = isLoggedIn();

  const [messages, setMessages] = useState([]);
  const [seenIds, setSeenIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const loadingRef = useRef(false);
  const loadMoreRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2400);
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      setMessages([]);
      setUnreadCount(0);
      setLoading(false);
      syncNotificationCount(0);
      return undefined;
    }

    if (loadingRef.current) return undefined;
    loadingRef.current = true;
    let active = true;

    (async () => {
      setLoading(true);

      const [messagesResult, unreadResult] = await Promise.allSettled([
        getNotifications({ page: 0, size: 12 }),
        countUnread(),
      ]);

      if (!active) return;

      if (messagesResult.status === 'fulfilled') {
        const resultPage = messagesResult.value;
        const items = Array.isArray(resultPage?.content) ? resultPage.content : Array.isArray(resultPage) ? resultPage : [];
        setMessages(items);
        setPage(Number(resultPage?.number ?? 0));
        setHasMore(resultPage?.last === false || Number(resultPage?.totalPages ?? 0) > 1);
      } else {
        setMessages([]);
        setPage(0);
        setHasMore(false);
        showToast(messagesResult.reason?.message || 'Failed to load notifications.', 'error');
      }

      if (unreadResult.status === 'fulfilled') {
        const nextUnread = Number(unreadResult.value?.count ?? 0);
        setUnreadCount(nextUnread);
        syncNotificationCount(nextUnread);
      } else {
        const fallbackUnread = (messagesResult.status === 'fulfilled'
          ? (Array.isArray(messagesResult.value?.content) ? messagesResult.value.content : [])
          : []
        ).filter((item) => String(item?.deliveryType || '').toUpperCase() === 'NOTIFICATION' && item?.isRead !== true).length;
        setUnreadCount(fallbackUnread);
        syncNotificationCount(fallbackUnread);
      }

      setLoading(false);
      loadingRef.current = false;
    })();

    return () => {
      active = false;
      loadingRef.current = false;
    };
  }, [loggedIn, showToast]);

  useEffect(() => {
    if (!loggedIn || !hasMore || loading || loadingMore || !loadMoreRef.current) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;

      setLoadingMore(true);
      getNotifications({ page: page + 1, size: 12 })
        .then((result) => {
          const items = Array.isArray(result?.content) ? result.content : [];
          setMessages((prev) => {
            const existing = new Set(prev.map((item) => item.id));
            const nextItems = items.filter((item) => !existing.has(item.id));
            return [...prev, ...nextItems];
          });
          setPage(Number(result?.number ?? page + 1));
          setHasMore(result?.last === false);
        })
        .catch((error) => {
          showToast(error.message || 'Failed to load more notifications.', 'error');
          setHasMore(false);
        })
        .finally(() => {
          setLoadingMore(false);
        });
    }, { rootMargin: '200px 0px' });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loggedIn, page, showToast]);

  const isSeen = useCallback((item) => {
    const isAlert = String(item.deliveryType || '').toUpperCase() === 'ALERT';
    return seenIds.has(item.id) || (isAlert ? item.isAcknowledged === true : item.isRead === true);
  }, [seenIds]);

  const handleItemOpen = useCallback(async (item, alreadySeen = false) => {
    const isAlert = String(item.deliveryType || '').toUpperCase() === 'ALERT';

    if (!alreadySeen) {
      setSeenIds((prev) => new Set(prev).add(item.id));
      if (!isAlert) {
        setUnreadCount((prev) => {
          const next = Math.max(prev - 1, 0);
          syncNotificationCount(next);
          return next;
        });
      }

      try {
        if (isAlert) {
          await acknowledgeAlert(item.id);
        } else {
          await markAsRead(item.id);
        }
      } catch (err) {
        setSeenIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
        if (!isAlert) {
          setUnreadCount((prev) => {
            const next = prev + 1;
            syncNotificationCount(next);
            return next;
          });
        }
        showToast(err.message || 'Failed to update notification.', 'error');
        return;
      }
    }

    const target = resolveNotificationRoute(item, role);
    if (target) navigate(target);
  }, [navigate, role, showToast]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setSeenIds((prev) => {
        const next = new Set(prev);
        messages
          .filter((item) => String(item.deliveryType || '').toUpperCase() === 'NOTIFICATION')
          .forEach((item) => next.add(item.id));
        return next;
      });
      setUnreadCount(0);
      syncNotificationCount(0);
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to mark all as read.', 'error');
    }
  }, [messages, showToast]);

  const unreadDisplay = useMemo(() => {
    const count = messages.filter((item) => {
      const isAlert = String(item.deliveryType || '').toUpperCase() === 'ALERT';
      return !isAlert && !isSeen(item);
    }).length;
    return Math.max(count, unreadCount);
  }, [isSeen, messages, unreadCount]);

  if (!loggedIn) {
    return (
      <div className="ntf-page ag-container page">
        <div className="ntf-empty">
          <strong>Please log in to view notifications.</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="ntf-page page">
      <div className="ntf-layout ag-container">
        <section className="ntf-panel" aria-label="Notifications">
          <header className="ntf-panel__header">
            <div className="ntf-panel__title-group">
              <h1 className="ntf-panel__title">Notifications</h1>
              {unreadDisplay > 0 ? (
                <span className="ntf-panel__badge" aria-label={`${unreadDisplay} unread`}>
                  {unreadDisplay}
                </span>
              ) : null}
            </div>
            <div className="ntf-panel__actions">
              <button
                type="button"
                className="ntf-panel__action"
                onClick={handleMarkAllRead}
                disabled={unreadDisplay === 0}
              >
                Mark all read
              </button>
              <button
                type="button"
                className="ntf-panel__action ntf-panel__action--prefs"
                onClick={() => navigate('/notification-preferences')}
                aria-label="Open notification preferences"
              >
                <i className="fa-solid fa-gear" aria-hidden="true" />
                <span>Preferences</span>
              </button>
            </div>
          </header>

          <div className="ntf-panel__body">
            {loading ? <SkeletonLoader /> : null}

            {!loading ? (
              <>
                {messages.length > 0 ? (
                  <section className="ntf-section" aria-label="All messages">
                    <div className="ntf-section__head">
                      <strong>All Messages</strong>
                      <span className="ntf-section__count">{messages.length}</span>
                    </div>
                    <div className="ntf-section__list">
                      {messages.map((item) => (
                        <NotificationItem
                          key={`${item.deliveryType}-${item.id}`}
                          item={item}
                          isSeen={isSeen(item)}
                          onOpen={handleItemOpen}
                        />
                      ))}
                    </div>
                    {hasMore ? <div ref={loadMoreRef} className="ntf-load-trigger" /> : null}
                    {loadingMore ? (
                      <div className="ntf-load-more">
                        <span className="ui-spinner" aria-hidden="true" />
                        <span>Loading more notifications...</span>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {messages.length === 0 ? <EmptyState /> : null}
              </>
            ) : null}
          </div>
        </section>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
