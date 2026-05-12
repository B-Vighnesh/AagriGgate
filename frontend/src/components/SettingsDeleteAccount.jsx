import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import { deleteAccount as requestDeleteAccount, sendDeleteAccountOtp } from '../api/authApi';
import { clearAuth, getFarmerId, getRole, getToken } from '../lib/auth';

export default function SettingsDeleteAccount() {
  const navigate = useNavigate();
  const token = getToken();
  const farmerId = getFarmerId();
  const role = getRole();

  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  useEffect(() => {
    if (!role || !token || !farmerId) {
      navigate('/login');
    }
  }, [role, token, farmerId, navigate]);

  const handlePasswordContinue = () => {
    if (!password.trim()) {
      showToast('Enter your current password to continue.', 'error');
      return;
    }
    setStep(3);
  };

  const handleSendOtp = async () => {
    if (!password.trim()) {
      showToast('Current password is required before requesting OTP.', 'error');
      setStep(2);
      return;
    }

    setOtpLoading(true);
    try {
      await sendDeleteAccountOtp();
      setOtpSent(true);
      showToast('OTP sent to your registered email.', 'success');
    } catch (err) {
      setOtpSent(false);
      showToast(err.message || 'Unable to send deletion OTP.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpContinue = () => {
    if (!otpSent) {
      showToast('Request an OTP first.', 'error');
      return;
    }
    if (!otp.trim()) {
      showToast('Enter the deletion OTP to continue.', 'error');
      return;
    }
    setStep(4);
  };

  const handleDelete = async () => {
    if (!password.trim() || !otp.trim()) {
      showToast('Password and OTP are required.', 'error');
      return;
    }

    setDeleteLoading(true);
    try {
      await requestDeleteAccount(password, otp);
      showToast('Account deleted. Redirecting to registration.', 'success');
      clearAuth();
      window.setTimeout(() => navigate('/register'), 800);
    } catch (err) {
      showToast(err.message || 'Unable to delete account.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className="page settings-page">
      <ValidateToken token={token} />

      <div className="ag-container settings-subpage-shell">
        <header className="settings-topbar">
          <button type="button" className="settings-topbar__back" onClick={() => navigate('/settings')} aria-label="Back to settings">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </button>
          <h1>Delete Account</h1>
        </header>

        <Card className="settings-card settings-delete-card">
          <div className="settings-stepper" aria-label={`Step ${step} of 4`}>
            {[1, 2, 3, 4].map((item) => (
              <span key={item} className={item <= step ? 'is-active' : ''} />
            ))}
          </div>

          {step === 1 ? (
            <div className="settings-delete-step">
              <h2>Before you delete</h2>
              <p>Deleting your account permanently removes your profile, saved preferences, crop listings, requests, and access to conversations connected to this account.</p>
              <div className="settings-warning-list">
                <span><i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> This action cannot be undone.</span>
                <span><i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> You will need a new registration to use AagriGgate again.</span>
              </div>
              <div className="settings-sticky-action settings-sticky-action--split">
                <Button variant="outline" onClick={() => navigate('/settings')}>Cancel</Button>
                <Button variant="danger" onClick={() => setStep(2)}>Continue</Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="settings-delete-step">
              <h2>Confirm Password</h2>
              <p>Enter your current password before requesting a deletion OTP.</p>
              <form className="settings-form settings-form--subpage" onSubmit={(event) => { event.preventDefault(); handlePasswordContinue(); }}>
                <label htmlFor="deletePassword">Current Password</label>
                <input
                  id="deletePassword"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <div className="settings-sticky-action settings-sticky-action--split">
                  <Button variant="outline" onClick={() => navigate('/settings')}>Cancel</Button>
                  <Button type="submit" variant="danger">Continue</Button>
                </div>
              </form>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="settings-delete-step">
              <h2>Verify OTP</h2>
              <p>Request an OTP and enter the code sent to your registered email.</p>
              <div className="settings-otp-panel">
                <span>{otpSent ? 'OTP sent to your registered email.' : 'No OTP requested yet.'}</span>
                <Button variant="outline" loading={otpLoading} onClick={handleSendOtp}>
                  {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Request OTP'}
                </Button>
              </div>
              <form className="settings-form settings-form--subpage" onSubmit={(event) => { event.preventDefault(); handleOtpContinue(); }}>
                <label htmlFor="deleteOtp">Deletion OTP</label>
                <input
                  id="deleteOtp"
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                />
                <div className="settings-sticky-action settings-sticky-action--split">
                  <Button variant="outline" onClick={() => navigate('/settings')}>Cancel</Button>
                  <Button type="submit" variant="danger">Continue</Button>
                </div>
              </form>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="settings-delete-step">
              <h2>Final Confirmation</h2>
              <p>Your account will be deleted after this confirmation. You will be signed out and redirected to registration.</p>
              <div className="settings-sticky-action settings-sticky-action--split">
                <Button variant="outline" onClick={() => navigate('/settings')}>Cancel</Button>
                <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
