import React, { useEffect, useMemo, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/NotificationPreferences.css';
import { getPreferences, resetPreferences, setPreference } from '../lib/notificationApi';

const DELIVERY_OPTIONS = [
  {
    key: 'NOTIFICATION',
    label: 'Notification',
    icon: 'fa-regular fa-bell',
    description: 'Show it in your in-app notifications list.',
  },
  {
    key: 'ALERT',
    label: 'Alert',
    icon: 'fa-solid fa-triangle-exclamation',
    description: 'Treat it as a higher-priority actionable alert.',
  },
  {
    key: 'OFF',
    label: 'Off',
    icon: 'fa-regular fa-bell-slash',
    description: 'Do not deliver this category unless the system forces it.',
  },
];

const CATEGORY_META = {
  NEWS_IMPORTANT: {
    title: 'Important News',
    description: 'Major farming advisories and announcements.',
    icon: 'fa-regular fa-newspaper',
  },
  REQUEST: {
    title: 'Request Activity',
    description: 'Buyer and farmer request updates.',
    icon: 'fa-solid fa-seedling',
  },
  WEATHER_FLOOD: {
    title: 'Flood Warning',
    description: 'Severe flood alerts for your area.',
    icon: 'fa-solid fa-cloud-showers-water',
  },
  WEATHER_RAIN: {
    title: 'Rain Advisory',
    description: 'Rain updates affecting crops.',
    icon: 'fa-solid fa-cloud-rain',
  },
  PRICE_THRESHOLD: {
    title: 'Price Threshold',
    description: 'Market price target alerts.',
    icon: 'fa-solid fa-chart-line',
  },
  CROP: {
    title: 'Crop Updates',
    description: 'Updates for followed crops.',
    icon: 'fa-solid fa-leaf',
  },
  ADMIN: {
    title: 'Admin Messages',
    description: 'Platform-level messages.',
    icon: 'fa-solid fa-shield-halved',
  },
};

const prettifyCategory = (value) =>
  String(value || '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getMeta = (item) => {
  const category = CATEGORY_META[item?.categoryName];
  return {
    title: category?.title || prettifyCategory(item?.categoryName) || 'Notification',
    description: item?.description || category?.description || 'Choose how this category should reach you.',
    icon: category?.icon || 'fa-regular fa-bell',
  };
};

const getEffectiveDeliveryType = (item) => item?.effectiveDeliveryType || item?.defaultDeliveryType || 'NOTIFICATION';

const getTone = (deliveryType) => {
  if (deliveryType === 'ALERT') return 'alert';
  if (deliveryType === 'OFF') return 'off';
  return 'notification';
};

export default function NotificationPreferences({ open, onClose, onToast }) {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingCategory, setSavingCategory] = useState('');
  const [savedCategory, setSavedCategory] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const data = await getPreferences();
        if (active) setPreferences(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) onToast?.(err.message || 'Failed to load preferences.', 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open, onToast]);

  const counts = useMemo(() => preferences.reduce((acc, item) => {
    const key = getEffectiveDeliveryType(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { NOTIFICATION: 0, ALERT: 0, OFF: 0 }), [preferences]);

  if (!open) return null;

  const flashSaved = (categoryName) => {
    setSavedCategory(categoryName);
    window.setTimeout(() => setSavedCategory(''), 1500);
  };

  const handleSelect = async (item, deliveryType) => {
    const categoryName = item.categoryName;
    if (savingCategory === categoryName) return;

    const previous = item;
    const optimistic = {
      ...item,
      effectiveDeliveryType: deliveryType,
      userSelectedDeliveryType: deliveryType === item.defaultDeliveryType ? null : deliveryType,
    };

    setPreferences((prev) =>
      prev.map((entry) => (entry.categoryName === categoryName ? optimistic : entry)),
    );
    setSavingCategory(categoryName);

    try {
      const updated = await setPreference(categoryName, deliveryType);
      setPreferences((prev) =>
        prev.map((entry) => (entry.categoryName === categoryName ? updated : entry)),
      );
      flashSaved(categoryName);
    } catch (err) {
      setPreferences((prev) =>
        prev.map((entry) => (entry.categoryName === categoryName ? previous : entry)),
      );
      onToast?.(err.message || 'Failed to update preference.', 'error');
    } finally {
      setSavingCategory('');
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetPreferences();
      const refreshed = await getPreferences();
      setPreferences(Array.isArray(refreshed) ? refreshed : []);
      onToast?.('Preferences reset to defaults.', 'success');
    } catch (err) {
      onToast?.(err.message || 'Failed to reset preferences.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ntf-prefs-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Notification Preferences"
    >
      <div className="ntf-prefs" onClick={(e) => e.stopPropagation()}>
        <header className="ntf-prefs__header">
          <div className="ntf-prefs__hero">
            <span className="ntf-prefs__eyebrow">Delivery Controls</span>
            <h2 className="ntf-prefs__title">Notification Preferences</h2>
            <p className="ntf-prefs__subtitle">
              Choose whether each category should reach you as a notification, an alert, or stay off.
            </p>
            <div className="ntf-prefs__summary">
              <div className="ntf-prefs__summary-card">
                <span>Notifications</span>
                <strong>{counts.NOTIFICATION}</strong>
              </div>
              <div className="ntf-prefs__summary-card ntf-prefs__summary-card--alert">
                <span>Alerts</span>
                <strong>{counts.ALERT}</strong>
              </div>
              <div className="ntf-prefs__summary-card ntf-prefs__summary-card--off">
                <span>Off</span>
                <strong>{counts.OFF}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="ntf-prefs__close"
            onClick={onClose}
            aria-label="Close preferences"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="ntf-prefs__body">
          {loading && (
            <div className="ntf-prefs__loading">
              <span className="ui-spinner" aria-hidden="true" />
              <span>Loading preferences...</span>
            </div>
          )}

          {!loading && (
            <div className="ntf-prefs__list" role="list">
              {preferences.map((item) => {
                const meta = getMeta(item);
                const effective = getEffectiveDeliveryType(item);
                const saving = savingCategory === item.categoryName;
                const tone = getTone(effective);
                const customized = Boolean(item.userSelectedDeliveryType);

                return (
                  <section
                    key={item.categoryName}
                    className={`ntf-prefs__row ntf-prefs__row--${tone}`}
                    role="listitem"
                  >
                    <div className="ntf-prefs__row-head">
                      <div className="ntf-prefs__row-icon" aria-hidden="true">
                        <i className={meta.icon} />
                      </div>
                      <div className="ntf-prefs__row-copy">
                        <div className="ntf-prefs__row-title">
                          <strong>{meta.title}</strong>
                          <span className={`ntf-prefs__pill ntf-prefs__pill--${tone}`}>{effective}</span>
                          {savedCategory === item.categoryName ? <span className="ntf-prefs__saved">Saved</span> : null}
                        </div>
                        <span>{meta.description}</span>
                      </div>
                    </div>

                    <div className="ntf-prefs__meta">
                      <span>Default: <strong>{item.defaultDeliveryType}</strong></span>
                      <span>{customized ? 'Custom selection' : 'Using system default'}</span>
                    </div>

                    <div className="ntf-prefs__options" role="radiogroup" aria-label={`${meta.title} delivery type`}>
                      {DELIVERY_OPTIONS.map((option) => {
                        const selected = effective === option.key;
                        return (
                          <button
                            key={option.key}
                            type="button"
                            className={`ntf-prefs__option ${selected ? 'ntf-prefs__option--selected' : ''}`}
                            onClick={() => handleSelect(item, option.key)}
                            disabled={saving}
                            aria-pressed={selected}
                          >
                            <div className="ntf-prefs__option-icon" aria-hidden="true">
                              <i className={option.icon} />
                            </div>
                            <div className="ntf-prefs__option-copy">
                              <strong>{option.label}</strong>
                              <small>{option.description}</small>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <footer className="ntf-prefs__footer">
          <button
            type="button"
            className="ntf-prefs__footer-btn ntf-prefs__footer-btn--ghost"
            onClick={handleReset}
            disabled={loading}
          >
            Reset to defaults
          </button>
          <button
            type="button"
            className="ntf-prefs__footer-btn"
            onClick={onClose}
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
