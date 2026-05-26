import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import agrigateIcon from '../images/logo3.png';
import { getRole, isLoggedIn } from '../lib/auth';
import {
  acknowledgeAlert,
  getActiveAlerts,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '../lib/notificationApi';
import { resolveNotificationRoute, sortNotificationsByDate } from '../lib/notificationRouting';
import { useNavbarCounts } from '../context/NavbarCountContext';

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
    { type: 'link', label: 'Mandi Prices', to: '/market' },
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
      { type: 'link', label: 'Weather', to: '/weather' },
      { type: 'link', label: 'News', to: '/news' },
      { type: 'link', label: 'About Us', to: '/about-us' },
    ];
  }

  return [
    { type: 'link', label: 'Home', to: '/' },
    { type: 'link', label: 'Marketplace', to: '/view-all-crops' },
    { type: 'link', label: 'Mandi Prices', to: '/market' },
    { type: 'link', label: 'My Requests', to: '/view-approaches-user' },
    { type: 'link', label: 'News', to: '/news' },
    { type: 'link', label: 'About Us', to: '/about-us' },
  ];
}

function mobileDrawerItemsByRole(role, loggedIn) {
  if (!loggedIn) {
    return [
      { type: 'link', label: 'Login', to: '/login' },
      { type: 'link', label: 'Register', to: '/register' },
    ];
  }

  const items = [
    { type: 'link', label: 'My Account', to: '/account' },
    { type: 'link', label: 'Account Settings', to: '/settings' },
    { type: 'link', label: 'Help & Support', to: '/enquiry' },
  ];

  if (role === 'farmer') {
    items.splice(1, 0, { type: 'link', label: 'Add Crop', to: '/add-crop' });
  }

  return items;
}

