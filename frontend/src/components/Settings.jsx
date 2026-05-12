import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getFarmerId, getRole, getToken } from '../lib/auth';

const SETTINGS_ITEMS = [
  {
    to: '/update-account',
    icon: 'fa-regular fa-pen-to-square',
    title: 'Edit Account',
    description: 'Update your personal information.',
  },
  {
    to: '/notification-preferences',
    icon: 'fa-bell',
    title: 'Notification Preferences',
    description: 'Choose alerts, standard notifications, and muted categories.',
  },
  {
    to: '/settings/password',
    icon: 'fa-key',
    title: 'Change Password',
    description: 'Update your password and review strength before saving.',
  },
  {
    to: '/settings/delete-account',
    icon: 'fa-triangle-exclamation',
    title: 'Delete Account',
    description: 'Permanently remove your account after password and OTP checks.',
    danger: true,
  },{
    to: '/logout',
    icon: 'fa-solid fa-right-from-bracket' ,
    title: 'Logout',
    description: 'Sign out of your account securely.',
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
          <div className="settings-title-block">
            <h1>Settings</h1>
            <p>Manage your password, notifications, and account.</p>
          </div>
        </header>

        <Card className="settings-hub-menu">
          {SETTINGS_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`settings-hub-row ${item.danger ? 'settings-hub-row--danger' : ''}`}
            >
              <span className="settings-hub-row__icon" aria-hidden="true">
                <i className={`fa-solid ${item.icon}`} />
              </span>
              <span className="settings-hub-row__copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <i className="fa-solid fa-chevron-right settings-hub-row__chevron" aria-hidden="true" />
            </Link>
          ))}
        </Card>
      </div>
    </section>
  );
}
