import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/Notifications.css';
import Toast from './common/Toast';
import { getRole, isLoggedIn } from '../lib/auth';
import {
  acknowledgeAlert,
  countUnread,
  getActiveAlerts,
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

function NotificationItem({ notification, isRead, onRead }) {
  return (
    <button
      type="button"
      className={`ntf-item ${isRead ? 'ntf-item--read' : 'ntf-item--unread'}`}
      onClick={() => onRead(notification, isRead)}
      aria-label={`${isRead ? '' : 'Unread: '}${notification.title}`}
    >
      {!isRead ? <span className="ntf-item__dot" aria-hidden="true" /> : null}
      <div className="ntf-item__body">
        <div className="ntf-item__title-row">
          <span className={`ntf-item__title ${isRead ? '' : 'ntf-item__title--bold'}`}>
            {notification.title}
          </span>
          {notification.severity ? (
            <span className={`ntf-item__pill ntf-item__pill--${String(notification.severity).toLowerCase()}`}>
              {notification.severity}
            </span>
          ) : null}
        </div>
        <p className="ntf-item__message">{notification.message}</p>
        <div className="ntf-item__meta">
          <span className="ntf-item__type">{notification.deliveryType || 'NOTIFICATION'}</span>
          {notification.categoryName ? <span>{notification.categoryName}</span> : null}
        </div>
        <span className="ntf-item__cta">View Details</span>
      </div>
      <time className="ntf-item__time" dateTime={notification.createdAt}>
        {formatTimestamp(notification.createdAt)}
      </time>
    </button>
  );
}

function AlertItem({ alert, onOpen }) {
  return (
    <button type="button" className="ntf-alert" onClick={() => onOpen(alert)}>
      <div className="ntf-alert__body">
        <div className="ntf-alert__title-row">
          <strong className="ntf-alert__title">{alert.title}</strong>
          {alert.severity ? (
            <span className={`ntf-alert__pill ntf-alert__pill--${String(alert.severity).toLowerCase()}`}>
              {alert.severity}
            </span>
          ) : null}
        </div>
        <p className="ntf-alert__message">{alert.message}</p>
        <div className="ntf-alert__meta">
          <span>{alert.deliveryType || 'ALERT'}</span>
          {alert.categoryName ? <span>{alert.categoryName}</span> : null}
        </div>
        <time className="ntf-alert__time" dateTime={alert.createdAt}>
          {formatTimestamp(alert.createdAt)}
        </time>
      </div>
      <div className="ntf-alert__actions" aria-hidden="true">
        <span className="ntf-alert__btn ntf-alert__btn--ghost">Open</span>
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

  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [alerts, setAlerts] = useState([]);
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
      setNotifications([]);
      setAlerts([]);
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

      const [notificationsResult, alertsResult, unreadResult] = await Promise.allSettled([
        getNotifications({ deliveryType: 'NOTIFICATION', page: 0, size: 12 }),
        getActiveAlerts(),
        countUnread(),
      ]);

      if (!active) return;

      if (notificationsResult.status === 'fulfilled') {
        const page = notificationsResult.value;
        const items = Array.isArray(page?.content) ? page.content : Array.isArray(page) ? page : [];
        setNotifications(items);
        setPage(Number(page?.number ?? 0));
        setHasMore(page?.last === false || Number(page?.totalPages ?? 0) > 1);
      } else {
        setNotifications([]);
        setPage(0);
        setHasMore(false);
        showToast(notificationsResult.reason?.message || 'Failed to load notifications.', 'error');
      }

      if (alertsResult.status === 'fulfilled') {
        setAlerts(Array.isArray(alertsResult.value) ? alertsResult.value : []);
      } else {
        setAlerts([]);
      }

      if (unreadResult.status === 'fulfilled') {
        const nextUnread = Number(unreadResult.value?.count ?? 0);
        setUnreadCount(nextUnread);
        syncNotificationCount(nextUnread);
      } else {
        const fallbackUnread = (notificationsResult.status === 'fulfilled'
          ? (Array.isArray(notificationsResult.value?.content) ? notificationsResult.value.content : [])
          : []
        ).filter((item) => item?.isRead !== true).length;
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
      getNotifications({ deliveryType: 'NOTIFICATION', page: page + 1, size: 12 })
        .then((result) => {
          const items = Array.isArray(result?.content) ? result.content : [];
          setNotifications((prev) => {
            const seen = new Set(prev.map((item) => item.id));
            const nextItems = items.filter((item) => !seen.has(item.id));
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

  const handleNotificationRead = useCallback(async (notification, alreadyRead = false) => {
    if (!alreadyRead) {
      setReadIds((prev) => new Set(prev).add(notification.id));
      setUnreadCount((prev) => {
        const next = Math.max(prev - 1, 0);
        syncNotificationCount(next);
        return next;
      });

      try {
        await markAsRead(notification.id);
      } catch (err) {
        setReadIds((prev) => {
          const next = new Set(prev);
          next.delete(notification.id);
          return next;
        });
        setUnreadCount((prev) => {
          const next = prev + 1;
          syncNotificationCount(next);
          return next;
        });
        showToast(err.message || 'Failed to mark as read.', 'error');
        return;
      }
    }

    const target = resolveNotificationRoute(notification, role);
    if (target) navigate(target);
  }, [navigate, role, showToast]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setReadIds((prev) => {
        const next = new Set(prev);
        notifications.forEach((notification) => next.add(notification.id));
        return next;
      });
      setUnreadCount(0);
      syncNotificationCount(0);
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to mark all as read.', 'error');
    }
  }, [notifications, showToast]);

  const handleAlertAck = useCallback(async (alert) => {
    const target = resolveNotificationRoute(alert, role);
    try {
      await acknowledgeAlert(alert.id);
      setAlerts((prev) => prev.filter((entry) => entry.id !== alert.id));
      showToast('Alert acknowledged.', 'success');
      if (target) {
        navigate(target);
      }
    } catch (err) {
      showToast(err.message || 'Failed to acknowledge alert.', 'error');
    }
  }, [navigate, role, showToast]);

  const isNotificationRead = useCallback((notification) => (
    readIds.has(notification.id) || notification.isRead === true
  ), [readIds]);

  const unreadDisplay = useMemo(() => {
    const count = notifications.filter((notification) => !isNotificationRead(notification)).length;
    return Math.max(count, unreadCount);
  }, [isNotificationRead, notifications, unreadCount]);

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
              <button
                type="button"
                className="ntf-panel__back"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
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
            <div className="ntf-panel__note">
              <strong>Notifications</strong> stay inside AagriGgate, while <strong>alerts</strong> are the urgent items intended for device-level attention.
            </div>

            {loading ? <SkeletonLoader /> : null}

            {!loading ? (
              <>
                {alerts.length > 0 ? (
                  <section className="ntf-section" aria-label="Active alerts">
                    <div className="ntf-section__head">
                      <strong>Active Alerts</strong>
                      <span className="ntf-section__count">{alerts.length}</span>
                    </div>
                    <div className="ntf-section__list">
                      {alerts.map((alert) => (
                        <AlertItem
                          key={alert.id}
                          alert={alert}
                          onOpen={handleAlertAck}
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

                {notifications.length > 0 ? (
                  <section className="ntf-section" aria-label="Recent notifications">
                    <div className="ntf-section__head">
                      <strong>Recent</strong>
                      <span className="ntf-section__count">{notifications.length}</span>
                    </div>
                    <div className="ntf-section__list">
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          isRead={isNotificationRead(notification)}
                          onRead={handleNotificationRead}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                {alerts.length === 0 && notifications.length === 0 ? <EmptyState /> : null}
              </>
            ) : null}
          </div>
        </section>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
