import React, { useCallback, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/Notifications.css';
import NotificationPreferences from './NotificationPreferences';
import Toast from './common/Toast';
import { isLoggedIn } from '../lib/auth';

export default function NotificationPreferencesPage() {
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
    <div className="ntf-page page">
      <div className="ntf-layout ag-container">
        <section className="ntf-preferences-panel">
          <NotificationPreferences onToast={showToast} />
        </section>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
