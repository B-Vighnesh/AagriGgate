import React from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--color-primary-dark)', color: '#e8f5e9' }}>
      {/* Top gradient accent */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-accent))' }} />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#fff' }}>
              Agri<span style={{ color: 'var(--color-accent)' }}>Gate</span>
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#a5d6a7' }}>
              Connecting farmers directly with buyers for fair trade and better prices across India.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: 'fab fa-facebook-f', href: 'https://facebook.com', label: 'Facebook' },
                { icon: 'fab fa-twitter', href: 'https://twitter.com', label: 'Twitter' },
                { icon: 'fab fa-instagram', href: 'https://instagram.com', label: 'Instagram' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#e8f5e9' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                  <i className={`${icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#a5d6a7' }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Terms of Service', to: '/#ts' },
                { label: 'Privacy Policy', to: '/#pp' },
                { label: 'FAQ', to: '/#faq' },
                { label: 'Contact Us', to: '/contact-us' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm transition-colors duration-150"
                    style={{ color: '#c8e6c9' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#c8e6c9')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#a5d6a7' }}>
              Contact
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: '#c8e6c9' }}>
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-xs" style={{ color: 'var(--color-accent)' }} />
                <a href="mailto:webappfarmer@gmail.com" style={{ color: '#c8e6c9' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#c8e6c9')}
                >
                  webappfarmer@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-phone text-xs" style={{ color: 'var(--color-accent)' }} />
                +91 8618402581
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-xs" style={{ color: 'var(--color-accent)' }} />
                Mangalore, Karnataka
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#81c784' }}>
            © {year} AgriGate. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#81c784' }}>
            Made with ❤️ for Indian farmers
          </p>
        </div>
      </div>
    </footer>
  );
}
