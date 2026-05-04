import React from 'react';
import { Link } from 'react-router-dom';
import { getRole } from '../lib/auth';
import agrigateIcon from '../images/agrigate.jpg';

export default function Footer() {
  const year = new Date().getFullYear();
  const role = getRole();
  const weatherLink = role ? '/weather' : '/#intelligence';
  const marketLink = role ? '/market' : '/#intelligence';

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <img src={agrigateIcon} alt="" className="footer__logo" aria-hidden="true" />
          <span className="footer__brand-name">AagriGgate</span>
        </div>

        <div className="footer__links-grid">
          <Link className="footer__link" to="/#problem">Problem</Link>
          <Link className="footer__link" to={weatherLink}>Weather</Link>
          <Link className="footer__link" to="/#features">Features</Link>
          <Link className="footer__link" to={marketLink}>Market Prices</Link>
          <Link className="footer__link" to="/#trust">Trust</Link>
          <Link className="footer__link" to="/#future">Roadmap</Link>
          <Link className="footer__link" to="/#faq">FAQ</Link>
          <Link className="footer__link" to="/contact-us">Contact Us</Link>
        </div>

        <hr className="footer__divider" />

        <div className="footer__contact">
          <a href="mailto:webappfarmer@gmail.com">webappfarmer@gmail.com</a><br />
          <a href="tel:+918618402581">+91 86184 02581</a><br />
          <span>Mangalore, Karnataka</span>
        </div>

        <p className="footer__copy">&copy; {year} AagriGgate. All rights reserved.</p>
      </div>
    </footer>
  );
}
