import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { requestJson, ApiError } from '../lib/api';
import { isLoggedIn, setAuth } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('farmer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [alreadyIn, setAlreadyIn] = useState(false);

  useEffect(() => {
    setAlreadyIn(isLoggedIn());
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2500);
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const path = userType === 'buyer' ? '/buyer/login' : '/users/login';
      const data = await requestJson(path, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      setAuth({
        token: data?.token,
        role: userType,
        farmerId: data?.farmer?.farmerId || '',
      });
      showToast('Login successful.', 'success');
      setTimeout(() => navigate('/account'), 700);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        showToast('Invalid username or password.', 'error');
      } else {
        showToast(error.message || 'Unable to login. Try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (alreadyIn) {
    return (
      <section className="page page--center">
        <Card className="auth-card">
          <h2>Already Logged In</h2>
          <p>You are already logged in on this browser.</p>
          <Button variant="danger" onClick={handleLogout}>Logout First</Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="page page--center auth-page">
      <Card className="auth-card">
        <h1>Login to AagriGgate</h1>
        <p>Access your farmer or buyer account.</p>

        <div className="segmented">
          <button
            type="button"
            className={userType === 'farmer' ? 'segmented__item segmented__item--active' : 'segmented__item'}
            onClick={() => setUserType('farmer')}
          >
            Farmer
          </button>
          <button
            type="button"
            className={userType === 'buyer' ? 'segmented__item segmented__item--active' : 'segmented__item'}
            onClick={() => setUserType('buyer')}
          >
            Buyer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button type="submit" loading={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>
            New user? <Link to="/register">Create account</Link>
          </span>
        </div>
      </Card>
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
