import React from 'react';
import { Link } from 'react-router-dom';
import { getRole, getToken } from '../lib/auth';

export default function Footer() {
  const year = new Date().getFullYear();
  const role = getRole();
  const isLoggedIn = Boolean(getToken() && role);
  const farmerLink = isLoggedIn && role === 'farmer' ? '/add-crop' : '/register';
  const requestLink = isLoggedIn && role === 'farmer' ? '/view-approach' : '/register';
  const browseLink = '/view-all-crops';
  const buyerActionLink = isLoggedIn && role === 'buyer' ? '/cart' : '/register';
  const weatherLink = isLoggedIn && role === 'farmer' ? '/weather' : '/#intelligence';
  const marketLink = isLoggedIn && role === 'farmer' ? '/market' : '/#intelligence';

  return (
    <footer className="site-footer">
      <div className="ag-container footer-grid">
        <div>
          <h3>AagriGgate</h3>
          <p>Direct trade, smarter decisions, and transparent agriculture workflows in one platform.</p>
        </div>
        <div>
          <h4>Platform</h4>
          <ul>
            <li><a href="/#problem">Problem</a></li>
            <li><a href="/#features">Features</a></li>
            <li><a href="/#trust">Trust</a></li>
          </ul>
        </div>
        <div>
          <h4>Farmers</h4>
          <ul>
            <li><Link to={farmerLink}>Add Crop</Link></li>
            <li><Link to={requestLink}>View Requests</Link></li>
          </ul>
        </div>
        <div>
          <h4>Buyers</h4>
          <ul>
            <li><Link to={browseLink}>Browse Crops</Link></li>
            <li><Link to={buyerActionLink}>{isLoggedIn && role === 'buyer' ? 'Open Cart' : 'Create Account'}</Link></li>
          </ul>
        </div>
        <div>
          <h4>Intelligence</h4>
          <ul>
            <li><Link to={weatherLink}>Weather</Link></li>
            <li><Link to={marketLink}>Market Prices</Link></li>
          </ul>
        </div>
        <div>
          <h4>Future</h4>
          <ul>
            <li><a href="/#future">Roadmap</a></li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li><a href="/#faq">FAQ</a></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {year} AagriGgate. All rights reserved.</span>
        <span>webappfarmer@gmail.com | +91 8618402581 | Mangalore, Karnataka</span>
      </div>
    </footer>
  );
}
