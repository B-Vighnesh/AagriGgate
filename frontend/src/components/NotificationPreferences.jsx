import React, { useEffect, useMemo, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/NotificationPreferences.css';
import {
  getPreferences,
  resetPreferences,
  setAllPreferencesToNotifications,
  setPreference,
  turnAlertsOff,
  turnAllPreferencesOff,
} from '../lib/notificationApi';

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
  const [bulkLoading, setBulkLoading] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('');

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

  const toggleExpanded = (categoryName) => {
    setExpandedCategory((current) => (current === categoryName ? '' : categoryName));
  };

  const flashSaved = (categoryName) => {
    setSavedCategory(categoryName);
    window.setTimeout(() => setSavedCategory(''), 1500);
  };

  const applyBulkUpdate = async ({ key, successMessage, request }) => {
    if (!preferences.length || bulkLoading) return;
    setBulkLoading(key);
    setInlineError('');

    try {
      const updated = await request();
      setPreferences(updated);
      onToast?.(successMessage, 'success');
    } catch (err) {
      onToast?.(err.message || 'Failed to update all preferences.', 'error');
    } finally {
      setBulkLoading('');
    }
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
        <div className="ntf-prefs-page-section__intro">
          <h2>Notification Settings</h2>
          <p>Choose how each category reaches you. Keep alerts only for items that deserve faster attention.</p>
        </div>
      </div>

      <div className="ntf-prefs-guide" aria-label="Preference guide">
        <article className="ntf-prefs-guide__card">
          <div className="ntf-prefs-guide__top">
            <div className="ntf-prefs-guide__icon"><i className="fa-regular fa-bell" /></div>
            <strong>Notification</strong>
          </div>
          <p>Regular in-app update. Best for routine activity you can check later.</p>
        </article>
        <article className="ntf-prefs-guide__card ntf-prefs-guide__card--alert">
          <div className="ntf-prefs-guide__top">
            <div className="ntf-prefs-guide__icon"><i className="fa-solid fa-triangle-exclamation" /></div>
            <strong>Alert</strong>
          </div>
          <p>High-priority signal. You can keep at most {ALERT_LIMIT} categories here.</p>
        </article>
        <article className="ntf-prefs-guide__card ntf-prefs-guide__card--off">
          <div className="ntf-prefs-guide__top">
            <div className="ntf-prefs-guide__icon"><i className="fa-regular fa-bell-slash" /></div>
            <strong>Off</strong>
          </div>
          <p>Stops that category from appearing in your feed unless the platform must force it.</p>
        </article>
      </div>

      <div className="ntf-prefs-toolbar">
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

        <div className="ntf-prefs-toolbar__actions">
          <button
            type="button"
            className="ntf-prefs-page-section__reset"
            onClick={handleReset}
            disabled={loading || Boolean(bulkLoading)}
          >
            <i className="fa-solid fa-rotate-left" aria-hidden="true" />
            <span>Reset to defaults</span>
          </button>
        </div>
      </div>

      <div className="ntf-prefs-bulk">
        <button
          type="button"
          className={`ntf-prefs-bulk__action ${bulkLoading === 'NOTIFICATION' ? 'is-loading' : ''}`}
          onClick={() => applyBulkUpdate({
            key: 'NOTIFICATION',
            successMessage: 'All categories set to notifications.',
            request: setAllPreferencesToNotifications,
          })}
          disabled={loading || Boolean(bulkLoading)}
        >
          <i className="fa-regular fa-bell" aria-hidden="true" />
          <span>All Notifications</span>
        </button>
        <button
          type="button"
          className={`ntf-prefs-bulk__action ${bulkLoading === 'ALERTS_OFF' ? 'is-loading' : ''}`}
          onClick={() => applyBulkUpdate({
            key: 'ALERTS_OFF',
            successMessage: 'Alert categories changed to notifications.',
            request: turnAlertsOff,
          })}
          disabled={loading || Boolean(bulkLoading)}
        >
          <i className="fa-solid fa-volume-xmark" aria-hidden="true" />
          <span>Alerts Off</span>
        </button>
        <button
          type="button"
          className={`ntf-prefs-bulk__action ntf-prefs-bulk__action--danger ${bulkLoading === 'OFF' ? 'is-loading' : ''}`}
          onClick={() => applyBulkUpdate({
            key: 'OFF',
            successMessage: 'All categories turned off.',
            request: turnAllPreferencesOff,
          })}
          disabled={loading || Boolean(bulkLoading)}
        >
          <i className="fa-regular fa-bell-slash" aria-hidden="true" />
          <span>Turn Off All</span>
        </button>
      </div>

      <div className="ntf-prefs-bulk__hint">
        <span>Quick controls</span>
        <p>Use these when you want a clean reset without opening each category one by one.</p>
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
            const expanded = expandedCategory === item.categoryName;

            return (
              <section
                key={item.categoryName}
                className={`ntf-prefs-row ntf-prefs-row--${tone}${expanded ? ' ntf-prefs-row--expanded' : ''}`}
                role="listitem"
              >
                <button
                  type="button"
                  className="ntf-prefs-row__summary"
                  onClick={() => toggleExpanded(item.categoryName)}
                  aria-expanded={expanded}
                  aria-controls={`pref-options-${item.categoryName}`}
                >
                  <div className="ntf-prefs-row__identity">
                    <div className="ntf-prefs-row__icon" aria-hidden="true">
                      <i className={meta.icon} />
                    </div>
                    <div className="ntf-prefs-row__copy">
                      <div className="ntf-prefs-row__title">
                        <strong>{meta.title}</strong>
                        <span className={`ntf-prefs-row__pill ntf-prefs-row__pill--${tone}`}>{effective}</span>
                        <span className={`ntf-prefs-row__state ${customized ? 'ntf-prefs-row__state--custom' : ''}`}>
                          {customized ? 'Customized' : 'Default'}
                        </span>
                        {savedCategory === item.categoryName ? <span className="ntf-prefs-row__saved">Saved</span> : null}
                      </div>
                      <span>{meta.description}</span>
                    </div>
                  </div>
                  <span className={`ntf-prefs-row__chevron${expanded ? ' ntf-prefs-row__chevron--open' : ''}`} aria-hidden="true">
                    <i className="fa-solid fa-chevron-down" />
                  </span>
                </button>

                <div
                  id={`pref-options-${item.categoryName}`}
                  className={`ntf-prefs-row__panel${expanded ? ' ntf-prefs-row__panel--open' : ''}`}
                >
                  <div className="ntf-prefs-row__options" role="radiogroup" aria-label={`${meta.title} delivery type`}>
                  {DELIVERY_OPTIONS.map((option) => {
                    const selected = effective === option.key;
                    const disableAlertChoice = option.key === 'ALERT' && effective !== 'ALERT' && alertLimitReached;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={`ntf-prefs-option ntf-prefs-option--${option.key.toLowerCase()} ${selected ? 'ntf-prefs-option--selected' : ''}`}
                        onClick={() => handleSelect(item, option.key)}
                        disabled={saving || disableAlertChoice}
                        aria-pressed={selected}
                        title={disableAlertChoice ? `Maximum ${ALERT_LIMIT} alert categories reached` : option.label}
                      >
                        <span className="ntf-prefs-option__radio" aria-hidden="true">
                          <span />
                        </span>
                        <div className="ntf-prefs-option__copy">
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                        </div>
                        <div className="ntf-prefs-option__icon" aria-hidden="true">
                          <i className={selected ? 'fa-solid fa-check' : option.icon} />
                        </div>
                      </button>
                    );
                  })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
