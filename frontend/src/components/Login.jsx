import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { requestJson, ApiError } from '../lib/api';
import { login as passwordLogin, loginWithOtp, sendLoginOtp } from '../api/authApi';
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
  const [loginMode, setLoginMode] = useState('password');
  const [principal, setPrincipal] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
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
        const storedRole = localStorage.getItem('role');
        const endpoint = storedRole === 'buyer' ? '/buyers/me' : '/farmers/me';
        await requestJson(endpoint, { method: 'GET' });
        setAlreadyIn(true);
      } catch {
        clearAuth();
        setAlreadyIn(false);
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

  const handleSendOtp = async () => {
    if (!principal.trim()) {
      showToast('Enter username or email first.', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      await sendLoginOtp(principal);
      showToast('OTP sent to your registered email.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to send login OTP.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = loginMode === 'password'
        ? await passwordLogin(principal, password)
        : await loginWithOtp(principal, otp);
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
        showToast(loginMode === 'password' ? 'Invalid principal or password.' : 'Invalid OTP.', 'error');
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

        <div className="segmented">
          <button
            type="button"
            className={loginMode === 'password' ? 'segmented__item segmented__item--active' : 'segmented__item'}
            onClick={() => setLoginMode('password')}
          >
            Password Login
          </button>
          <button
            type="button"
            className={loginMode === 'otp' ? 'segmented__item segmented__item--active' : 'segmented__item'}
            onClick={() => setLoginMode('otp')}
          >
            OTP Login
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

          {loginMode === 'password' ? (
            <>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleSendOtp} loading={sendingOtp}>
                {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </Button>

              <label htmlFor="otp">OTP</label>
              <input
                id="otp"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
              />
            </>
          )}

          <Button type="submit" loading={loading}>
            {loading ? 'Signing in...' : loginMode === 'password' ? 'Sign In' : 'Login With OTP'}
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
