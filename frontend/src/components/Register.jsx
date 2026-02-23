import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost, apiGet } from '../lib/api';
import { isLoggedIn } from '../lib/auth';
import statesWithDistricts from './StatesWithDistricts';

const STEPS = ['Verify Email', 'Your Details', 'Set Password'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200"
              style={{
                background: i <= current ? 'var(--color-primary)' : 'var(--color-border)',
                color: i <= current ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-xs mt-1 font-medium hidden sm:block"
              style={{ color: i <= current ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="h-0.5 w-10 sm:w-16 mx-1 mt-[-18px] sm:mt-[-18px] transition-all duration-300"
              style={{ background: i < current ? 'var(--color-primary)' : 'var(--color-border)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);   // 0 = verify email, 1 = details, 2 = password
  const [userType, setUserType] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phoneNo: '', dob: '', state: '', district: '', aadharNo: '', password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (isLoggedIn()) navigate('/account'); }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const setErr = (key, val) => setErrors(prev => ({ ...prev, [key]: val }));
  const clearErr = (key) => setErrors(prev => { const c = { ...prev }; delete c[key]; return c; });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      try {
        const res = await apiGet(`/users/findEmail/${value}`);
        const exists = res.ok ? await res.json() : false;
        exists ? setErr('email', 'This email is already in use.') : clearErr('email');
      } catch { clearErr('email'); }
    }
    if (name === 'phoneNo') {
      /^\d{10}$/.test(value) && /^[6-9]/.test(value) ? clearErr('phoneNo') : setErr('phoneNo', 'Enter a valid 10-digit phone starting with 6-9.');
    }
    if (name === 'aadharNo') {
      /^\d{12}$/.test(value) ? clearErr('aadharNo') : setErr('aadharNo', 'Aadhaar must be exactly 12 digits.');
    }
    if (name === 'dob') {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      age < 18 ? setErr('dob', 'You must be at least 18 years old.') : clearErr('dob');
    }
    if (name === 'firstName') {
      /^[a-zA-Z\s]{2,}$/.test(value) ? clearErr('firstName') : setErr('firstName', 'Min 2 letters, alphabets only.');
    }
  };

  const validatePasswords = () => {
    if (form.password !== confirmPassword) { setErr('password', 'Passwords do not match.'); return false; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
      setErr('password', 'Min 8 chars with uppercase, lowercase, number and special char.');
      return false;
    }
    clearErr('password');
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!userType) { showToast('Please select Farmer or Buyer first.', 'error'); return; }
    if (Object.keys(errors).length) { showToast('Please fix the errors before continuing.', 'error'); return; }
    setLoading(true);
    try {
      const res = await apiPost(`/auth/send-otp/${form.email}`, {});
      if (res.ok) { setOtpSent(true); showToast('OTP sent to your email!', 'success'); }
      else showToast('Could not send OTP. Check your email address.', 'error');
    } catch { showToast('Server busy. Try again later.', 'error'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiPost(`/auth/verify-otp?email=${encodeURIComponent(form.email)}&otp=${otp}`, {});
      if (res.ok) { showToast('Email verified!', 'success'); setStep(1); }
      else showToast('Invalid OTP. Please try again.', 'error');
    } catch { showToast('Server busy. Try again.', 'error'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setLoading(true);
    try {
      const endpoint = userType === 'buyer' ? '/buyer/register' : '/users/register';
      const res = await apiPost(endpoint, form);
      if (res.ok) { showToast('Registration successful! Redirecting to login…', 'success'); setTimeout(() => navigate('/login'), 1500); }
      else showToast('Registration failed. Server busy.', 'error');
    } catch { showToast('Server busy. Try again.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, #d8f3dc 100%)' }}
    >
      <div className="card p-8 w-full max-w-lg animate-fade-in-up">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--color-primary-dark)' }}>Create Account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Join thousands of farmers and buyers</p>
        </div>

        <StepIndicator current={step} />

        {/* ── Step 0: Verify Email ── */}
        {step === 0 && (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
            {/* User Type */}
            <div
              className="flex gap-1 p-1 rounded-xl mb-2"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              {['farmer', 'buyer'].map(t => (
                <button
                  key={t} type="button" onClick={() => setUserType(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    background: userType === t ? 'var(--color-primary)' : 'transparent',
                    color: userType === t ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  {t === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" name="firstName" required onChange={handleChange} placeholder="John" />
              {errors.firstName && <p className="form-error">{errors.firstName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" name="lastName" onChange={handleChange} placeholder="Doe" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" name="phoneNo" required onChange={handleChange} placeholder="9876543210" />
                {errors.phoneNo && <p className="form-error">{errors.phoneNo}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" name="dob" required onChange={handleChange} />
                {errors.dob && <p className="form-error">{errors.dob}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-select" name="state" required onChange={(e) =>
                  setForm(prev => ({ ...prev, state: e.target.value, district: '' }))}>
                  <option value="">Select State</option>
                  {Object.keys(statesWithDistricts).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <select className="form-select" name="district" required value={form.district}
                  onChange={handleChange} disabled={!form.state}>
                  <option value="">Select District</option>
                  {form.state && statesWithDistricts[form.state]?.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Aadhaar Number</label>
              <input className="form-input" name="aadharNo" required onChange={handleChange} placeholder="123456789012" maxLength={12} />
              {errors.aadharNo && <p className="form-error">{errors.aadharNo}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {!otpSent ? (
              <button type="submit" className="btn-primary w-full py-3" disabled={loading || !!Object.keys(errors).length}>
                {loading ? <><span className="spinner" /> Sending…</> : 'Send OTP'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input className="form-input text-center tracking-widest text-lg" name="otp" maxLength={6}
                    value={otp} onChange={e => setOtp(e.target.value)} placeholder="• • • • • •" />
                </div>
                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? <><span className="spinner" /> Verifying…</> : 'Verify OTP'}
                </button>
              </div>
            )}
          </form>
        )}

        {/* ── Step 1 → 2: Details → Password → Register ── */}
        {step === 1 && (
          <form onSubmit={() => setStep(2)} className="space-y-4">
            <p className="text-sm text-center mb-1" style={{ color: 'var(--color-text-muted)' }}>
              ✅ Email verified! Now set your password.
            </p>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="form-input pr-12"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, upper+lower+number+symbol"
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); clearErr('password'); }}
                required
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>
            <button type="button" className="btn-primary w-full py-3" onClick={() => { if (validatePasswords()) setStep(2); }}>
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="card p-4 text-sm" style={{ background: 'var(--color-bg)' }}>
              <p><span className="font-semibold">Role:</span> <span className="badge badge-green">{userType}</span></p>
              <p className="mt-1"><span className="font-semibold">Name:</span> {form.firstName} {form.lastName}</p>
              <p className="mt-1"><span className="font-semibold">Email:</span> {form.email}</p>
              <p className="mt-1"><span className="font-semibold">State:</span> {form.state}, {form.district}</p>
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <><span className="spinner" /> Registering…</> : '🚀 Complete Registration'}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-5" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
        </p>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.msg}
        </div>
      )}
    </div>
  );
}