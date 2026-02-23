import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const STEPS = ['Find Account', 'Verify OTP', 'New Password'];

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 3)}***@${domain}`;
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [retrievedEmail, setRetrievedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [passwordError, setPasswordError] = useState('');

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validatePasswords = (pwd, conf) => {
    if (pwd !== conf) { setPasswordError('Passwords do not match.'); return false; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pwd)) {
      setPasswordError('Min 8 chars with uppercase, lowercase, number & special character.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/auth/reset-otp/${email}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const found = await res.text();
        setRetrievedEmail(found);
        setStep(2);
        showToast(`OTP sent to ${maskEmail(found)}`, 'success');
      } else if (res.status === 500) {
        showToast('Server busy. Try again later.', 'error');
      } else {
        showToast(`No account found for ${email}`, 'error');
      }
    } catch { showToast('Network error. Please try again.', 'error'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/auth/verify-otp?email=${encodeURIComponent(retrievedEmail)}&otp=${otp}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (res.ok) { setStep(3); showToast('OTP verified!', 'success'); }
      else showToast('Invalid OTP. Please try again.', 'error');
    } catch { showToast('Network error.', 'error'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePasswords(form.newPassword, form.confirmPassword)) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/users/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: retrievedEmail, newPassword: form.newPassword }),
      });
      if (res.ok) {
        showToast('Password reset! Redirecting to login…', 'success');
        setTimeout(() => navigate('/login'), 1800);
      } else {
        showToast('Failed to reset password.', 'error');
      }
    } catch { showToast('Network error.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, #d8f3dc 100%)' }}
    >
      <div className="card p-8 w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary-dark)' }}>
            Reset Your Password
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Step {step} of 3 — {STEPS[step - 1]}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((_, i) => (
            <React.Fragment key={i}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: i + 1 <= step ? 'var(--color-primary)' : 'var(--color-border)',
                  color: i + 1 <= step ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-0.5 w-10" style={{ background: i + 1 < step ? 'var(--color-primary)' : 'var(--color-border)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Registered Email / Username</label>
              <input
                className="form-input"
                type="text" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <><span className="spinner" /> Sending…</> : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              OTP sent to <strong>{maskEmail(retrievedEmail)}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                className="form-input text-center tracking-widest text-lg"
                maxLength={6} required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="••••••"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <><span className="spinner" /> Verifying…</> : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="form-input pr-10"
                  required
                  value={form.newPassword}
                  onChange={e => {
                    const v = e.target.value;
                    setForm(f => ({ ...f, newPassword: v }));
                    validatePasswords(v, form.confirmPassword);
                  }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                required
                value={form.confirmPassword}
                onChange={e => {
                  const v = e.target.value;
                  setForm(f => ({ ...f, confirmPassword: v }));
                  validatePasswords(form.newPassword, v);
                }}
              />
              {passwordError && <p className="form-error">{passwordError}</p>}
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading || !!passwordError}>
              {loading ? <><span className="spinner" /> Resetting…</> : '🔐 Reset Password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Login</Link>
        </p>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  );
}
