import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { apiFetch } from '../lib/api';
import { clearAuth, getFarmerId, getRole, getToken } from '../lib/auth';
import { deleteAccount as requestDeleteAccount, sendDeleteAccountOtp } from '../api/authApi';
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
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteOtpLoading, setDeleteOtpLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteNotice, setDeleteNotice] = useState('');
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
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

  const handleSendDeleteOtp = async () => {
    if (!deletePassword.trim()) {
      setDeleteNotice('');
      setDeleteError('Enter current password first.');
      return;
    }
    setDeleteError('');
    setDeleteNotice('');
    setDeleteOtpLoading(true);
    try {
      await sendDeleteAccountOtp();
      setDeleteOtpSent(true);
      setDeleteNotice('OTP sent to your registered email.');
    } catch (err) {
      setDeleteOtpSent(false);
      setDeleteNotice('');
      setDeleteError(err.message || 'Unable to send delete OTP.');
    } finally {
      setDeleteOtpLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteNotice('');
      setDeleteError('Current password is required.');
      return;
    }
    if (!deleteOtp.trim()) {
      setDeleteNotice('');
      setDeleteError('OTP is required.');
      return;
    }
    setDeleteError('');
    setDeleteNotice('');
    setDeleteLoading(true);
    try {
      await requestDeleteAccount(deletePassword, deleteOtp);
      resetDeleteDialog();
      clearAuth();
      setTimeout(() => navigate('/register'), 900);
    } catch (err) {
      setDeleteNotice('');
      setDeleteError(err.message || 'Server busy. Try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetDeleteDialog = () => {
    setShowDeleteModal(false);
    setDeleteStep(1);
    setDeletePassword('');
    setDeleteOtp('');
    setDeleteError('');
    setDeleteNotice('');
    setDeleteOtpSent(false);
    setDeleteOtpLoading(false);
    setDeleteLoading(false);
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

            <Card className="settings-card settings-card--soft">
              <div className="settings-card__head">
                <div>
                  <h2>Notification Settings</h2>
                  <p>Review your alert, notification, and off preferences in one dedicated place.</p>
                </div>
              </div>
              <div className="settings-tips-list">
                <div className="settings-tip-item">
                  <strong>Set alert priorities</strong>
                  <span>Choose which categories should remain standard notifications and which should be urgent alerts.</span>
                </div>
                <div className="settings-tip-item">
                  <strong>Understand the 5-alert limit</strong>
                  <span>Only the most important categories should stay in alert mode.</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/notification-preferences')}>
                Manage Notification Settings
              </Button>
            </Card>

            <Card className="settings-card danger-card">
              <div className="settings-card__head">
                <div>
                  <h2>Danger Zone</h2>
                  <p>Deleting your account is permanent and cannot be undone.</p>
                </div>
              </div>
               <Button variant="danger" onClick={() => { setDeleteStep(1); setDeleteError(''); setDeleteNotice(''); setDeleteOtp(''); setDeleteOtpSent(false); setShowDeleteModal(true); }}>Delete My Account</Button>
              
            </Card>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="confirm-overlay">
          <Card className="confirm-card confirm-card--danger">
            {deleteStep === 1 ? (
              <>
                <h3>Delete Account</h3>
                <p>
                  This will remove your access and clear your saved personal data from the platform.
                </p>
                <div className="confirm-actions">
                  <Button variant="outline" onClick={resetDeleteDialog}>Cancel</Button>
                  <Button variant="danger" onClick={() => setDeleteStep(2)}>Continue</Button>
                </div>
              </>
            ) : (
              <>
                <h3>Final Confirmation</h3>
                <p className="confirm-card__subtitle">
                  Confirm your password, request a deletion OTP, and verify with both before the account is removed.
                </p>
                <div className="confirm-form">
                  <div className="confirm-field">
                    <label htmlFor="deletePassword">Current Password</label>
                    <input
                      id="deletePassword"
                      type="password"
                      value={deletePassword}
                      onChange={(event) => setDeletePassword(event.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="confirm-inline-panel">
                    <div>
                      <strong>Email Verification</strong>
                      <span>{deleteOtpSent ? 'OTP sent to your registered email.' : 'Request an OTP to continue deletion.'}</span>
                    </div>
                    <Button variant="outline" loading={deleteOtpLoading} onClick={handleSendDeleteOtp}>
                      {deleteOtpLoading ? 'Sending OTP...' : deleteOtpSent ? 'Resend OTP' : 'Send OTP'}
                    </Button>
                  </div>

                  <div className="confirm-field">
                    <label htmlFor="deleteOtp">Deletion OTP</label>
                    <input
                      id="deleteOtp"
                      type="text"
                      value={deleteOtp}
                      onChange={(event) => setDeleteOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>

                  {deleteNotice ? <p className="confirm-card__notice">{deleteNotice}</p> : null}
                  {deleteError ? <p className="confirm-card__error">{deleteError}</p> : null}
                </div>
                <div className="confirm-actions">
                  <Button variant="outline" onClick={() => { setDeleteStep(1); setDeleteError(''); setDeleteNotice(''); }}>Back</Button>
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
