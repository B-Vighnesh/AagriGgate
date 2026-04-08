import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiFetch } from '../lib/api';
import { clearAuth, getFarmerId, getRole, getToken } from '../lib/auth';
// import { deactivateAccount as requestDeactivateAccount } from '../api/authApi';

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
  const [deleteStep, setDeleteStep] = useState(1);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  // const [deleteMode, setDeleteMode] = useState('hard');

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
      const response = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
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
      
        const response = await apiFetch('/auth/delete-account', {
          method: 'DELETE',
          body: JSON.stringify({ currentPassword: deletePassword }),
        });
        if (!response.ok) {
          let message = 'Failed to delete account.';
          try {
            const body = await response.json();
            message = body?.message || message;
          } catch {
            // ignore parse errors
          }
          throw new Error(message);
        }
      clearAuth();
      showToast('Account deleted.', 'success');
      setTimeout(() => navigate('/register'), 900);
    } catch (err) {
      showToast(err.message || 'Server busy. Try again.', 'error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeleteStep(1);
      setDeletePassword('');
    }
  };

  return (
    <section className="page settings-page">
      <ValidateToken token={token} />
      
      <div className="ag-container settings-shell">
        

        <Card className="settings-hero-card">
          <div className="settings-head">
            <div>
              <span className="settings-kicker">Security Hub</span>
              <h1>Account settings built around safety and control</h1>
              <p>Manage passwords, review your security posture, and protect the account you use across AagriGgate.</p>
            </div>
            <div className="settings-status-grid">
              <div className="settings-status-card">
                <span>Password</span>
                <strong>{currentPassword || newPassword || confirmPassword ? 'In progress' : 'Ready to update'}</strong>
              </div>
              <div className="settings-status-card">
                <span>Account</span>
                <strong>{role === 'buyer' ? 'Buyer access' : 'Seller access'}</strong>
              </div>
              <div className="settings-status-card">
                <span>Support</span>
                <strong>Use Support for security help</strong>
              </div>
            </div>
          </div>
        </Card>

        <div className="settings-grid">
          <Card className="settings-card settings-card--primary">
            <div className="settings-card__head">
              <div>
                <h2>Change Password</h2>
                <p>Keep your account secure with a stronger password that meets the platform policy.</p>
              </div>
            </div>

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

              <div className="settings-password-tips">
                <span>8+ characters</span>
                <span>Upper + lower case</span>
                <span>Number + special character</span>
              </div>

              <Button type="submit" loading={loading} disabled={Boolean(passwordError)}>
                {loading ? 'Updating password...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          <div className="settings-side-stack">
            <Card className="settings-card settings-card--soft">
              <div className="settings-card__head">
                <div>
                  <h2>Security Tips</h2>
                  <p>Small habits go a long way in keeping your account protected.</p>
                </div>
              </div>
              <div className="settings-tips-list">
                <div className="settings-tip-item">
                  <strong>Use a unique password</strong>
                  <span>Avoid reusing the same password across other sites or apps.</span>
                </div>
                <div className="settings-tip-item">
                  <strong>Keep contact details current</strong>
                  <span>Updated email and phone details help with recovery and alerts.</span>
                </div>
                <div className="settings-tip-item">
                  <strong>Reach support quickly</strong>
                  <span>If anything looks suspicious, use the Support page immediately.</span>
                </div>
              </div>
            </Card>

            <Card className="settings-card danger-card">
              <div className="settings-card__head">
                <div>
                  <h2>Danger Zone</h2>
                  <p>Deleting your account is permanent and cannot be undone.</p>
                </div>
              </div>
               <Button variant="danger" onClick={() => { setDeleteStep(1); setShowDeleteModal(true); }}>Delete My Account</Button>
              
            </Card>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="confirm-overlay">
          <Card className="confirm-card">
            {deleteStep === 1 ? (
              <>
                <h3>Delete Account</h3>
                <p>
                  This will remove your access and clear your saved personal data from the platform.
                </p>
                <div className="confirm-actions">
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                  <Button variant="danger" onClick={() => setDeleteStep(2)}>Continue</Button>
                </div>
              </>
            ) : (
              <>
                <h3>Final Confirmation</h3>
                <p>
                  Enter current password to confirm account deletion.
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  placeholder="Current password"
                />
                <div className="confirm-actions">
                  <Button variant="outline" onClick={() => setDeleteStep(1)}>Back</Button>
                  <Button variant="danger" loading={deleteLoading} onClick={deleteAccount}>Delete</Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
