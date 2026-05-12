import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/Notifications.css';
import NotificationPreferences from './NotificationPreferences';
import Toast from './common/Toast';
import { isLoggedIn } from '../lib/auth';

export default function NotificationPreferencesPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const loggedIn = isLoggedIn();

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2400);
  }, []);

  if (!loggedIn) {
    return (
      <div className="ntf-page ag-container page">
        <div className="ntf-empty">
          <strong>Please log in to view notification preferences.</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="ntf-page page settings-page">
      <div className="ntf-layout ag-container settings-subpage-shell">
        <section className="ntf-preferences-panel settings-card settings-notification-card">
          <div className="settings-topbar settings-topbar--inside">
            <button
              type="button"
              className="settings-topbar__back"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </button>
            <h1>Notification Preferences</h1>
          </div>
          <NotificationPreferences onToast={showToast} />
        </section>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
