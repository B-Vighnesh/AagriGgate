import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

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
            <li><a href="/#farmers">Add Crop</a></li>
            <li><a href="/#how-it-works">View Requests</a></li>
          </ul>
        </div>
        <div>
          <h4>Buyers</h4>
          <ul>
            <li><a href="/#buyers">Browse Crops</a></li>
            <li><a href="/#buyers">Post Requirement</a></li>
          </ul>
        </div>
        <div>
          <h4>Intelligence</h4>
          <ul>
            <li><a href="/#intelligence">Weather</a></li>
            <li><a href="/#intelligence">Market Prices</a></li>
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
