import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/Navbar.css';
import agrigateIcon from '../images/agrigate.jpg';

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTradeDropdownOpen, setTradeDropdownOpen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  const updateRole = () => {
    const storedRole = localStorage.getItem('role');
    if (storedRole !== role) {
      setRole(storedRole || '');
    }
  };

  useEffect(() => {
    updateRole();

    const handleStorageChange = () => {
      updateRole();
    };

    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(updateRole, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [role]);

  const toggleMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTradeHover = (isOpen) => {
    setTradeDropdownOpen(isOpen);
  };

  const handleTradeClick = () => {
    setTradeDropdownOpen((prevState) => !prevState);
  };

  if (!role) {
    return (
      <nav className="navbar">
        <div className="navv">
          <div className="navbar-logo">
            <Link to="/" className="nav-name">
              <img
                src={agrigateIcon}
                alt="AgriGate Logo"
                className="nav-icon"
                style={{ width: '50px', height: '50px', marginRight: '8px' }}
              />
              AgriGate
            </Link>
          </div>
          <div className="hamburger-menu" onClick={toggleMenu}>
            ☰
          </div>
        </div>
        <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
          <li><Link to="/account" onClick={toggleMenu}>Account</Link></li>
        </ul>
      </nav>
    );
  }

  if (role === 'buyer') {
    return (
      <nav className="navbar">
        <div className="navv">
          <div className="navbar-logo">
            <Link to="/" className="nav-name">
              <img
                src={agrigateIcon}
                alt="AgriGate Logo"
                className="nav-icon"
                style={{ width: '50px', height: '50px', marginRight: '8px' }}
              />
              AgriGate
            </Link>
          </div>
          <div className="hamburger-menu" onClick={toggleMenu}>
            ☰
          </div>
        </div>
        <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
          <li
            className="dropdown"
            onMouseEnter={() => handleTradeHover(true)}
            onMouseLeave={() => handleTradeHover(false)}
          >
            <Link to="#" className="dropdown-link" onClick={handleTradeClick}>
              Trade
            </Link>
            <ul className={`dropdown-menu ${isTradeDropdownOpen ? 'open' : ''}`}>
              <li><Link to="/view-all-crops" onClick={toggleMenu}>View Crops</Link></li>
              <li><Link to="/view-approaches-user" onClick={toggleMenu}>Track Requests</Link></li>
            </ul>
          </li>
          <li><Link to="/account" onClick={toggleMenu}>Account</Link></li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navv">
        <div className="navbar-logo">
          <Link to="/" className="nav-name">
            <img
              src={agrigateIcon}
              alt="AgriGate Logo"
              className="nav-icon"
              style={{ width: '50px', height: '50px', marginRight: '8px' }}
            />
            AgriGate
          </Link>
        </div>
        <div className="hamburger-menu" onClick={toggleMenu}>
          ☰
        </div>
      </div>
      <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
        <li><Link to="/market" onClick={toggleMenu}>Market</Link></li>
        <li><Link to="/weather" onClick={toggleMenu}>Weather</Link></li>
        <li
          className="dropdown"
          onMouseEnter={() => handleTradeHover(true)}
          onMouseLeave={() => handleTradeHover(false)}
        >
          <Link to="#" className="dropdown-link" onClick={handleTradeClick}>
            Trade
          </Link>
          <ul className={`dropdown-menu ${isTradeDropdownOpen ? 'open' : ''}`}>
            {role === 'farmer' ? (
              <>
                <li><Link to="/add-crop" onClick={toggleMenu}>Add Crop</Link></li>
                <li><Link to="/view-crop" onClick={toggleMenu}>View Crops</Link></li>
                <li><Link to="/view-approach" onClick={toggleMenu}>View Requests</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/view-all-crops" onClick={toggleMenu}>View Crops</Link></li>
                <li><Link to="/view-approaches-user" onClick={toggleMenu}>Track Requests</Link></li>
              </>
            )}
          </ul>
        </li>
        <li><Link to="/account" onClick={toggleMenu}>Account</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
