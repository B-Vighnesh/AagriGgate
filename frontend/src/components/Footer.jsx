import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="ag-container footer-grid">
        <div className="footer-brand">
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
            <li><Link to="/weather">Weather</Link></li>
            <li><Link to="/market">Market Prices</Link></li>
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
      <div className="footer-bottom">
        <span>&copy; {year} AagriGgate. All rights reserved.</span>
        <span>webappfarmer@gmail.com</span>
        <span>+91 8618402581</span>
        <span>Mangalore, Karnataka</span>
      </div>
    </footer>
  );
}
