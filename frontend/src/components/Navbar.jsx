import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getRole } from '../lib/auth';
import agrigateIcon from '../images/agrigate.jpg';

function navByRole(role) {
  const base = [{ label: 'Home', to: '/' }];
  if (!role) return [...base, { label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }];

  if (role === 'farmer') {
    return [
      ...base,
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
    { label: 'Browse Crops', to: '/view-all-crops' },
    { label: 'Favorites', to: '/favorites' },
    { label: 'Cart', to: '/cart' },
    { label: 'My Requests', to: '/view-approaches-user' },
    { label: 'Account', to: '/account' },
  ];
}

export default function Navbar() {
  const location = useLocation();
  const [role, setRole] = useState(getRole());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const syncRole = () => setRole(getRole());
    window.addEventListener('storage', syncRole);
    window.addEventListener('auth:expired', syncRole);
    syncRole();
    return () => {
      window.removeEventListener('storage', syncRole);
      window.removeEventListener('auth:expired', syncRole);
    };
  }, [location.pathname]);

  const items = navByRole(role);
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <header className="site-header">
      <div className="site-header__inner ag-container">
        <Link className="brand" to="/" onClick={() => setMobileOpen(false)}>
          <img src={agrigateIcon} alt="AagriGgate logo" className="brand__logo" />
          <span className="brand__text">AagriGgate</span>
        </Link>

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
      </div>
    </header>
  );
}
