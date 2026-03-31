import React, { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/NotificationPreferences.css';
import Button from './common/Button';
import Card from './common/Card';
import { getPreferences, resetPreferences, setPreference } from '../lib/notificationApi';

const LABELS = {
  NEWS_IMPORTANT: {
    title: 'Important News',
    description: 'Get a one-time ping when a major advisory or policy update is published.',
  },
  REQUEST_RECEIVED: {
    title: 'New Approach Requests',
    description: 'Know when someone starts a new crop request or enquiry with you.',
  },
  REQUEST_ACCEPTED: {
    title: 'Request Accepted',
    description: 'See when your crop request has been accepted by a seller.',
  },
  REQUEST_REJECTED: {
    title: 'Request Rejected',
    description: 'See when a request is declined so you can move on quickly.',
  },
  CROP_SOLD: {
    title: 'Crop Sale Updates',
    description: 'Receive in-app updates when a crop sale or market action completes.',
  },
  ACCOUNT_UPDATE: {
    title: 'Account Changes',
    description: 'Get notified about important account profile or status changes.',
  },
  ADMIN_MESSAGE: {
    title: 'Messages from Admin',
    description: 'Important admin communications are always delivered.',
  },
};

export default function NotificationPreferences({ open, onClose, onToast }) {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingType, setSavingType] = useState('');
  const [savedType, setSavedType] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const data = await getPreferences();
        if (active) setPreferences(Array.isArray(data) ? data : []);
      } catch (error) {
        if (active) onToast?.(error.message || 'Failed to load notification preferences.', 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open, onToast]);

  if (!open) return null;

  const updateSavedType = (type) => {
    setSavedType(type);
    window.setTimeout(() => setSavedType(''), 1500);
  };

  const handleToggle = async (item, nextEnabled) => {
    const type = item.notificationType;
    if (type === 'ADMIN_MESSAGE') return;

    setPreferences((prev) => prev.map((entry) => (
      entry.notificationType === type ? { ...entry, enabled: nextEnabled } : entry
    )));
    setSavingType(type);

    try {
      const updated = await setPreference(type, nextEnabled);
      setPreferences((prev) => prev.map((entry) => (
        entry.notificationType === type ? updated : entry
      )));
      updateSavedType(type);
    } catch (error) {
      setPreferences((prev) => prev.map((entry) => (
        entry.notificationType === type ? { ...entry, enabled: item.enabled } : entry
      )));
      onToast?.(error.message || 'Failed to update preference.', 'error');
    } finally {
      setSavingType('');
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetPreferences();
      const refreshed = await getPreferences();
      setPreferences(Array.isArray(refreshed) ? refreshed : []);
      onToast?.('Preferences reset to defaults.', 'success');
    } catch (error) {
      onToast?.(error.message || 'Failed to reset preferences.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-preferences__overlay" onClick={onClose}>
      <Card className="notification-preferences" onClick={(event) => event.stopPropagation()}>
        <div className="notification-preferences__head">
          <div>
            <h3>Notification Preferences</h3>
            <p>Choose which in-app updates you want to receive.</p>
          </div>
          <button type="button" className="notification-preferences__close" onClick={onClose}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {loading ? <p className="notification-preferences__loading">Loading preferences...</p> : null}

        <div className="notification-preferences__list">
          {preferences.map((item) => {
            const meta = LABELS[item.notificationType] || {
              title: item.notificationType,
              description: 'In-app notification preference',
            };
            const locked = item.notificationType === 'ADMIN_MESSAGE';
            const saving = savingType === item.notificationType;
            const saved = savedType === item.notificationType;

            return (
              <div key={item.notificationType} className="notification-preferences__row">
                <div className="notification-preferences__copy">
                  <div className="notification-preferences__title-row">
                    <strong>{meta.title}</strong>
                    {locked ? <i className="fa-solid fa-lock notification-preferences__lock" aria-hidden="true" /> : null}
                    {saved ? <span className="notification-preferences__saved">Saved</span> : null}
                  </div>
                  <p>{meta.description}</p>
                </div>
                <label className={`notification-preferences__toggle ${locked ? 'notification-preferences__toggle--locked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={Boolean(item.enabled)}
                    disabled={locked || saving}
                    onChange={(event) => handleToggle(item, event.target.checked)}
                  />
                  <span />
                </label>
              </div>
            );
          })}
        </div>

        <div className="notification-preferences__actions">
          <Button variant="ghost" onClick={handleReset} loading={loading}>Reset to defaults</Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}
