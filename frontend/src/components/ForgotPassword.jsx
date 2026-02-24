import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { requestJson } from '../lib/api';

const STEPS = ['Enter Email', 'Verify OTP', 'Reset Password'];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
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

  const sendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await requestJson('/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStep(2);
      showToast('OTP sent to your email.', 'success');
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
      await requestJson('/password/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      setStep(3);
      showToast('OTP verified.', 'success');
    } catch (err) {
      showToast(err.message || 'Invalid OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (!validatePassword(newPassword, confirmPassword)) return;
    setLoading(true);
    try {
      await requestJson('/password/reset', {
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
        <p>Step {step} of 3 - {STEPS[step - 1]}</p>

        {step === 1 && (
          <form className="form" onSubmit={sendOtp}>
            <label htmlFor="email">Registered Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit" loading={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form className="form" onSubmit={verifyOtp}>
            <label htmlFor="otp">OTP</label>
            <input
              id="otp"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
            <Button type="submit" loading={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
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
