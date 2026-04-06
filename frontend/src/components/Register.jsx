import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import statesWithDistricts from './StatesWithDistricts';
import { ApiError, requestJson } from '../lib/api';

const INITIAL_FORM = {
  email: '',
  firstName: '',
  lastName: '',
  phoneNo: '',
  state: '',
  district: '',
  password: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('farmer');
  const [form, setForm] = useState(INITIAL_FORM);
  const [otp, setOtp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const districts = useMemo(() => statesWithDistricts[form.state] || [], [form.state]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 3000);
  };

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    if (!form.email || !form.firstName || !form.phoneNo || !form.state) {
      showToast('Please fill required fields before OTP.', 'error');
      return;
    }

    setLoading(true);
    try {
      await requestJson('/auth/register/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email }),
      });
      setStep(1);
      showToast('OTP sent to your email.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to send OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!otp.trim()) {
      showToast('Please enter OTP.', 'error');
      return;
    }

    setLoading(true);
    try {
      await requestJson('/auth/register/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, otp }),
      });
      setStep(2);
      showToast('OTP verified.', 'success');
    } catch (error) {
      showToast(error.message || 'Invalid OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const register = async (event) => {
    event.preventDefault();
    if (form.password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    if (form.password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const endpoint = role === 'buyer' ? '/auth/register/buyer' : '/auth/register/seller';
      await requestJson(endpoint, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      showToast('Registration successful. Redirecting to login.', 'success');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        showToast('User already exists with this email.', 'error');
      } else {
        showToast(error.message || 'Unable to register.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page page--center auth-page">
      <Card className="auth-card auth-card--wide">
        <h1>Create AagriGgate Account</h1>
        <p>Step {step + 1} of 3</p>

        {step === 0 && (
          <form className="form" onSubmit={sendOtp}>
            <div className="segmented">
              <button
                type="button"
                className={role === 'farmer' ? 'segmented__item segmented__item--active' : 'segmented__item'}
                onClick={() => setRole('farmer')}
              >
                Farmer
              </button>
              <button
                type="button"
                className={role === 'buyer' ? 'segmented__item segmented__item--active' : 'segmented__item'}
                onClick={() => setRole('buyer')}
              >
                Buyer
              </button>
            </div>

            <label>First Name</label>
            <input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required />

            <label>Last Name</label>
            <input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />

            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />

            <label>Phone Number</label>
            <input value={form.phoneNo} onChange={(e) => updateField('phoneNo', e.target.value)} required />

            <label>State</label>
            <select
              value={form.state}
              onChange={(e) => {
                updateField('state', e.target.value);
                updateField('district', '');
              }}
              required
            >
              <option value="">Select state</option>
              {Object.keys(statesWithDistricts).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <label>District</label>
            <select value={form.district} onChange={(e) => updateField('district', e.target.value)}>
              <option value="">Select district</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>

            <small className="auth-helper-text">Username will be generated automatically after registration.</small>

            <Button type="submit" loading={loading}>{loading ? 'Sending OTP...' : 'Send OTP'}</Button>
          </form>
        )}

        {step === 1 && (
          <form className="form" onSubmit={verifyOtp}>
            <label>OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} required />
            <Button type="submit" loading={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</Button>
          </form>
        )}

        {step === 2 && (
          <form className="form" onSubmit={register}>
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />

            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

            <Button type="submit" loading={loading}>{loading ? 'Registering...' : 'Create Account'}</Button>
          </form>
        )}

        <div className="auth-links">
          <span>Already have an account? <Link to="/login">Sign in</Link></span>
        </div>
      </Card>
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
