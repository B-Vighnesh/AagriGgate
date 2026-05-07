import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import { clearAuth } from '../lib/auth';
import { requestJson } from '../lib/api';

export default function Logout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const confirmLogout = async () => {
    setLoading(true);
    try {
      await requestJson('/auth/logout', { method: 'POST' });
    } catch {
      // Local session cleanup should still happen if the cookie is already invalid.
    } finally {
      clearAuth();
      window.dispatchEvent(new Event('auth:expired'));
      setTimeout(() => {
        navigate('/login');
      }, 500);
    }
  };

  return (
    <section className="page page--center logout-page">
      <Card className="logout-card">
        <div className="logout-illustration" aria-hidden="true">
          <span className="logout-illustration__sun" />
          <span className="logout-illustration__hand">
            <span className="logout-illustration__finger logout-illustration__finger--one" />
            <span className="logout-illustration__finger logout-illustration__finger--two" />
            <span className="logout-illustration__finger logout-illustration__finger--three" />
            <span className="logout-illustration__finger logout-illustration__finger--four" />
            <span className="logout-illustration__thumb" />
            <span className="logout-illustration__palm" />
          </span>
          <span className="logout-illustration__leaf logout-illustration__leaf--one" />
          <span className="logout-illustration__leaf logout-illustration__leaf--two" />
        </div>
        <h1 className="logout-title">Leaving so soon?</h1>
        <p>
          Your farm data is safe with us. Come back anytime to check prices,
          manage listings, or continue your conversations.
        </p>
        <div className="logout-actions">
          <Button variant="danger" loading={loading} onClick={confirmLogout}>
            {loading ? 'Signing you out...' : 'Yes, sign me out'}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
            Stay logged in
          </Button>
        </div>
      </Card>
    </section>
  );
}
