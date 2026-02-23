import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { requestJson, ApiError, apiGet } from '../lib/api';
import { isLoggedIn, setAuth, clearAuth, hasCompleteSession } from '../lib/auth';

function normalizeRole(role) {
  if (!role) return '';
  const upper = String(role).toUpperCase();
  if (upper === 'SELLER') return 'farmer';
  if (upper === 'BUYER') return 'buyer';
  return String(role).toLowerCase();
}

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('farmer');
  const [principal, setPrincipal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const validateExistingSession = async () => {
      if (!isLoggedIn()) {
        setAlreadyIn(false);
        setCheckingSession(false);
        return;
      }
      if (!hasCompleteSession()) {
        clearAuth();
        setAlreadyIn(false);
        setCheckingSession(false);
        return;
      }

      try {
        const response = await apiGet('/auth/isTokenValid');
        if (response.ok) {
          setAlreadyIn(true);
        } else {
          clearAuth();
          setAlreadyIn(false);
        }
      } catch {
        // When server is down, keep existing login guard behavior.
        setAlreadyIn(true);
      } finally {
        setCheckingSession(false);
      }
    };

    validateExistingSession();
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
      const path = userType === 'buyer' ? '/buyers/login' : '/farmers/login';
      const data = await requestJson(path, {
        method: 'POST',
        body: JSON.stringify({ principal, password }),
      });
      const normalizedRole = normalizeRole(data?.role);
      const farmerId = data?.farmerId ? String(data.farmerId) : '';

      setAuth({
        token: data?.token,
        role: normalizedRole || userType,
        farmerId,
      });
      showToast('Login successful.', 'success');
      setTimeout(() => navigate('/account'), 700);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        showToast('Invalid principal or password.', 'error');
      } else {
        showToast(error.message || 'Unable to login. Try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <section className="page page--center">
        <Card className="auth-card">
          <h2>Checking Session</h2>
          <p>Validating your current login state...</p>
        </Card>
      </section>
    );
  }

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
          <label htmlFor="principal">Username</label>
          <input
            id="principal"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
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
