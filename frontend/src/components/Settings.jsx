import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getFarmerId, getRole, clearAuth } from '../lib/auth';
import ValidateToken from './ValidateToken';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function Settings() {
  const navigate = useNavigate();
  const token = getToken();
  const farmerId = getFarmerId();
  const role = getRole();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const p = newPassword, c = confirmPassword;
    if (!p && !c) { setPasswordError(''); return; }
    if (p !== c) { setPasswordError('Passwords do not match.'); return; }
    if (!PWD_REGEX.test(p)) { setPasswordError('Min 8 chars with uppercase, lowercase, number & special char.'); return; }
    setPasswordError('');
  }, [newPassword, confirmPassword]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordError) return;
    setLoading(true);
    try {
      const endpoint = role === 'buyer' ? '/buyer/change-password' : '/users/change-password';
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ farmerId, currentPassword, newPassword }),
      });
      if (res.ok) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else if (res.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
        clearAuth(); navigate('/login');
      } else {
        showToast('Current password is incorrect.', 'error');
      }
    } catch { showToast('Server busy. Try again.', 'error'); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const endpoint = role === 'buyer' ? '/buyer/delete' : '/users/delete';
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ farmerId, currentPassword: deletePassword }),
      });
      if (res.ok) {
        clearAuth();
        showToast('Account deleted. Redirecting…', 'info');
        setTimeout(() => navigate('/register'), 1500);
      } else if (res.status === 401) {
        showToast('Incorrect password.', 'error');
      } else {
        showToast('Failed to delete account.', 'error');
      }
    } catch { showToast('Server busy. Try again.', 'error'); }
    finally { setDeleteLoading(false); setShowDeleteConfirm(false); }
  };

  return (
    <div className="page-wrapper max-w-2xl mx-auto">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="mb-6">
        <h1 className="section-title text-3xl">Settings</h1>
        <p className="section-subtitle">Manage your account security and preferences.</p>
      </div>

      {/* Change Password */}
      <div className="card p-6 mb-5">
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--color-text)' }}>🔐 Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input pr-10"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-input"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 8 chars, upper+lower+number+symbol"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-input"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            {passwordError && <p className="form-error">{passwordError}</p>}
          </div>
          <button type="submit" className="btn-primary py-2.5 w-full" disabled={loading || !!passwordError}>
            {loading ? <><span className="spinner" /> Saving…</> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card p-6" style={{ borderColor: '#fca5a5' }}>
        <h2 className="text-base font-bold mb-1" style={{ color: '#b91c1c' }}>⚠️ Danger Zone</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Deleting your account is permanent. All your data will be removed and cannot be recovered.
        </p>
        <button
          className="btn-danger py-2.5 w-full"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <div className="card p-6 w-full max-w-sm animate-fade-in-up">
            <p className="text-3xl mb-3 text-center">🚨</p>
            <h3 className="text-base font-bold mb-1 text-center" style={{ color: '#b91c1c' }}>Delete Account</h3>
            <p className="text-sm mb-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
              This is permanent. Enter your password to confirm.
            </p>
            <div className="form-group mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button className="btn-danger flex-1" disabled={deleteLoading} onClick={handleDeleteAccount}>
                {deleteLoading ? <><span className="spinner" /> Deleting…</> : 'Yes, Delete'}
              </button>
              <button className="btn-outline flex-1" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.msg}
        </div>
      )}
    </div>
  );
}
