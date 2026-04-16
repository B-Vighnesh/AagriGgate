import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/Notifications.css';
import NotificationPreferences from './NotificationPreferences';
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

/* ── helpers ─────────────────────────────────────────────── */

const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatTimestamp(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return TIME_FORMATTER.format(d);
}

function resolveRoute(notification, role) {
  if (notification?.redirectUrl) return notification.redirectUrl;
  if (notification?.referenceType === 'NEWS') return '/news';
  if (notification?.referenceType === 'REQUEST')
    return role === 'farmer' ? '/view-approach' : '/view-approaches-user';
  if (notification?.referenceType === 'MARKET') return '/market';
  if (notification?.referenceType === 'WEATHER') return '/weather';
  if (notification?.referenceType === 'ADMIN') return '/account';
  return null;
}

/* ── sub-components ──────────────────────────────────────── */

function NotificationItem({ notification, isRead, onRead }) {
  const handleClick = () => {
    if (!isRead) onRead(notification);
    else onRead(notification, true); // already read — navigate only
  };

  return (
    <button
      type="button"
      className={`ntf-item ${isRead ? 'ntf-item--read' : 'ntf-item--unread'}`}
      onClick={handleClick}
      aria-label={`${isRead ? '' : 'Unread: '}${notification.title}`}
    >
      {!isRead && <span className="ntf-item__dot" aria-hidden="true" />}
      <div className="ntf-item__body">
        <span className={`ntf-item__title ${isRead ? '' : 'ntf-item__title--bold'}`}>
          {notification.title}
        </span>
        <p className="ntf-item__message">{notification.message}</p>
      </div>
      <time className="ntf-item__time" dateTime={notification.createdAt}>
        {formatTimestamp(notification.createdAt)}
      </time>
    </button>
  );
}

function AlertItem({ alert, onAcknowledge, onNavigate }) {
  return (
    <article className="ntf-alert">
      <div className="ntf-alert__body">
        <strong className="ntf-alert__title">{alert.title}</strong>
        <p className="ntf-alert__message">{alert.message}</p>
        <time className="ntf-alert__time" dateTime={alert.createdAt}>
          {formatTimestamp(alert.createdAt)}
        </time>
      </div>
      <div className="ntf-alert__actions">
        {onNavigate && (
          <button type="button" className="ntf-alert__btn ntf-alert__btn--ghost" onClick={onNavigate}>
            View
          </button>
        )}
        <button type="button" className="ntf-alert__btn" onClick={() => onAcknowledge(alert)}>
          Acknowledge
        </button>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="ntf-empty" role="status">
      <div className="ntf-empty__icon" aria-hidden="true">
        <i className="fa-regular fa-bell-slash" />
      </div>
      <strong>Nothing new right now</strong>
      <p>Your notifications will appear here when there's something important.</p>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="ntf-skeleton" aria-busy="true" aria-label="Loading notifications">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="ntf-skeleton__row">
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

/* ── main component ──────────────────────────────────────── */

export default function Notifications() {
  const navigate = useNavigate();
  const role = getRole();
  const loggedIn = isLoggedIn();

  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const loadingRef = useRef(false);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2400);
  }, []);

  /* load data */
  useEffect(() => {
    if (!loggedIn) {
      setNotifications([]);
      setAlerts([]);
      setUnreadCount(0);
      setLoading(false);
      return undefined;
    }

    if (loadingRef.current) return undefined;
    loadingRef.current = true;
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const [page, activeAlerts, unread] = await Promise.all([
          getNotifications({ deliveryType: 'NOTIFICATION', page: 0, size: 30 }),
          getActiveAlerts(),
          countUnread(),
        ]);
        if (active) {
          setNotifications(Array.isArray(page?.content) ? page.content : []);
          setAlerts(Array.isArray(activeAlerts) ? activeAlerts : []);
          setUnreadCount(Number(unread?.count ?? 0));
        }
      } catch (err) {
        if (active) showToast(err.message || 'Failed to load notifications.', 'error');
      } finally {
        if (active) setLoading(false);
        loadingRef.current = false;
      }
    })();

    return () => { active = false; };
  }, [loggedIn, showToast]);

  /* mark as read on click */
  const handleNotificationRead = useCallback(
    async (notification, alreadyRead = false) => {
      if (!alreadyRead) {
        // Optimistic UI update
        setReadIds((prev) => new Set(prev).add(notification.id));
        setUnreadCount((prev) => Math.max(prev - 1, 0));

        try {
          await markAsRead(notification.id);
        } catch (err) {
          // Revert on failure
          setReadIds((prev) => {
            const next = new Set(prev);
            next.delete(notification.id);
            return next;
          });
          setUnreadCount((prev) => prev + 1);
          showToast(err.message || 'Failed to mark as read.', 'error');
          return;
        }
      }

      const target = resolveRoute(notification, role);
      if (target) navigate(target);
    },
    [role, navigate, showToast],
  );

  /* mark all read */
  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setReadIds((prev) => {
        const next = new Set(prev);
        notifications.forEach((n) => next.add(n.id));
        return next;
      });
      setUnreadCount(0);
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to mark all as read.', 'error');
    }
  }, [notifications, showToast]);

  /* acknowledge alert */
  const handleAlertAck = useCallback(
    async (alert) => {
      try {
        await acknowledgeAlert(alert.id);
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
        showToast('Alert acknowledged.', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to acknowledge alert.', 'error');
      }
    },
    [showToast],
  );

  /* derived */
  const isNotificationRead = useCallback(
    (n) => readIds.has(n.id) || n.read === true,
    [readIds],
  );

  const unreadDisplay = useMemo(() => {
    const count = notifications.filter((n) => !isNotificationRead(n)).length;
    return Math.max(count, unreadCount);
  }, [notifications, unreadCount, isNotificationRead]);

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
        {/* ── sidebar / main panel ── */}
        <section className="ntf-panel" aria-label="Notifications">
          {/* header */}
          <header className="ntf-panel__header">
            <div className="ntf-panel__title-group">
              <h1 className="ntf-panel__title">Notifications</h1>
              {unreadDisplay > 0 && (
                <span className="ntf-panel__badge" aria-label={`${unreadDisplay} unread`}>
                  {unreadDisplay}
                </span>
              )}
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
                onClick={() => setPrefsOpen(true)}
                aria-label="Notification preferences"
              >
                <i className="fa-solid fa-gear" aria-hidden="true" />
                <span>Preferences</span>
              </button>
            </div>
          </header>

          {/* body */}
          <div className="ntf-panel__body">
            {loading && <SkeletonLoader />}

            {!loading && (
              <>
                {/* alerts section */}
                {alerts.length > 0 && (
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
                          onAcknowledge={handleAlertAck}
                          onNavigate={
                            resolveRoute(alert, role)
                              ? () => navigate(resolveRoute(alert, role))
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* notifications list */}
                {notifications.length > 0 && (
                  <section className="ntf-section" aria-label="Recent notifications">
                    <div className="ntf-section__head">
                      <strong>Recent</strong>
                      <span className="ntf-section__count">{notifications.length}</span>
                    </div>
                    <div className="ntf-section__list">
                      {notifications.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          isRead={isNotificationRead(n)}
                          onRead={handleNotificationRead}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* empty */}
                {alerts.length === 0 && notifications.length === 0 && <EmptyState />}
              </>
            )}
          </div>
        </section>
      </div>

      {/* preferences overlay */}
      <NotificationPreferences
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        onToast={showToast}
      />
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
