import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { getApiBaseUrl } from '../lib/api';

const STEPS = ['Find Account', 'Verify OTP', 'New Password'];

const maskEmail = (email) => {
  const [local = '', domain = ''] = email.split('@');
  return `${local.slice(0, 3)}***@${domain}`;
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [retrievedEmail, setRetrievedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
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

  const sendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/reset-otp/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('No account found with this email/username.');
      const foundEmail = await response.text();
      setRetrievedEmail(foundEmail);
      setStep(2);
      showToast(`OTP sent to ${maskEmail(foundEmail)}`, 'success');
    } catch (err) {
      showToast(err.message || 'Unable to send OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/auth/verify-otp?email=${encodeURIComponent(retrievedEmail)}&otp=${encodeURIComponent(otp)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Invalid OTP.');
      setStep(3);
      showToast('OTP verified.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to verify OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (!validatePassword(newPassword, confirmPassword)) return;
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/users/resetpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: retrievedEmail, newPassword }),
      });
      if (!response.ok) throw new Error('Failed to reset password.');
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
        <p>Step {step} of 3 - {STEPS[step - 1]}</p>

        <div className="step-track">
          {STEPS.map((_, idx) => (
            <span key={idx} className={idx + 1 <= step ? 'step-dot step-dot--active' : 'step-dot'}>
              {idx + 1 < step ? '✓' : idx + 1}
            </span>
          ))}
        </div>

        {step === 1 && (
          <form className="form" onSubmit={sendOtp}>
            <label htmlFor="emailOrUser">Registered Email / Username</label>
            <input id="emailOrUser" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            <Button type="submit" loading={loading}>{loading ? 'Sending OTP...' : 'Send OTP'}</Button>
          </form>
        )}

        {step === 2 && (
          <form className="form" onSubmit={verifyOtp}>
            <p className="muted-line">OTP sent to <strong>{maskEmail(retrievedEmail)}</strong></p>
            <label htmlFor="otp">Enter OTP</label>
            <input id="otp" value={otp} onChange={(event) => setOtp(event.target.value)} required />
            <Button type="submit" loading={loading}>{loading ? 'Verifying OTP...' : 'Verify OTP'}</Button>
          </form>
        )}

        {step === 3 && (
          <form className="form" onSubmit={resetPassword}>
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
        )}

        <div className="auth-links">
          <span>Remembered it? <Link to="/login">Login</Link></span>
        </div>
      </Card>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
