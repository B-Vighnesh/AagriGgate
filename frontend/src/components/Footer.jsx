import React from 'react';
import { Link } from 'react-router-dom';
import { getRole } from '../lib/auth';

export default function Footer() {
  const year = new Date().getFullYear();
  const role = getRole();
  const intelligenceLink = role === 'buyer' ? '/#buyers' : '/#intelligence';

  return (
    <footer className="site-footer">
      <div className="ag-container footer-grid">
        <div className="footer-brand">
          <span className="footer-brand__eyebrow">Aagri Intelligence Platform</span>
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
          <a href="mailto:webappfarmer@gmail.com" className="footer-contact-pill">webappfarmer@gmail.com</a>
          <a href="tel:+918618402581" className="footer-contact-pill">+91 8618402581</a>
          <span className="footer-contact-pill">Mangalore, Karnataka</span>
        </div>
      </div>
    </footer>
  );
}
