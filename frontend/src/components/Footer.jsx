import React from 'react';
import { Link } from 'react-router-dom';
import { getRole } from '../lib/auth';

const insightLinks = [
  { label: 'Mandi Prices', to: '/market' },
  { label: 'Weather', to: '/weather' },
  { label: 'News', to: '/news' },
  { label: 'Contact Us', to: '/contact-us' },
];

const roleLinks = {
  farmer: [
    { label: 'My Crops', to: '/view-crop' },
    { label: 'Add Crop', to: '/add-crop' },
    { label: 'Requests', to: '/view-approach' },
    { label: 'Account', to: '/account' },
  ],
  buyer: [
    { label: 'Browse Crops', to: '/view-all-crops' },
    { label: 'My Requests', to: '/view-approaches-user' },
    { label: 'Account', to: '/account' },
  ],
};

function LoggedInFooter({ role, year }) {
  const primaryLinks = roleLinks[role] || roleLinks.farmer;
  const roleTitle = role === 'buyer' ? 'Buyer Tools' : 'Farmer Tools';

  return (
    <footer className="site-footer site-footer--logged-in">
      <div className="ag-container footer-logged-grid">
        <div className="footer-logged-brand">
          <Link to="/" className="footer-logged-brand__mark">
            <span aria-hidden="true">🌿</span>
            <strong>AagriGgate</strong>
          </Link>
          <p>Direct trade between farmers and buyers. No middlemen. No hidden charges.</p>
        </div>

        <div className="footer-logged-column">
          <h4>{roleTitle}</h4>
          <ul>
            {primaryLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-logged-column">
          <h4>Insights</h4>
          <ul>
            {insightLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-logged-column footer-logged-column--connect">
          <h4>Connect</h4>
          <ul>
            <li><a href="mailto:webappfarmer@gmail.com">Email</a></li>
            <li><a href="tel:+918618402581">Phone</a></li>
            <li><span>Mangalore, Karnataka</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-wrap">
        <div className="ag-container footer-bottom footer-logged-bottom">
          <span className="footer-bottom__copyright">&copy; {year} AagriGgate. All rights reserved.</span>
          <div className="footer-logged-legal" aria-label="Legal links">
            <Link to="/#privacy">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link to="/#terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function GuestFooter({ year }) {
  const intelligenceLink = '/#intelligence';

  return (
    <footer className="site-footer">
      <div className="ag-container footer-grid">
        <div className="footer-brand">
          <span className="footer-brand__eyebrow">AagriGgate Intelligence Platform</span>
          <h3>AagriGgate</h3>
          <p>Direct trade, smarter decisions, and transparent agriculture workflows in one platform.</p>
          <p className="footer-brand__note">Built to connect farmers and buyers with more clarity, less friction, and no hidden platform charges.</p>
        </div>
        <div className="footer-section">
          <h4>Platform</h4>
          <ul>
            <li><Link to="/#problem">Problem</Link></li>
            <li><Link to="/#features">Features</Link></li>
            <li><Link to="/#trust">Trust</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Intelligence</h4>
          <ul>
            <li><Link to={intelligenceLink}>Weather</Link></li>
            <li><Link to={intelligenceLink}>Market Prices</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Future</h4>
          <ul>
            <li><Link to="/#future">Roadmap</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><Link to="/#faq">FAQ</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom-wrap">
        <div className="ag-container footer-bottom">
          <span className="footer-bottom__copyright">&copy; {year} AagriGgate. All rights reserved.</span>
          <a href="mailto:webappfarmer@gmail.com" className="footer-contact-pill">
            <span className="footer-contact-pill__label">Email</span>
            <span className="footer-contact-pill__value">webappfarmer@gmail.com</span>
          </a>
          <a href="tel:+918618402581" className="footer-contact-pill">
            <span className="footer-contact-pill__label">Phone</span>
            <span className="footer-contact-pill__value">+91 8618402581</span>
          </a>
          <span className="footer-contact-pill">
            <span className="footer-contact-pill__label">Location</span>
            <span className="footer-contact-pill__value">Mangalore, Karnataka</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const role = getRole();

  if (role === 'farmer' || role === 'buyer') {
    return <LoggedInFooter role={role} year={year} />;
  }

  return <GuestFooter year={year} />;
}