function bottomNavItemsByRole(role) {
  if (!role) {
    return [];
  }

  if (role === 'buyer') {
    return [
      { label: 'Home', to: '/', icon: 'fa-solid fa-house' },
      {
        label: 'Market',
        to: '/view-all-crops',
        icon: 'fa-solid fa-store',
        matchPrefixes: ['/view-all-crops', '/view-details'],
      },
      {
        label: 'Requests',
        to: '/view-approaches-user',
        icon: 'fa-regular fa-clock',
        matchPrefixes: ['/view-approaches-user', '/requests'],
      },
      {
        label: 'News',
        to: '/news',
        icon: 'fa-regular fa-newspaper',
        matchPrefixes: ['/news'],
      },
      {
        label: 'Mandi Prices',
        to: '/market',
        icon: 'fa-solid fa-scale-balanced',
        matchPrefixes: ['/market'],
      },
    ];
  }

  return [
    { label: 'Home', to: '/', icon: 'fa-solid fa-house' },
    {
      label: 'Market',
      to: '/view-all-crops',
      icon: 'fa-solid fa-store',
      matchPrefixes: ['/view-all-crops', '/view-details'],
    },
    {
      label: role === 'farmer' ? 'My Crops' : 'Crops',
      to: role === 'farmer' ? '/view-crop' : '/view-all-crops',
      icon: 'fa-solid fa-seedling',
      matchPrefixes: role === 'farmer' ? ['/view-crop', '/add-crop', '/update-crop', '/delete-crop'] : ['/view-all-crops'],
    },
    {
      label: 'Requests',
      to: role === 'farmer' ? '/view-approach' : '/view-approaches-user',
      icon: 'fa-regular fa-clock',
      matchPrefixes: ['/view-approach', '/view-approaches-user', '/view-approaches/farmer', '/requests'],
    },
    {
      label: 'Insights',
      to: '/insights',
      icon: 'fa-solid fa-chart-line',
      matchPrefixes: ['/insights', '/market', '/weather', '/news'],
    },
  ];
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    unreadMessages,
    unreadRequests,
    unreadNotifications,
    setUnreadNotifications,
  } = useNavbarCounts();
  const [role, setRole] = useState(getRole());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 760,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdownKey, setOpenDropdownKey] = useState('');
  const [hoverLockedDropdownKey, setHoverLockedDropdownKey] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationOverlayOpen, setNotificationOverlayOpen] = useState(false);
  const [notificationPreviewLoading, setNotificationPreviewLoading] = useState(false);
  const [notificationPreview, setNotificationPreview] = useState([]);
  const mobileNavRef = useRef(null);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notificationOverlayRef = useRef(null);
  const dropdownCloseTimeoutRef = useRef(null);

  useEffect(() => {
    const syncRole = () => {
      setRole(getRole());
      setLoggedIn(isLoggedIn());
    };
    window.addEventListener('storage', syncRole);
    window.addEventListener('auth:changed', syncRole);
    window.addEventListener('auth:expired', syncRole);
    syncRole();
    return () => {
      window.removeEventListener('storage', syncRole);
      window.removeEventListener('auth:changed', syncRole);
      window.removeEventListener('auth:expired', syncRole);
    };
  }, [location.pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 760px)');
    const updateViewport = (event) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdownKey('');
    setHoverLockedDropdownKey('');
    setProfileMenuOpen(false);
    setNotificationOverlayOpen(false);
  }, [location.pathname]);

  useEffect(() => () => {
    if (dropdownCloseTimeoutRef.current) {
      window.clearTimeout(dropdownCloseTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!notificationOverlayOpen) return undefined;

    const handleClickOutside = (event) => {
      if (notificationOverlayRef.current && !notificationOverlayRef.current.contains(event.target)) {
        setNotificationOverlayOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOverlayOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

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
    if (!openDropdownKey || mobileOpen) return undefined;

    const handleOutsideDesktopDropdown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdownKey('');
      }
    };

    document.addEventListener('mousedown', handleOutsideDesktopDropdown);
    return () => document.removeEventListener('mousedown', handleOutsideDesktopDropdown);
  }, [openDropdownKey, mobileOpen]);

  const items = navByRole(role);
  const bottomNavItems = bottomNavItemsByRole(role);
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));
  const isDropdownActive = (item) => item.children?.some((child) => isActive(child.to));
  const isBottomNavActive = (item) => {
    if (item.matchPrefixes?.some((prefix) => location.pathname.startsWith(prefix))) {
      return true;
    }
    return isActive(item.to);
  };
  const showMobileBottomNav = loggedIn
    && isMobileViewport
    && !location.pathname.startsWith('/chat')
    && !['/login', '/register', '/logout', '/forgot-password', '/404'].includes(location.pathname);
  const showMobileDrawer = isMobileViewport && !showMobileBottomNav;
  const navItemsToRender = showMobileDrawer ? mobileDrawerItemsByRole(role, loggedIn) : items;
  const isRequestLink = (to) => to === '/view-approach' || to === '/view-approaches-user';

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
    setNotificationOverlayOpen(false);
    setProfileMenuOpen((prev) => !prev);
  };

  const loadNotificationPreview = async () => {
    setNotificationPreviewLoading(true);
    try {
      const [notificationsResult, alertsResult] = await Promise.allSettled([
        getNotifications({ deliveryType: 'NOTIFICATION', page: 0, size: 10 }),
        getActiveAlerts(),
      ]);

      const notifications = notificationsResult.status === 'fulfilled'
        ? (Array.isArray(notificationsResult.value?.content) ? notificationsResult.value.content : [])
        : [];
      const alerts = alertsResult.status === 'fulfilled'
        ? (Array.isArray(alertsResult.value) ? alertsResult.value : [])
        : [];

      const unreadNotifications = notifications.filter((item) => item?.isRead !== true);
      const unreadAlerts = alerts.filter((item) => item?.isAcknowledged !== true);
      setNotificationPreview(sortNotificationsByDate([...unreadAlerts, ...unreadNotifications]).slice(0, 5));
    } catch {
      setNotificationPreview([]);
    } finally {
      setNotificationPreviewLoading(false);
    }
  };

  const handleNotificationBellClick = async () => {
    setProfileMenuOpen(false);
    setMobileOpen(false);
    const nextOpen = !notificationOverlayOpen;
    setNotificationOverlayOpen(nextOpen);
    if (nextOpen) {
      await loadNotificationPreview();
    }
  };

  const handlePreviewOpen = async (item) => {
    try {
      if ((item.deliveryType || '').toUpperCase() === 'ALERT') {
        await acknowledgeAlert(item.id);
      } else if (item.isRead !== true) {
        await markAsRead(item.id);
        const nextCount = Math.max(unreadNotifications - 1, 0);
        setUnreadNotifications(nextCount);
        window.dispatchEvent(new CustomEvent('notifications:count-updated', {
          detail: { count: nextCount },
        }));
      }
    } catch {
      // still navigate when possible so the click does not feel broken
    }

    setNotificationOverlayOpen(false);
    const target = resolveNotificationRoute(item, role);
    if (target) {
      navigate(target);
    } else {
      navigate('/notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setUnreadNotifications(0);
      setNotificationPreview([]);
      window.dispatchEvent(new CustomEvent('notifications:count-updated', {
        detail: { count: 0 },
      }));
    } catch {
      // Keep the overlay open so the user can still open the full notifications page.
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner ag-container">
          <Link className="brand" to="/" onClick={() => setMobileOpen(false)}>
            <img src={agrigateIcon} alt="AagriGgate logo" className="brand__logo" />
            <span className="brand__text">AagriGgate</span>
          </Link>

          <div className="site-header__actions">
            {!showMobileBottomNav ? (
              <nav ref={(node) => { navRef.current = node; mobileNavRef.current = node; }} className={`site-nav ${mobileOpen ? 'site-nav--open' : ''}`}>
                {navItemsToRender.map((item) => {
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
                      <span>{item.label}</span>
                      {isRequestLink(item.to) && unreadRequests > 0 ? (
                        <span className="site-nav__badge">{unreadRequests}</span>
                      ) : null}
                    </Link>
                  );
                })}


              </nav>
            ) : null}

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
                <i className="fa-regular fa-message" aria-hidden="true" />
                {unreadMessages > 0 ? <span className="notification-bell__badge">{unreadMessages}</span> : null}
              </Link>
            ) : null}

            {loggedIn ? (
              <div className="notification-bell" ref={notificationOverlayRef}>
                <button
                  type="button"
                  className={`notification-bell__button ${isActive('/notifications') || notificationOverlayOpen ? 'notification-bell__button--active' : ''}`}
                  aria-label="View notifications"
                  data-tooltip="Notifications"
                  aria-expanded={notificationOverlayOpen}
                  onClick={handleNotificationBellClick}
                >
                  <i className="fa-regular fa-bell" aria-hidden="true" />
                  {unreadNotifications > 0 ? <span className="notification-bell__badge">{unreadNotifications}</span> : null}
                </button>

                {notificationOverlayOpen ? (
                  <div className="notification-overlay" role="dialog" aria-label="Latest notifications">
                    <div className="notification-overlay__head">
                      <strong>Unread Notifications</strong>
                      {notificationPreview.length > 0 ? (
                        <button
                          type="button"
                          className="notification-overlay__show-all"
                          onClick={handleMarkAllRead}
                        >
                          Mark All Read
                        </button>
                      ) : null}
                    </div>

                    <div className="notification-overlay__body">
                      {notificationPreviewLoading ? (
                        <div className="notification-overlay__state">Loading latest updates...</div>
                      ) : null}

                      {!notificationPreviewLoading && notificationPreview.length === 0 ? (
                        <div className="notification-overlay__state">No new notifications.</div>
                      ) : null}

                      {!notificationPreviewLoading && notificationPreview.length > 0 ? (
                        <div className="notification-overlay__list">
                          {notificationPreview.map((item) => (
                            <button
                              key={`${item.deliveryType}-${item.id}`}
                              type="button"
                              className={`notification-overlay__item ${item.isRead === true ? '' : 'notification-overlay__item--unread'}`}
                              onClick={() => handlePreviewOpen(item)}
                            >
                              <div className="notification-overlay__item-main">
                                <span className="notification-overlay__item-title">{item.title}</span>
                                <span className="notification-overlay__item-meta">
                                  {item.deliveryType || 'NOTIFICATION'}
                                </span>
                              </div>
                              <span className="notification-overlay__item-message">{item.message}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="notification-overlay__footer">
                      <button
                        type="button"
                        className="notification-overlay__show-all"
                        onClick={() => {
                          setNotificationOverlayOpen(false);
                          navigate('/notifications');
                        }}
                      >
                        {notificationPreview.length >= 5 ? 'Show More' : 'Show All'}
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

            {showMobileDrawer ? (
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
            ) : null}
          </div>
        </div>
      </header>
      {showMobileBottomNav ? (
        <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
          {bottomNavItems.map((item) => (
            <Link
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={`mobile-bottom-nav__item ${isBottomNavActive(item) ? 'mobile-bottom-nav__item--active' : ''}`}
              onClick={() => {
                setMobileOpen(false);
                setOpenDropdownKey('');
                setProfileMenuOpen(false);
                setNotificationOverlayOpen(false);
              }}
            >
              <span className="mobile-bottom-nav__icon-wrap">
                <i className={item.icon} aria-hidden="true" />
                {isRequestLink(item.to) && unreadRequests > 0 ? (
                  <span className="mobile-bottom-nav__badge">{unreadRequests}</span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}
