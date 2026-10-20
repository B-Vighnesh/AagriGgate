import React, { useState } from 'react';
import Button from './common/Button';
import { isGuestPasswordConfigured, loginAsGuest } from '../lib/guestLogin';

export default function GuestLoginOptions({ onSuccess, compact = false }) {
  const [loadingRole, setLoadingRole] = useState('');
  const [error, setError] = useState('');

  const handleGuestLogin = async (role) => {
    setLoadingRole(role);
    setError('');
    try {
      await loginAsGuest(role);
      onSuccess?.(role);
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in with this guest account.');
    } finally {
      setLoadingRole('');
    }
  };

  return (
    <div className={`guest-login-options${compact ? ' guest-login-options--compact' : ''}`}>
      <div className="guest-login-options__buttons">
        <Button
          type="button"
          variant="outline"
          loading={loadingRole === 'farmer'}
          disabled={!isGuestPasswordConfigured('farmer') || Boolean(loadingRole)}
          onClick={() => handleGuestLogin('farmer')}
        >
          Log in as Guest Farmer
        </Button>
        <Button
          type="button"
          variant="outline"
          loading={loadingRole === 'buyer'}
          disabled={!isGuestPasswordConfigured('buyer') || Boolean(loadingRole)}
          onClick={() => handleGuestLogin('buyer')}
        >
          Log in as Guest Buyer
        </Button>
      </div>
      {error ? <p className="guest-login-options__message" role="alert">{error}</p> : null}
      {(!isGuestPasswordConfigured('farmer') || !isGuestPasswordConfigured('buyer')) ? (
        <p className="guest-login-options__hint">
          A guest login is unavailable until its password is set in the frontend environment.
        </p>
      ) : null}
    </div>
  );
}
