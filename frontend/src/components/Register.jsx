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
  dob: '',
  aadharNo: '',
  password: '',
};

const NAME_REGEX = /^[A-Za-z\s]+$/;
const PHONE_REGEX = /^[6-9][0-9]{9}$/;
const AADHAR_REGEX = /^\d{12}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const ROLE_OPTIONS = [
  {
    value: 'farmer',
    title: 'Farmer',
    note: 'List crops, manage requests, and track market intelligence.',
  },
  {
    value: 'buyer',
    title: 'Buyer',
    note: 'Browse listings, connect with farmers, and manage purchase requests.',
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('farmer');
  const [form, setForm] = useState(INITIAL_FORM);
  const [otp, setOtp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const formErrors = useMemo(() => {
    const errors = {};

    if (form.firstName && (!NAME_REGEX.test(form.firstName.trim()) || form.firstName.trim().length < 2)) {
      errors.firstName = 'First name must contain only letters and spaces and be at least 2 characters.';
    }

    if (form.lastName && !NAME_REGEX.test(form.lastName.trim())) {
      errors.lastName = 'Last name must contain only letters and spaces.';
    }

    if (form.phoneNo && !PHONE_REGEX.test(form.phoneNo.trim())) {
      errors.phoneNo = 'Phone number must be 10 digits and start with 6, 7, 8, or 9.';
    }

    if (form.aadharNo && !AADHAR_REGEX.test(form.aadharNo.trim())) {
      errors.aadharNo = 'Aadhaar number must be exactly 12 digits.';
    }

    if (form.dob) {
      const dob = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthGap = today.getMonth() - dob.getMonth();
      if (monthGap < 0 || (monthGap === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
      }
      if (Number.isNaN(dob.getTime())) {
        errors.dob = 'Enter a valid date of birth.';
      } else if (age < 18) {
        errors.dob = 'You must be at least 18 years old.';
      }
    }

    if (form.password && !PASSWORD_REGEX.test(form.password)) {
      errors.password = 'Password must have 8+ characters with uppercase, lowercase, number, and special character.';
    }

    if (confirmPassword && form.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  }, [form, confirmPassword]);

  const sendOtp = async (event) => {
    event.preventDefault();
    if (!form.email || !form.firstName || !form.phoneNo || !form.state || !form.district || !form.dob || !form.aadharNo) {
      showToast('Please fill all required fields before OTP.', 'error');
      return;
    }
    if (Object.keys(formErrors).length > 0) {
      showToast('Please correct the highlighted details first.', 'error');
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
    if (Object.keys(formErrors).length > 0) {
      showToast('Please correct the highlighted password details first.', 'error');
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
            <div className="register-role-block">
              <div className="register-role-head">
                <h2>Choose Your Role</h2>
                <p>Select the experience that matches how you will use AagriGgate.</p>
              </div>

              <div className="register-role-grid">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={role === option.value ? 'register-role-card register-role-card--active' : 'register-role-card'}
                    onClick={() => setRole(option.value)}
                    aria-pressed={role === option.value}
                  >
                    <span className="register-role-card__marker">
                      {role === option.value ? 'Selected' : 'Choose'}
                    </span>
                    <strong>{option.title}</strong>
                    <span>{option.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <label>First Name</label>
            <input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required />
            {formErrors.firstName ? <small className="settings-error">{formErrors.firstName}</small> : null}

            <label>Last Name</label>
            <input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
            {formErrors.lastName ? <small className="settings-error">{formErrors.lastName}</small> : null}

            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />

            <label>Phone Number</label>
            <input
              value={form.phoneNo}
              maxLength={10}
              onChange={(e) => updateField('phoneNo', e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
            />
            {formErrors.phoneNo ? <small className="settings-error">{formErrors.phoneNo}</small> : null}

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
            <select value={form.district} onChange={(e) => updateField('district', e.target.value)} required>
              <option value="">Select district</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>

            <label>Date of Birth</label>
            <input type="date" value={form.dob} onChange={(e) => updateField('dob', e.target.value)} required />
            {formErrors.dob ? <small className="settings-error">{formErrors.dob}</small> : null}

            <label>Aadhaar Number</label>
            <input
              value={form.aadharNo}
              maxLength={12}
              onChange={(e) => updateField('aadharNo', e.target.value.replace(/\D/g, '').slice(0, 12))}
              required
            />
            {formErrors.aadharNo ? <small className="settings-error">{formErrors.aadharNo}</small> : null}

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
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
            />
            {formErrors.password ? <small className="settings-error">{formErrors.password}</small> : null}

            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {formErrors.confirmPassword ? <small className="settings-error">{formErrors.confirmPassword}</small> : null}

            <label className="settings-checkbox">
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((prev) => !prev)} />
              Show password
            </label>

            <Button type="submit" loading={loading} disabled={Object.keys(formErrors).length > 0}>
              {loading ? 'Registering...' : 'Create Account'}
            </Button>
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
