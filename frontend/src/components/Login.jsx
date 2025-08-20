import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Login.css';

const Login = () => {


  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('farmer');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const loginData = { username, password };

    try {
      const endpoint =
        userType === 'buyer'
          ? 'http://localhost:8080/buyer/login'
          : 'http://localhost:8080/users/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, farmer } = data;
        localStorage.setItem('role', userType);
        localStorage.setItem('token', token);
        localStorage.setItem('farmerId', farmer?.farmerId || '');
        setPopupMessage('Login successful!');
        setTimeout(() => navigate('/account'), 2000);
      } else {
        setPopupMessage('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setPopupMessage('Server is busy. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmerId');
    navigate('/logout');
  };

  const closePopup = () => {
    setPopupMessage(null);
  };

  if (isLoggedIn) {
    return (
      <div className="register-container">
        <p>You are already logged in. Please log out before attempting to log in.</p>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    );
   
  }

  return (
    <div className="login-main-container">
       <h1 className="heading">
  <span>L</span>
  <span>O</span>
  <span>G</span>
  <span>I</span>
  <span>N</span>
</h1><div className="login-container">
      <form onSubmit={handleSubmit}>    
        <label htmlFor="userType">I am a:</label>
        <select
          id="userType"
          name="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
        </select>

        <label htmlFor="username">Username or Email:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <button type="submit" id="login" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <button
        id="forgot-password"
        onClick={() => navigate('/forgot-password')}
        className="forgot-password-link"
      >
        Forgot Password?
      </button>

      <button
        id="reg"
        onClick={() => navigate('/register')}
        className="register-link"
      >
        New user? Register here
      </button>
      </div>
      {popupMessage && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup">
            <p>{popupMessage}</p>
            {/* <button className="popup-close" onClick={closePopup}>
              Close
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
