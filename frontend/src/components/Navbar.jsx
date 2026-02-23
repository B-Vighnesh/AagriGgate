import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getRole } from '../lib/auth';
import agrigateIcon from '../images/agrigate.jpg';

/** Build nav items based on current role */
function useNavItems(role) {
  const base = [{ label: 'Home', to: '/' }];

  if (!role) {
    return [...base, { label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }];
  }

  if (role === 'farmer') {
    return [
      ...base,
      { label: 'Market', to: '/market' },
      { label: 'Weather', to: '/weather' },
      {
        label: 'Trade', to: '#', dropdown: [
          { label: 'Add Crop', to: '/add-crop' },
          { label: 'My Crops', to: '/view-crop' },
          { label: 'View Requests', to: '/view-approach' },
        ],
      },
      { label: 'Account', to: '/account' },
    ];
  }

  // buyer
  return [
    ...base,
    {
      label: 'Trade', to: '#', dropdown: [
        { label: 'Browse Crops', to: '/view-all-crops' },
        { label: 'Track Requests', to: '/view-approaches-user' },
      ],
    },
    { label: 'Account', to: '/account' },
  ];
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(getRole);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null); // label of open dropdown

  /* Sync role whenever localStorage changes (login / logout) */
  useEffect(() => {
    const sync = () => setRole(getRole());
    window.addEventListener('storage', sync);

    // Fallback: watch on route changes (SPA doesn't fire 'storage' for same-tab writes)
    sync();

    return () => window.removeEventListener('storage', sync);
  }, [location.pathname]);

  const navItems = useNavItems(role);

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const closeAll = () => { setMenuOpen(false); setDropdown(null); };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeAll}>
          <img
            src={agrigateIcon}
            alt="AgriGate Logo"
            className="w-9 h-9 rounded-lg object-cover"
          />
          <span className="text-lg font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            Agri<span style={{ color: 'var(--color-accent)' }}>Gate</span>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <ul className="hidden md:flex items-center gap-1">
          {navItems.map((item) =>
            item.dropdown ? (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => setDropdown(item.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{ color: 'var(--color-text)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {item.label}
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdown === item.label ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.855a.75.75 0 111.08 1.04l-4.25 4.415a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute top-full left-0 mt-1 w-48 card py-1.5 transition-all duration-200 origin-top ${dropdown === item.label ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                >
                  {item.dropdown.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      onClick={closeAll}
                      className="block px-4 py-2 text-sm transition-colors duration-150"
                      style={{ color: 'var(--color-text)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </li>
            ) : (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={closeAll}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive(item.to) ? 'var(--color-primary)' : 'var(--color-text)',
                    background: isActive(item.to) ? 'rgba(45,106,79,0.1)' : 'transparent',
                    fontWeight: isActive(item.to) ? 700 : 500,
                  }}
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* ── Mobile Hamburger ── */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ color: 'var(--color-text)' }} />
          <span className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} style={{ background: 'var(--color-text)' }} />
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ color: 'var(--color-text)' }} />
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-screen border-t' : 'max-h-0'
          }`}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <ul className="px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) =>
            item.dropdown ? (
              <li key={item.label}>
                <button
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between"
                  style={{ color: 'var(--color-primary-dark)' }}
                  onClick={() => setDropdown(dropdown === item.label ? null : item.label)}
                >
                  {item.label}
                  <svg className={`w-4 h-4 transition-transform ${dropdown === item.label ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.855a.75.75 0 111.08 1.04l-4.25 4.415a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {dropdown === item.label && (
                  <ul className="ml-4 mt-1 flex flex-col gap-0.5">
                    {item.dropdown.map((sub) => (
                      <li key={sub.to}>
                        <Link
                          to={sub.to}
                          onClick={closeAll}
                          className="block px-3 py-2 rounded-lg text-sm"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={closeAll}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{
                    color: isActive(item.to) ? 'var(--color-primary)' : 'var(--color-text)',
                    background: isActive(item.to) ? 'rgba(45,106,79,0.08)' : 'transparent',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
}
