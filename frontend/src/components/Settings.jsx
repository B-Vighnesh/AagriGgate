import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';

const SETTINGS_ITEMS = [
  {
    to: '/settings/notifications',
    icon: 'fa-bell',
    title: 'Notification Preferences',
    description: 'Choose alerts, standard notifications, and muted categories.',
    badge: 'Preferences',
  },
  {
    to: '/settings/password',
    icon: 'fa-key',
    title: 'Change Password',
    description: 'Update your password and review strength before saving.',
    badge: 'Security',
  },
  {
    to: '/settings/delete-account',
    icon: 'fa-triangle-exclamation',
    title: 'Delete Account',
    description: 'Permanently remove your account after password and OTP checks.',
    badge: 'Danger',
    danger: true,
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const token = getToken();
  const farmerId = getFarmerId();
  const role = getRole();

  useEffect(() => {
    if (!role || !token || !farmerId) {
      navigate('/login');
    }
  }, [role, token, farmerId, navigate]);

  return (
    <section className="page settings-page">
      <ValidateToken token={token} />

      <div className="ag-container settings-shell settings-shell--hub">
        <header className="settings-topbar settings-topbar--hub">
          <h1>Settings</h1>
        </header>

        <div className="settings-hub-list">
          {SETTINGS_ITEMS.map((item) => (
            <Card
              key={item.to}
              className={`settings-hub-card ${item.danger ? 'settings-hub-card--danger' : ''}`}
            >
              <Link to={item.to} className="settings-hub-link">
                <span className="settings-hub-link__icon" aria-hidden="true">
                  <i className={`fa-solid ${item.icon}`} />
                </span>
                <span className="settings-hub-link__copy">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <span className="settings-hub-link__badge">{item.badge}</span>
                <i className="fa-solid fa-chevron-right settings-hub-link__chevron" aria-hidden="true" />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
