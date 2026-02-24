import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { requestJson } from '../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 3000);
  };

  const validatePassword = (pwd, confirm) => {
    if (pwd !== confirm) {
      setPasswordError('Passwords do not match.');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pwd)) {
      setPasswordError('Minimum 8 chars with uppercase, lowercase, number and special character.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (!validatePassword(newPassword, confirmPassword)) return;
    setLoading(true);
    try {
      await requestJson('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      });
      showToast('Password reset successful.', 'success');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      showToast(err.message || 'Unable to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page page--center auth-page forgot-page">
      <Card className="auth-card forgot-card">
        <h1>Reset Your Password</h1>
        <p>Enter your registered email and new password.</p>

        <form className="form" onSubmit={resetPassword}>
          <label htmlFor="email">Registered Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              if (confirmPassword) validatePassword(event.target.value, confirmPassword);
            }}
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              validatePassword(newPassword, event.target.value);
            }}
            required
          />

          {passwordError ? <small className="settings-error">{passwordError}</small> : null}

          <label className="settings-checkbox">
            <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((prev) => !prev)} />
            Show password
          </label>

          <Button type="submit" loading={loading} disabled={Boolean(passwordError)}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div className="auth-links">
          <span>Remembered it? <Link to="/login">Login</Link></span>
        </div>
      </Card>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
