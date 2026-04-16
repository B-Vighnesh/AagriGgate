import React, { useEffect, useMemo, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/NotificationPreferences.css';
import Button from './common/Button';
import Card from './common/Card';
import { getPreferences, resetPreferences, setPreference } from '../lib/notificationApi';

const DELIVERY_OPTIONS = [
  {
    key: 'NOTIFICATION',
    label: 'Notification',
    icon: 'fa-regular fa-bell',
    description: 'Show it in the bell drawer without interrupting the user.',
  },
  {
    key: 'ALERT',
    label: 'Alert',
    icon: 'fa-solid fa-triangle-exclamation',
    description: 'Treat it as a higher-priority alert for urgent updates.',
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
    description: 'Major farming advisories, policy updates, or important announcements.',
    icon: 'fa-regular fa-newspaper',
  },
  REQUEST: {
    title: 'Request Activity',
    description: 'Updates when buyers and farmers exchange or act on requests.',
    icon: 'fa-solid fa-seedling',
  },
  WEATHER_FLOOD: {
    title: 'Flood Warning',
    description: 'Severe flood conditions for your location and nearby areas.',
    icon: 'fa-solid fa-cloud-showers-water',
  },
  WEATHER_RAIN: {
    title: 'Rain Advisory',
    description: 'Rain-related updates that may affect harvest and field planning.',
    icon: 'fa-solid fa-cloud-rain',
  },
  PRICE_THRESHOLD: {
    title: 'Price Threshold',
    description: 'Market conditions or saved rules that meet your target price.',
    icon: 'fa-solid fa-chart-line',
  },
  CROP: {
    title: 'Crop Updates',
    description: 'Crop-specific updates for crops you follow or interact with.',
    icon: 'fa-solid fa-leaf',
  },
  ADMIN: {
    title: 'Admin Messages',
    description: 'Platform-level messages that may remain mandatory.',
    icon: 'fa-solid fa-shield-halved',
  },
};

const prettifyCategory = (value) => String(value || '')
  .toLowerCase()
  .split('_')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const getCategoryMeta = (item) => {
  const fallbackTitle = prettifyCategory(item?.categoryName);
  return {
    title: CATEGORY_META[item?.categoryName]?.title || fallbackTitle || 'Notification Category',
    description: item?.description || CATEGORY_META[item?.categoryName]?.description || 'Choose how this category should reach you.',
    icon: CATEGORY_META[item?.categoryName]?.icon || 'fa-regular fa-bell',
  };
};

const getToneForDelivery = (deliveryType) => {
  if (deliveryType === 'ALERT') return 'critical';
  if (deliveryType === 'OFF') return 'muted';
  return 'calm';
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

  const counts = useMemo(() => preferences.reduce((acc, item) => {
    const key = item.effectiveDeliveryType || 'NOTIFICATION';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { NOTIFICATION: 0, ALERT: 0, OFF: 0 }), [preferences]);

  if (!open) return null;

  const updateSavedCategory = (categoryName) => {
    setSavedCategory(categoryName);
    window.setTimeout(() => setSavedCategory(''), 1400);
  };

  const handleSelect = async (item, deliveryType) => {
    const categoryName = item.categoryName;
    if (savingCategory === categoryName) return;

    const previous = item;
    const optimistic = {
      ...item,
      userSelectedDeliveryType: deliveryType === item.defaultDeliveryType ? null : deliveryType,
      effectiveDeliveryType: deliveryType,
    };

    setPreferences((prev) => prev.map((entry) => (
      entry.categoryName === categoryName ? optimistic : entry
    )));
    setSavingCategory(categoryName);

    try {
      const updated = await setPreference(categoryName, deliveryType);
      setPreferences((prev) => prev.map((entry) => (
        entry.categoryName === categoryName ? updated : entry
      )));
      updateSavedCategory(categoryName);
    } catch (error) {
      setPreferences((prev) => prev.map((entry) => (
        entry.categoryName === categoryName ? previous : entry
      )));
      onToast?.(error.message || 'Failed to update preference.', 'error');
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
    } catch (error) {
      onToast?.(error.message || 'Failed to reset preferences.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-preferences__overlay" onClick={onClose}>
      <Card className="notification-preferences" onClick={(event) => event.stopPropagation()}>
        <div className="notification-preferences__hero">
          <div className="notification-preferences__head">
            <div>
              <span className="notification-preferences__eyebrow">Message Controls</span>
              <h3>Notification Preferences</h3>
              <p>Choose whether each category should arrive as a notification, an alert, or not at all.</p>
            </div>
            <button type="button" className="notification-preferences__close" onClick={onClose} aria-label="Close preferences">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div className="notification-preferences__summary">
            <div className="notification-preferences__summary-card">
              <span>Notifications</span>
              <strong>{counts.NOTIFICATION}</strong>
            </div>
            <div className="notification-preferences__summary-card notification-preferences__summary-card--alert">
              <span>Alerts</span>
              <strong>{counts.ALERT}</strong>
            </div>
            <div className="notification-preferences__summary-card notification-preferences__summary-card--off">
              <span>Off</span>
              <strong>{counts.OFF}</strong>
            </div>
          </div>
        </div>

        {loading ? <p className="notification-preferences__loading">Loading preferences...</p> : null}

        {!loading ? (
          <div className="notification-preferences__list">
            {preferences.map((item) => {
              const meta = getCategoryMeta(item);
              const saving = savingCategory === item.categoryName;
              const saved = savedCategory === item.categoryName;
              const effectiveDeliveryType = item.effectiveDeliveryType || item.defaultDeliveryType || 'NOTIFICATION';
              const tone = getToneForDelivery(effectiveDeliveryType);
              const usingDefault = !item.userSelectedDeliveryType;

              return (
                <section
                  key={item.categoryName}
                  className={`notification-preferences__row notification-preferences__row--${tone}`}
                >
                  <div className="notification-preferences__row-head">
                    <div className="notification-preferences__icon" aria-hidden="true">
                      <i className={meta.icon} />
                    </div>
                    <div className="notification-preferences__copy">
                      <div className="notification-preferences__title-row">
                        <strong>{meta.title}</strong>
                        <span className={`notification-preferences__pill notification-preferences__pill--${tone}`}>
                          {effectiveDeliveryType}
                        </span>
                        {saved ? <span className="notification-preferences__saved">Saved</span> : null}
                      </div>
                      <p>{meta.description}</p>
                    </div>
                  </div>

                  <div className="notification-preferences__meta">
                    <span>
                      Default: <strong>{item.defaultDeliveryType}</strong>
                    </span>
                    <span>
                      Mode: <strong>{usingDefault ? 'Using default' : 'Customized'}</strong>
                    </span>
                  </div>

                  <div className="notification-preferences__options" role="radiogroup" aria-label={`${meta.title} delivery type`}>
                    {DELIVERY_OPTIONS.map((option) => {
                      const selected = effectiveDeliveryType === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          className={`notification-preferences__option${selected ? ' notification-preferences__option--selected' : ''}`}
                          onClick={() => handleSelect(item, option.key)}
                          disabled={saving}
                          aria-pressed={selected}
                        >
                          <span className="notification-preferences__option-icon" aria-hidden="true">
                            <i className={option.icon} />
                          </span>
                          <span className="notification-preferences__option-copy">
                            <strong>{option.label}</strong>
                            <small>{option.description}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : null}

        <div className="notification-preferences__actions">
          <Button variant="ghost" onClick={handleReset} loading={loading}>Reset to defaults</Button>
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </Card>
    </div>
  );
}
