import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../lib/api';
import { setAuth, isLoggedIn, clearAuth } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('farmer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type }
  const [alreadyIn, setAlreadyIn] = useState(false);

  useEffect(() => { setAlreadyIn(isLoggedIn()); }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => { clearAuth(); navigate('/logout'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const path = userType === 'buyer' ? '/buyer/login' : '/users/login';
      const response = await apiPost(path, { username, password });
      if (response.ok) {
        const data = await response.json();
        setAuth({ token: data.token, role: userType, farmerId: data.farmer?.farmerId || '' });
        showToast('Login successful! Redirecting…', 'success');
        setTimeout(() => navigate('/account'), 1500);
      } else {
        showToast('Invalid credentials. Please try again.', 'error');
      }
    } catch {
      showToast('Server is busy. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* Already logged-in guard */
  if (alreadyIn) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[60vh]">
        <div className="card p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text)' }}>Already Logged In</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
            Please log out before accessing this page.
          </p>
          <button className="btn-danger w-full" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, #d8f3dc 100%)' }}
    >
      <div className="card p-8 w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--color-primary-dark)' }}>
            Welcome back 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to your AgriGate account
          </p>
        </div>

        {/* Role Toggle */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        >
          {['farmer', 'buyer'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setUserType(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: userType === t ? 'var(--color-primary)' : 'transparent',
                color: userType === t ? '#fff' : 'var(--color-text-muted)',
                boxShadow: userType === t ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {t === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input pr-12"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Register here
          </Link>
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
