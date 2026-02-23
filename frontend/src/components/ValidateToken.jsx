import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { clearAuth } from '../lib/auth';

export default function ValidateToken({ token }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    let alive = true;
    const checkTokenValidity = async () => {
      try {
        const response = await apiGet('/auth/isTokenValid');
        if (!response.ok && alive) {
          clearAuth();
          setMessage('Session expired. Please login again.');
          setTimeout(() => navigate('/login'), 1500);
        }
      } catch {
        if (alive) {
          clearAuth();
          setMessage('Unable to validate session. Please login again.');
          setTimeout(() => navigate('/login'), 1500);
        }
      }
    };

    checkTokenValidity();
    return () => {
      alive = false;
    };
  }, [token, navigate]);

  if (!message) return null;

  return (
    <div className="session-overlay" role="status" aria-live="polite">
      <div className="session-modal">{message}</div>
    </div>
  );
}
