import React from 'react';
import '../assets/Footer.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
      <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-media">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: <a href="mailto:webappfarmer@gmail.com">webappfarmer@gmail.com</a></p>
          <p>Phone: 8618402581</p>
          <p>Address: Mangalore,Karnataka</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/#ts">Terms of Service</a></li>
            <li><a href="/#pp">Privacy Policy</a></li>
            <li><a href="/#faq">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Farmers' Direct Market. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
