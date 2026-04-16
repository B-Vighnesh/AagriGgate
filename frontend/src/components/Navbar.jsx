import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import agrigateIcon from '../images/agrigate.jpg';
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

function navByRole(role) {
  if (!role) {
    return [
      { type: 'link', label: 'Home', to: '/' },
      { type: 'link', label: 'Login', to: '/login' },
      { type: 'link', label: 'Register', to: '/register' },
    ];
  }

  const shared = [
    { type: 'link', label: 'Home', to: '/' },
    { type: 'link', label: 'Marketplace', to: '/view-all-crops' },
    { type: 'link', label: 'Market Intelligence', to: '/market' },
  ];

  if (role === 'farmer') {
    return [
      ...shared,
      {
        type: 'dropdown',
        label: 'Crops',
        key: 'crops',
        children: [
          { label: 'Add Crops', to: '/add-crop' },
          { label: 'My Crops', to: '/view-crop' },
        ],
      },
      { type: 'link', label: 'Requests', to: '/view-approach' },
      {
        type: 'dropdown',
        label: 'Insights',
        key: 'insights',
        children: [
          { label: 'Weather', to: '/weather' },
          { label: 'News', to: '/news' },
        ],
      },
    ];
  }

  return [
    { type: 'link', label: 'Home', to: '/' },
    { type: 'link', label: 'Marketplace', to: '/view-all-crops' },
    { type: 'link', label: 'My Requests', to: '/view-approaches-user' },
    {
      type: 'dropdown',
      label: 'Insights',
      key: 'insights',
      children: [
        { label: 'News', to: '/news' },
      ],
    },
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
  const [alerts, setAlerts] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDropdownKey, setOpenDropdownKey] = useState('');
  const [hoverLockedDropdownKey, setHoverLockedDropdownKey] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const drawerRef = useRef(null);
  const mobileNavRef = useRef(null);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const profileMenuRef = useRef(null);
  const dropdownCloseTimeoutRef = useRef(null);

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
    setOpenDropdownKey('');
    setHoverLockedDropdownKey('');
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => () => {
    if (dropdownCloseTimeoutRef.current) {
      window.clearTimeout(dropdownCloseTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      setUnreadCount(0);
      setNotifications([]);
      setAlerts([]);
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
        const [page, activeAlerts] = await Promise.all([
          getNotifications({ deliveryType: 'NOTIFICATION', page: 0, size: 10 }),
          getActiveAlerts(),
        ]);
        if (active) {
          setNotifications(Array.isArray(page?.content) ? page.content : []);
          setAlerts(Array.isArray(activeAlerts) ? activeAlerts : []);
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
  }, [drawerOpen, loggedIn, showToast]);

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

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const handleOutsideMobileNav = (event) => {
      const clickedInsideNav = mobileNavRef.current?.contains(event.target);
      const clickedToggle = toggleRef.current?.contains(event.target);

      if (!clickedInsideNav && !clickedToggle) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideMobileNav);
    document.addEventListener('touchstart', handleOutsideMobileNav);
    return () => {
      document.removeEventListener('mousedown', handleOutsideMobileNav);
      document.removeEventListener('touchstart', handleOutsideMobileNav);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!openDropdownKey || mobileOpen) {
      return undefined;
    }

    const handleOutsideDesktopDropdown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdownKey('');
      }
    };

    document.addEventListener('mousedown', handleOutsideDesktopDropdown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideDesktopDropdown);
    };
  }, [openDropdownKey, mobileOpen]);

  const items = navByRole(role);
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));
  const isDropdownActive = (item) => item.children?.some((child) => isActive(child.to));
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

  const getDeliveryLabel = (notification) => notification?.deliveryType || 'NOTIFICATION';

  const getNotificationTone = (notification) => {
    if (notification?.deliveryType === 'ALERT') return 'alert';
    if (notification?.severity === 'CRITICAL') return 'critical';
    if (notification?.severity === 'HIGH') return 'high';
    return 'default';
  };

  const resolveNotificationRoute = (notification) => {
    if (notification?.redirectUrl) return notification.redirectUrl;

    if (notification?.referenceType === 'NEWS') return '/news';
    if (notification?.referenceType === 'REQUEST') return role === 'farmer' ? '/view-approach' : '/view-approaches-user';
    if (notification?.referenceType === 'MARKET') return '/market';
    if (notification?.referenceType === 'WEATHER') return '/weather';
    if (notification?.referenceType === 'ADMIN') return '/account';

    return null;
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

      const targetRoute = resolveNotificationRoute(notification);
      if (targetRoute) navigate(targetRoute);
    } catch (error) {
      showToast(error.message || 'Failed to update notification.', 'error');
    }
  };

  const handleAlertAcknowledge = async (alert) => {
    try {
      await acknowledgeAlert(alert.id);
      setAlerts((prev) => prev.filter((item) => item.id !== alert.id));
      showToast('Alert acknowledged.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to acknowledge alert.', 'error');
    }
  };

  const toggleDropdown = (key) => {
    setOpenDropdownKey((current) => {
      if (current === key) {
        setHoverLockedDropdownKey(key);
        return '';
      }

      setHoverLockedDropdownKey('');
      return key;
    });
  };

  const clearDropdownCloseTimeout = () => {
    if (dropdownCloseTimeoutRef.current) {
      window.clearTimeout(dropdownCloseTimeoutRef.current);
      dropdownCloseTimeoutRef.current = null;
    }
  };

  const scheduleDropdownClose = () => {
    clearDropdownCloseTimeout();
    dropdownCloseTimeoutRef.current = window.setTimeout(() => {
      setOpenDropdownKey('');
      setHoverLockedDropdownKey('');
      dropdownCloseTimeoutRef.current = null;
    }, 1000);
  };

  const handleAccountButtonClick = () => {
    setMobileOpen(false);
    setProfileMenuOpen((prev) => !prev);
  };

  return (
    <header className="site-header">
      <div className="site-header__inner ag-container">
        <Link className="brand" to="/" onClick={() => setMobileOpen(false)}>
          <img src={agrigateIcon} alt="AagriGgate logo" className="brand__logo" />
          <span className="brand__text">AagriGgate</span>
        </Link>

        <div className="site-header__actions">
          <nav ref={(node) => { navRef.current = node; mobileNavRef.current = node; }} className={`site-nav ${mobileOpen ? 'site-nav--open' : ''}`}>
              {items.map((item) => {
                if (item.type === 'dropdown') {
                  const isOpen = openDropdownKey === item.key;
                  const active = isDropdownActive(item);
                  return (
                    <div
                      key={item.key}
                      className={`site-nav__dropdown ${isOpen ? 'site-nav__dropdown--open' : ''}`}
                    onMouseEnter={() => {
                      clearDropdownCloseTimeout();
                      if (!mobileOpen && hoverLockedDropdownKey !== item.key) {
                        setOpenDropdownKey(item.key);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!mobileOpen) {
                        scheduleDropdownClose();
                      }
                    }}
                  >
                    <button
                      type="button"
                      className={`site-nav__link site-nav__trigger ${active ? 'site-nav__link--active' : ''}`}
                      onClick={() => {
                        toggleDropdown(item.key);
                      }}
                    >
                      <span>{item.label}</span>
                      <i className="fa-solid fa-chevron-down" aria-hidden="true" />
                    </button>
                    <div className="site-nav__menu">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => {
                            setMobileOpen(false);
                            setOpenDropdownKey('');
                          }}
                          className={`site-nav__submenu-link ${isActive(child.to) ? 'site-nav__submenu-link--active' : ''}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    setMobileOpen(false);
                    setOpenDropdownKey('');
                  }}
                  className={`site-nav__link ${isActive(item.to) ? 'site-nav__link--active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}

            {loggedIn ? (
              <Link
                to="/chat"
                className={`site-nav__utility ${isActive('/chat') ? 'site-nav__utility--active' : ''}`}
                onClick={() => {
                  setMobileOpen(false);
                  setOpenDropdownKey('');
                }}
              >
                💬 Chat
              </Link>
            ) : null}
          </nav>

          {loggedIn ? (
            <Link
              to="/chat"
              className={`header-utility-link chat-nav-shortcut ${isActive('/chat') ? 'header-utility-link--active' : ''}`}
              aria-label="Open chat"
              data-tooltip="Chat"
              onClick={() => {
                setMobileOpen(false);
                setOpenDropdownKey('');
              }}
            >
              <i className="fa-regular fa-comments" aria-hidden="true" />
            </Link>
          ) : null}

          {loggedIn ? (
            <div className="notification-bell" ref={drawerRef}>
              <button
                type="button"
                className={`notification-bell__button ${drawerOpen ? 'notification-bell__button--active' : ''}`}
                aria-label="Open notifications"
                data-tooltip="Notifications"
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
                      <span>{unreadCount} unread notifications</span>
                    </div>
                    <div className="notification-drawer__head-actions">
                      <button
                        type="button"
                        className="notification-drawer__action"
                        onClick={handleMarkAllRead}
                        disabled={!notifications.length}
                      >
                        Mark all read
                      </button>
                    </div>
                  </div>

                  <div className="notification-drawer__body">
                    {notificationsLoading ? (
                      <p className="notification-drawer__empty">Loading notifications...</p>
                    ) : null}

                    {!notificationsLoading ? (
                      <>
                        {alerts.length > 0 ? (
                          <section className="notification-drawer__section">
                            <div className="notification-drawer__section-head">
                              <strong>Active Alerts</strong>
                              <span>{alerts.length}</span>
                            </div>
                            <div className="notification-drawer__list notification-drawer__list--alerts">
                              {alerts.map((alert) => (
                                <article
                                  key={alert.id}
                                  className={`notification-item notification-item--${getNotificationTone(alert)}`}
                                >
                                  <div className="notification-item__copy">
                                    <div className="notification-item__title-row">
                                      <strong>{alert.title}</strong>
                                      <span className="notification-item__severity">{alert.severity || 'ALERT'}</span>
                                    </div>
                                    <p>{alert.message}</p>
                                  </div>
                                  <div className="notification-item__meta">
                                    <span className="notification-item__type">{getDeliveryLabel(alert)}</span>
                                    <span>{formatNotificationDate(alert.createdAt)}</span>
                                  </div>
                                  <div className="notification-item__actions">
                                    {resolveNotificationRoute(alert) ? (
                                      <button
                                        type="button"
                                        className="notification-item__action notification-item__action--ghost"
                                        onClick={() => {
                                          setDrawerOpen(false);
                                          navigate(resolveNotificationRoute(alert));
                                        }}
                                      >
                                        View
                                      </button>
                                    ) : null}
                                    <button
                                      type="button"
                                      className="notification-item__action"
                                      onClick={() => handleAlertAcknowledge(alert)}
                                    >
                                      Acknowledge
                                    </button>
                                  </div>
                                </article>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        {notifications.length > 0 ? (
                          <section className="notification-drawer__section">
                            <div className="notification-drawer__section-head">
                              <strong>Recent Notifications</strong>
                              <span>{notifications.length}</span>
                            </div>
                            <div className="notification-drawer__list">
                              {notifications.map((notification) => (
                                <button
                                  key={notification.id}
                                  type="button"
                                  className={`notification-item notification-item--${getNotificationTone(notification)}`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <div className="notification-item__copy">
                                    <div className="notification-item__title-row">
                                      <strong>{notification.title}</strong>
                                      {notification.severity ? (
                                        <span className="notification-item__severity">{notification.severity}</span>
                                      ) : null}
                                    </div>
                                    <p>{notification.message}</p>
                                  </div>
                                  <span className="notification-item__meta">
                                    <span className="notification-item__type">{getDeliveryLabel(notification)}</span>
                                    <span>{formatNotificationDate(notification.createdAt)}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        {alerts.length === 0 && notifications.length === 0 ? (
                          <div className="notification-drawer__empty-state">
                            <div className="notification-drawer__empty-icon" aria-hidden="true">
                              <i className="fa-regular fa-bell-slash" />
                            </div>
                            <strong>Nothing new right now</strong>
                            <p>Your alerts and notifications will appear here when the system has something important for you.</p>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>

                  <div className="notification-drawer__footer">
                    <div className="notification-drawer__footer-copy">
                      <strong>Need more control?</strong>
                      <span>Adjust category delivery types and defaults.</span>
                    </div>
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

          {loggedIn ? (
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className={`header-account-link ${profileMenuOpen ? 'header-account-link--active' : ''}`}
                aria-label="Account"
                data-tooltip="Account"
                aria-expanded={profileMenuOpen}
                onClick={handleAccountButtonClick}
              >
                <i className="fa-regular fa-user" aria-hidden="true" />
              </button>

              {profileMenuOpen ? (
                <div className="profile-menu__panel">
                  <Link
                    to="/account"
                    className={`profile-menu__item ${isActive('/account') ? 'profile-menu__item--active' : ''}`}
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <i className="fa-regular fa-user" aria-hidden="true" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className={`profile-menu__item ${isActive('/settings') ? 'profile-menu__item--active' : ''}`}
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <i className="fa-solid fa-gear" aria-hidden="true" />
                    <span>Account Settings</span>
                  </Link>
                  <Link
                    to="/enquiry"
                    className={`profile-menu__item ${isActive('/enquiry') ? 'profile-menu__item--active' : ''}`}
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <i className="fa-regular fa-circle-question" aria-hidden="true" />
                    <span>Help &amp; Support</span>
                  </Link>
                  <button
                    type="button"
                    className="profile-menu__item profile-menu__item--danger"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('/logout');
                    }}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            ref={toggleRef}
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
