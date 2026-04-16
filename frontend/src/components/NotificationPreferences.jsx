import React, { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/NotificationPreferences.css';
import { getPreferences, resetPreferences, setPreference } from '../lib/notificationApi';

/* ── category metadata ───────────────────────────────────── */

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
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

const getMeta = (item) => {
  const cat = CATEGORY_META[item?.categoryName];
  return {
    title: cat?.title || prettifyCategory(item?.categoryName) || 'Notification',
    description: item?.description || cat?.description || '',
    icon: cat?.icon || 'fa-regular fa-bell',
  };
};

/* ── toggle switch ───────────────────────────────────────── */

function Toggle({ checked, onChange, disabled, id, label }) {
  return (
    <label className="ntf-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="ntf-toggle__input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      />
      <span className="ntf-toggle__track" aria-hidden="true">
        <span className="ntf-toggle__thumb" />
      </span>
    </label>
  );
}

/* ── main component ──────────────────────────────────────── */

export default function NotificationPreferences({ open, onClose, onToast }) {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingCategory, setSavingCategory] = useState('');

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

    return () => { active = false; };
  }, [open, onToast]);

  if (!open) return null;

  const isEnabled = (item) => {
    const effective = item.effectiveDeliveryType || item.defaultDeliveryType || 'NOTIFICATION';
    return effective !== 'OFF';
  };

  const handleToggle = async (item) => {
    const categoryName = item.categoryName;
    if (savingCategory === categoryName) return;

    const currentlyEnabled = isEnabled(item);
    const newDelivery = currentlyEnabled ? 'OFF' : (item.defaultDeliveryType || 'NOTIFICATION');

    // optimistic update
    const previous = item;
    const optimistic = {
      ...item,
      effectiveDeliveryType: newDelivery,
      userSelectedDeliveryType: newDelivery === item.defaultDeliveryType ? null : newDelivery,
    };

    setPreferences((prev) =>
      prev.map((entry) => (entry.categoryName === categoryName ? optimistic : entry)),
    );
    setSavingCategory(categoryName);

    try {
      const updated = await setPreference(categoryName, newDelivery);
      setPreferences((prev) =>
        prev.map((entry) => (entry.categoryName === categoryName ? updated : entry)),
      );
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

  const enabledCount = preferences.filter(isEnabled).length;

  return (
    <div className="ntf-prefs-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Notification Preferences">
      <div className="ntf-prefs" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <header className="ntf-prefs__header">
          <div className="ntf-prefs__header-text">
            <h2 className="ntf-prefs__title">Notification Preferences</h2>
            <p className="ntf-prefs__subtitle">
              {enabledCount} of {preferences.length} categories enabled
            </p>
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

        {/* body */}
        <div className="ntf-prefs__body">
          {loading && (
            <div className="ntf-prefs__loading">
              <span className="ui-spinner" aria-hidden="true" />
              <span>Loading preferences…</span>
            </div>
          )}

          {!loading && (
            <div className="ntf-prefs__list" role="list">
              {preferences.map((item) => {
                const meta = getMeta(item);
                const enabled = isEnabled(item);
                const saving = savingCategory === item.categoryName;

                return (
                  <div
                    key={item.categoryName}
                    className={`ntf-prefs__row ${enabled ? '' : 'ntf-prefs__row--off'}`}
                    role="listitem"
                  >
                    <div className="ntf-prefs__row-icon" aria-hidden="true">
                      <i className={meta.icon} />
                    </div>
                    <div className="ntf-prefs__row-copy">
                      <strong>{meta.title}</strong>
                      <span>{meta.description}</span>
                    </div>
                    <Toggle
                      id={`pref-toggle-${item.categoryName}`}
                      checked={enabled}
                      onChange={() => handleToggle(item)}
                      disabled={saving}
                      label={`${meta.title} ${enabled ? 'enabled' : 'disabled'}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* footer */}
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
