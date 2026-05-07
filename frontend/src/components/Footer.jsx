import React from 'react';
import { Link } from 'react-router-dom';
import { getRole } from '../lib/auth';

const insightLinks = {
  farmer: [
    { label: 'Mandi Prices', to: '/market' },
    { label: 'Weather', to: '/weather' },
    { label: 'News', to: '/news' },
  ],

  buyer: [
    { label: 'Mandi Prices', to: '/market' },
    { label: 'News', to: '/news' },
  ],
};

const companyLinks = [
  { label: 'About us', to: '/about-us' },
  { label: 'Contact Us', to: '/contact-us' },
];

const roleLinks = {
  farmer: [
    { label: 'My Crops', to: '/view-crop' },
    { label: 'Add Crop', to: '/add-crop' },
    { label: 'Requests', to: '/view-approach' },
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
            <strong>AagriGgate</strong>
          </Link>
          <p>Trade. Decide. Grow. Everything a farmer needs, in one platform</p>
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
            {(insightLinks[role] || []).map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-logged-column">
          <h4>Company</h4>
          <ul>
            {companyLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        
      </div>

     <div className="footer-bottom-wrap">
        <div className="ag-container footer-bottom">
          <span className="footer-bottom__copyright">&copy; {year} AagriGgate. All rights reserved.</span>
         
          <span className="footer-contact-pill">
            <span className="footer-contact-pill__value">Mangalore, Karnataka</span>
          </span>
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

        {/* Brand */}
        <div className="footer-brand">
          <h3>AagriGgate</h3>
          <p>Trade. Decide. Grow. Everything a farmer needs, in one platform.</p>
        </div>

        {/* Buyer Tools */}
        <div className="footer-section">
          <h4>Buyer Tools</h4>
          <ul>
            <li><Link to="/view-all-crops">Browse Crops</Link></li>
            <li><Link to="/view-all-crops?filter=urgent">Urgent Crops</Link></li>
            <li><Link to="/view-all-crops?filter=waste">Waste Crops</Link></li>
            <li><Link to="/view-all-crops?filter=discount">Discount Listings</Link></li>
            <li><Link to="/view-approach">My Requests</Link></li>
          </ul>
        </div>

        {/* Insights */}
        <div className="footer-section">
          <h4>Insights</h4>
          <ul>
            <li><Link to="/market">Mandi Prices</Link></li>
            <li><Link to="/weather">Weather Planner</Link></li>
            <li><Link to="/news">Agriculture News</Link></li>
            <li><Link to={intelligenceLink}>Market Intelligence</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about-us">About us</Link></li>
            <li><Link to="/#problem">Problem we solve</Link></li>
            <li><Link to="/#future">Roadmap</Link></li>
            <li><Link to="/#faq">FAQ</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>

        {/* Get Started */}
        <div className="footer-section">
          <h4>Get Started</h4>
          <ul>
            <li><Link to="/register">Sign Up Free</Link></li>
            <li><Link to="/login">Log In</Link></li>
            <li><Link to="/add-crop">Sell Your Crop</Link></li>
            <li><Link to="/#how-it-works">How it works</Link></li>
            <li><Link to="/#trust">Why trust us</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom-wrap">
        <div className="ag-container footer-bottom">
          <span className="footer-bottom__copyright">
            &copy; {year} AagriGgate. All rights reserved.
          </span>
          <span className="footer-contact-pill">
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
