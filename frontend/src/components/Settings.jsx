import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiFetch } from '../lib/api';
import { clearAuth, getFarmerId, getRole, getToken } from '../lib/auth';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function Settings() {
  const navigate = useNavigate();
  const token = getToken();
  const farmerId = getFarmerId();
  const role = getRole();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2800);
  };

  useEffect(() => {
    if (!role || !token || !farmerId) {
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    if (!newPassword && !confirmPassword) {
      setPasswordError('');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (!PWD_REGEX.test(newPassword)) {
      setPasswordError('Minimum 8 chars with uppercase, lowercase, number and special character.');
      return;
    }
    setPasswordError('');
  }, [newPassword, confirmPassword]);

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordError) return;
    setLoading(true);
    try {
      const endpoint = role === 'buyer' ? '/buyers/change-password' : '/farmers/change-password';
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ farmerId, currentPassword, newPassword }),
      });
      if (response.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        clearAuth();
        navigate('/login');
        return;
      }
      if (!response.ok) throw new Error('Current password is incorrect.');
      showToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Server busy. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const endpoint = role === 'buyer' ? '/buyers' : '/farmers';
      const response = await apiFetch(endpoint, {
        method: 'DELETE',
        body: JSON.stringify({ farmerId, currentPassword: deletePassword }),
      });
      if (response.status === 401) {
        showToast('Incorrect password.', 'error');
        return;
      }
      if (!response.ok) throw new Error('Failed to delete account.');
      clearAuth();
      showToast('Account deleted.', 'success');
      setTimeout(() => navigate('/register'), 900);
    } catch (err) {
      showToast(err.message || 'Server busy. Try again.', 'error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  return (
    <section className="page settings-page">
      <ValidateToken token={token} />
      
      <div className="ag-container">
          <button type="button" className="link-back" onClick={() => navigate(-1)}>Back</button>

        <header className="settings-head">
          <h1>Settings</h1>
          <p>Manage your account security and preferences.</p>
        </header>

        <div className="settings-grid">
          <Card className="settings-card">
            <h2>Change Password</h2>
            <form className="settings-form" onSubmit={changePassword}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />

              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />

              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />

              {passwordError ? <small className="settings-error">{passwordError}</small> : null}

              <label className="settings-checkbox">
                <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((prev) => !prev)} />
                Show password
              </label>

              <Button type="submit" loading={loading} disabled={Boolean(passwordError)}>
                {loading ? 'Updating password...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          <Card className="settings-card danger-card">
            <h2>Danger Zone</h2>
            <p>Deleting your account is permanent and cannot be undone.</p>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete My Account</Button>
          </Card>
        </div>
      </div>

      {showDeleteModal && (
        <div className="confirm-overlay">
          <Card className="confirm-card">
            <h3>Delete Account</h3>
            <p>Enter current password to confirm permanent deletion.</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              placeholder="Current password"
            />
            <div className="confirm-actions">
              <Button variant="danger" loading={deleteLoading} onClick={deleteAccount}>Delete</Button>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
