import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { changePassword as requestChangePassword } from '../api/authApi';
import { clearAuth, getFarmerId, getRole, getToken } from '../lib/auth';

const PASSWORD_RULES = [
  { label: '8+ characters', test: (value) => value.length >= 8 },
  { label: 'Uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'Lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'Number', test: (value) => /\d/.test(value) },
  { label: 'Special character', test: (value) => /[@$!%*?&]/.test(value) },
];

function getStrengthScore(password) {
  return PASSWORD_RULES.filter((rule) => rule.test(password)).length;
}

function getStrengthLabel(score) {
  if (score <= 1) return 'Weak';
  if (score <= 3) return 'Good';
  return 'Strong';
}

export default function SettingsPassword() {
  const navigate = useNavigate();
  const token = getToken();
  const farmerId = getFarmerId();
  const role = getRole();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const strengthScore = useMemo(() => getStrengthScore(newPassword), [newPassword]);
  const strengthLabel = getStrengthLabel(strengthScore);
  const passwordsMatch = !confirmPassword || newPassword === confirmPassword;
  const canSubmit = currentPassword && newPassword && confirmPassword && passwordsMatch && strengthScore === PASSWORD_RULES.length;

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  useEffect(() => {
    if (!role || !token || !farmerId) {
      navigate('/login');
    }
  }, [role, token, farmerId, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      showToast('Please complete the password requirements first.', 'error');
      return;
    }

    setLoading(true);
    try {
      await requestChangePassword(currentPassword, newPassword);
      showToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        clearAuth();
        navigate('/login');
        return;
      }
      showToast(err.message || 'Unable to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page settings-page">
      <ValidateToken token={token} />

      <div className="ag-container settings-subpage-shell settings-subpage-shell--with-sidebar">
        <header className="settings-topbar">
          <button type="button" className="settings-topbar__back" onClick={() => navigate('/settings')} aria-label="Back to settings">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </button>
          <h1>Reset Password</h1>
        </header>

        <div className="settings-subpage-grid">
          <Card className="settings-card settings-form-card">
            <form className="settings-form settings-form--subpage" onSubmit={handleSubmit}>
              <label htmlFor="currentPassword">Current Password</label>
              <div className="settings-password-input">
                <input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <label htmlFor="newPassword">New Password</label>
              <div className="settings-password-input">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className={`settings-strength settings-strength--${strengthLabel.toLowerCase()}`}>
                <div className="settings-strength__bar" style={{ '--strength': strengthScore }} />
                <span>{newPassword ? `${strengthLabel} password` : 'Password strength'}</span>
              </div>

              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="settings-password-input">
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                </button>
              </div>

              {!passwordsMatch ? <small className="settings-error">Passwords do not match.</small> : null}

              <div className="settings-password-tips">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(newPassword);
                  return (
                    <span key={rule.label} className={passed ? 'is-complete' : ''}>
                      <i className={`fa-solid ${passed ? 'fa-check' : 'fa-circle'}`} aria-hidden="true" />
                      {rule.label}
                    </span>
                  );
                })}
              </div>

              <div className="settings-sticky-action">
                <Button type="submit" loading={loading} disabled={!canSubmit}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>

          <aside className="settings-security-sidebar" aria-label="Security tips">
            <Card className="settings-card settings-card--soft">
              <h2>Security Tips</h2>
              <div className="settings-tips-list">
                <div className="settings-tip-item">
                  <strong>Use a unique password</strong>
                  <span>Avoid reusing passwords from other apps or websites.</span>
                </div>
                <div className="settings-tip-item">
                  <strong>Make it hard to guess</strong>
                  <span>Mix words, numbers, and symbols without personal details.</span>
                </div>
                <div className="settings-tip-item">
                  <strong>Update after suspicious activity</strong>
                  <span>Change your password immediately if anything looks unusual.</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
