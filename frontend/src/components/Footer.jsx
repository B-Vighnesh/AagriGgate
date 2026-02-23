import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>AagriGgate</h3>
          <p>Connecting farmers directly with buyers for fair and transparent trade.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/#faq">FAQ</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
            <li><Link to="/#ts">Terms</Link></li>
            <li><Link to="/#pp">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <p>webappfarmer@gmail.com</p>
          <p>+91 8618402581</p>
          <p>Mangalore, Karnataka</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {year} AagriGgate. All rights reserved.</span>
        <span>Made with care for Indian farmers</span>
      </div>
    </footer>
  );
}
