import React, { useEffect, useMemo, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/NotificationPreferences.css';
import { getPreferences, resetPreferences, setPreference } from '../lib/notificationApi';

const ALERT_LIMIT = 5;

const DELIVERY_OPTIONS = [
  {
    key: 'NOTIFICATION',
    label: 'Notification',
    icon: 'fa-regular fa-bell',
    description: 'Shows in your notifications feed without urgent treatment.',
  },
  {
    key: 'ALERT',
    label: 'Alert',
    icon: 'fa-solid fa-triangle-exclamation',
    description: 'Reserved for high-priority items that need faster attention.',
  },
  {
    key: 'OFF',
    label: 'Off',
    icon: 'fa-regular fa-bell-slash',
    description: 'Turns this category off unless the platform forces delivery.',
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

export default function NotificationPreferences({ onToast }) {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingCategory, setSavingCategory] = useState('');
  const [savedCategory, setSavedCategory] = useState('');
  const [inlineError, setInlineError] = useState('');

  useEffect(() => {
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
  }, [onToast]);

  const counts = useMemo(() => preferences.reduce((acc, item) => {
    const key = getEffectiveDeliveryType(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { NOTIFICATION: 0, ALERT: 0, OFF: 0 }), [preferences]);

  const alertLimitExceeded = counts.ALERT > ALERT_LIMIT;
  const alertLimitReached = counts.ALERT >= ALERT_LIMIT;

  const flashSaved = (categoryName) => {
    setSavedCategory(categoryName);
    window.setTimeout(() => setSavedCategory(''), 1500);
  };

  const handleSelect = async (item, deliveryType) => {
    const categoryName = item.categoryName;
    const currentDelivery = getEffectiveDeliveryType(item);
    const switchingToNewAlert = deliveryType === 'ALERT' && currentDelivery !== 'ALERT';

    if (savingCategory === categoryName) return;

    if (switchingToNewAlert && alertLimitReached) {
      const message = `You can keep at most ${ALERT_LIMIT} categories as alerts. Change one of the current alerts first.`;
      setInlineError(message);
      onToast?.(message, 'error');
      return;
    }

    setInlineError('');
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
    setInlineError('');
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
    <section id="notification-preferences" className="ntf-prefs-page-section" aria-label="Notification preferences">
      <div className="ntf-prefs-page-section__head">
        <div>
          <span className="ntf-prefs-page-section__eyebrow">Preference Controls</span>
          <h2>Notification Settings</h2>
          <p>Set how each category should reach you. Choose carefully so only the most urgent items become alerts.</p>
        </div>
        <button
          type="button"
          className="ntf-prefs-page-section__reset"
          onClick={handleReset}
          disabled={loading}
        >
          Reset to defaults
        </button>
      </div>

      <div className="ntf-prefs-summary">
        <div className="ntf-prefs-summary__card">
          <span>Notifications</span>
          <strong>{counts.NOTIFICATION}</strong>
        </div>
        <div className="ntf-prefs-summary__card ntf-prefs-summary__card--alert">
          <span>Alerts</span>
          <strong>{counts.ALERT} / {ALERT_LIMIT}</strong>
        </div>
        <div className="ntf-prefs-summary__card ntf-prefs-summary__card--off">
          <span>Off</span>
          <strong>{counts.OFF}</strong>
        </div>
      </div>

      {alertLimitExceeded ? (
        <div className="ntf-prefs-feedback ntf-prefs-feedback--error">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span>You currently have more than {ALERT_LIMIT} alert categories. Reduce them to stay within the limit.</span>
        </div>
      ) : null}

      {inlineError ? (
        <div className="ntf-prefs-feedback ntf-prefs-feedback--error">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span>{inlineError}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="ntf-prefs-loading">
          <span className="ui-spinner" aria-hidden="true" />
          <span>Loading preferences...</span>
        </div>
      ) : (
        <div className="ntf-prefs-list" role="list">
          {preferences.map((item) => {
            const meta = getMeta(item);
            const effective = getEffectiveDeliveryType(item);
            const saving = savingCategory === item.categoryName;
            const tone = getTone(effective);
            const customized = Boolean(item.userSelectedDeliveryType);

            return (
              <section
                key={item.categoryName}
                className={`ntf-prefs-row ntf-prefs-row--${tone}`}
                role="listitem"
              >
                <div className="ntf-prefs-row__head">
                  <div className="ntf-prefs-row__icon" aria-hidden="true">
                    <i className={meta.icon} />
                  </div>
                  <div className="ntf-prefs-row__copy">
                    <div className="ntf-prefs-row__title">
                      <strong>{meta.title}</strong>
                      <span className={`ntf-prefs-row__pill ntf-prefs-row__pill--${tone}`}>{effective}</span>
                      {savedCategory === item.categoryName ? <span className="ntf-prefs-row__saved">Saved</span> : null}
                    </div>
                    <span>{meta.description}</span>
                  </div>
                </div>

                <div className="ntf-prefs-row__meta">
                  <span>Default: <strong>{item.defaultDeliveryType}</strong></span>
                  <span>{customized ? 'Custom selection' : 'Using system default'}</span>
                </div>

                <div className="ntf-prefs-row__options" role="radiogroup" aria-label={`${meta.title} delivery type`}>
                  {DELIVERY_OPTIONS.map((option) => {
                    const selected = effective === option.key;
                    const disableAlertChoice = option.key === 'ALERT' && effective !== 'ALERT' && alertLimitReached;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={`ntf-prefs-option ${selected ? 'ntf-prefs-option--selected' : ''}`}
                        onClick={() => handleSelect(item, option.key)}
                        disabled={saving || disableAlertChoice}
                        aria-pressed={selected}
                        title={disableAlertChoice ? `Maximum ${ALERT_LIMIT} alert categories reached` : option.label}
                      >
                        <div className="ntf-prefs-option__icon" aria-hidden="true">
                          <i className={option.icon} />
                        </div>
                        <div className="ntf-prefs-option__copy">
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
    </section>
  );
}
