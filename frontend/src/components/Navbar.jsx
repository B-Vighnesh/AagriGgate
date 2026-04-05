import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import agrigateIcon from '../images/agrigate.jpg';
import NotificationPreferences from './NotificationPreferences';
import Toast from './common/Toast';
import { getRole, isLoggedIn } from '../lib/auth';
import {
  countUnread,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '../lib/notificationApi';

function navByRole(role, loggedIn) {
  const base = [{ label: 'Home', to: '/' }];
  const signedInItems = loggedIn ? [{ label: 'News', to: '/news' }] : [];
  if (!role) return [...base, ...signedInItems, { label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }];

  if (role === 'farmer') {
    return [
      ...base,
      ...signedInItems,
      { label: 'Market', to: '/market' },
      { label: 'Weather', to: '/weather' },
      { label: 'Browse Crops', to: '/view-all-crops' },
      { label: 'Add Crop', to: '/add-crop' },
      { label: 'My Crops', to: '/view-crop' },
      { label: 'Requests', to: '/view-approach' },
      { label: 'Account', to: '/account' },
    ];
  }

  return [
    ...base,
    ...signedInItems,
    { label: 'Browse Crops', to: '/view-all-crops' },
    { label: 'Favorites', to: '/favorites' },
    { label: 'Cart', to: '/cart' },
    { label: 'My Requests', to: '/view-approaches-user' },
    { label: 'Account', to: '/account' },
  ];
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(getRole());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const drawerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2400);
  }, []);

  useEffect(() => {
    const syncRole = () => {
      setRole(getRole());
      setLoggedIn(isLoggedIn());
    };
    window.addEventListener('storage', syncRole);
    window.addEventListener('auth:expired', syncRole);
    syncRole();
    return () => {
      window.removeEventListener('storage', syncRole);
      window.removeEventListener('auth:expired', syncRole);
    };
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!loggedIn) {
      setUnreadCount(0);
      setNotifications([]);
      return undefined;
    }

    let active = true;

    const loadUnreadCount = async () => {
      try {
        const payload = await countUnread();
        if (active) {
          setUnreadCount(Number(payload?.count ?? 0));
        }
      } catch {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 60000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [loggedIn]);

  useEffect(() => {
    if (!drawerOpen || !loggedIn) {
      return undefined;
    }

    let active = true;

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const page = await getNotifications({ status: 'UNREAD', page: 0, size: 10 });
        if (active) {
          setNotifications(Array.isArray(page?.content) ? page.content : []);
        }
      } catch (error) {
        if (active) {
          showToast(error.message || 'Failed to load notifications.', 'error');
        }
      } finally {
        if (active) {
          setNotificationsLoading(false);
        }
      }
    };

    loadNotifications();
    return () => {
      active = false;
    };
  }, [drawerOpen, loggedIn]);

  useEffect(() => {
    if (!drawerOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [drawerOpen]);

  const items = navByRole(role, loggedIn);
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));
  const relativeTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    []
  );

  const formatNotificationDate = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return relativeTimeFormatter.format(parsed);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
      showToast('All notifications marked as read.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to mark notifications as read.', 'error');
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markAsRead(notification.id);
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      setDrawerOpen(false);

      if (notification.referenceType === 'NEWS') {
        navigate('/news');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update notification.', 'error');
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__inner ag-container">
        <Link className="brand" to="/" onClick={() => setMobileOpen(false)}>
          <img src={agrigateIcon} alt="AagriGgate logo" className="brand__logo" />
          <span className="brand__text">AagriGgate</span>
        </Link>

        <div className="site-header__actions">
          <nav className={`site-nav ${mobileOpen ? 'site-nav--open' : ''}`}>
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`site-nav__link ${isActive(item.to) ? 'site-nav__link--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {loggedIn ? (
            <div className="notification-bell" ref={drawerRef}>
              <button
                type="button"
                className={`notification-bell__button ${drawerOpen ? 'notification-bell__button--active' : ''}`}
                aria-label="Open notifications"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen((prev) => !prev)}
              >
                <i className="fa-regular fa-bell" aria-hidden="true" />
                {unreadCount > 0 ? <span className="notification-bell__badge">{unreadCount}</span> : null}
              </button>

              {drawerOpen ? (
                <div className="notification-drawer">
                  <div className="notification-drawer__head">
                    <div>
                      <strong>Notifications</strong>
                      <span>{unreadCount} unread</span>
                    </div>
                    <button
                      type="button"
                      className="notification-drawer__action"
                      onClick={handleMarkAllRead}
                      disabled={!notifications.length}
                    >
                      Mark All Read
                    </button>
                  </div>

                  <div className="notification-drawer__body">
                    {notificationsLoading ? (
                      <p className="notification-drawer__empty">Loading notifications...</p>
                    ) : null}

                    {!notificationsLoading && notifications.length === 0 ? (
                      <p className="notification-drawer__empty">No unread notifications right now.</p>
                    ) : null}

                    {!notificationsLoading && notifications.length > 0 ? (
                      <div className="notification-drawer__list">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            className="notification-item"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="notification-item__copy">
                              <strong>{notification.title}</strong>
                              <p>{notification.body}</p>
                            </div>
                            <span className="notification-item__meta">
                              <span className="notification-item__type">{notification.type}</span>
                              <span>{formatNotificationDate(notification.createdAt)}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="notification-drawer__footer">
                    <button
                      type="button"
                      className="notification-drawer__preferences"
                      onClick={() => {
                        setDrawerOpen(false);
                        setPreferencesOpen(true);
                      }}
                    >
                      Preferences
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <NotificationPreferences
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        onToast={showToast}
      />
      <Toast message={toast.message} type={toast.type} />
    </header>
  );
}
