import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    label: 'N',
    title: 'Notification',
    icon: 'fa-regular fa-bell',
  },
  {
    key: 'ALERT',
    label: 'A',
    title: 'Alert',
    icon: 'fa-solid fa-triangle-exclamation',
  },
  {
    key: 'OFF',
    label: 'Off',
    title: 'Off',
    icon: 'fa-regular fa-bell-slash',
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

export default function NotificationPreferences({ onToast }) {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingCategory, setSavingCategory] = useState('');
  const [savedCategory, setSavedCategory] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [bulkLoading, setBulkLoading] = useState('');

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
      <div className="ntf-prefs-page-section__topbar">
        <button
                    type="button"
                    className="chat-back-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    title="Go back"
                  >
                    <i className="fa-solid fa-chevron-left" />
          </button>
      </div>

      <div className="ntf-prefs-page-section__head">
        <div className="ntf-prefs-page-section__intro">
          <h2>Notification Settings</h2>
          <p>Manage how you get notified.</p>
        </div>
      </div>

      <div className="ntf-stats" aria-label="Notification preference summary">
        <div className="ntf-stat-chip">
          <i className="fa-regular fa-bell" aria-hidden="true" />
          <strong>{counts.NOTIFICATION}</strong>
          <span>Notifications</span>
        </div>
        <div className="ntf-stat-chip ntf-stat-chip--alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <strong>{counts.ALERT}/{ALERT_LIMIT}</strong>
          <span>Alerts</span>
        </div>
        <div className="ntf-stat-chip ntf-stat-chip--off">
          <i className="fa-regular fa-bell-slash" aria-hidden="true" />
          <strong>{counts.OFF}</strong>
          <span>Off</span>
        </div>
      </div>

      <div className="ntf-quick-controls" aria-label="Quick notification controls">
        <button
          type="button"
          className={`ntf-quick-btn ntf-quick-btn--primary ${bulkLoading === 'NOTIFICATION' ? 'is-loading' : ''}`}
          onClick={() => applyBulkUpdate({
            key: 'NOTIFICATION',
            successMessage: 'All categories set to notifications.',
            request: setAllPreferencesToNotifications,
          })}
          disabled={loading || Boolean(bulkLoading)}
        >
          <i className="fa-regular fa-bell" aria-hidden="true" />
          <span>
            <strong>All On</strong>
            <small>Set all to N</small>
          </span>
        </button>
        <button
          type="button"
          className={`ntf-quick-btn ${bulkLoading === 'ALERTS_OFF' ? 'is-loading' : ''}`}
          onClick={() => applyBulkUpdate({
            key: 'ALERTS_OFF',
            successMessage: 'Alert categories changed to notifications.',
            request: turnAlertsOff,
          })}
          disabled={loading || Boolean(bulkLoading)}
        >
          <i className="fa-solid fa-volume-xmark" aria-hidden="true" />
          <span>
            <strong>Alerts Off</strong>
            <small>A becomes N</small>
          </span>
        </button>
        <button
          type="button"
          className={`ntf-quick-btn ntf-quick-btn--danger ${bulkLoading === 'OFF' ? 'is-loading' : ''}`}
          onClick={() => applyBulkUpdate({
            key: 'OFF',
            successMessage: 'All categories turned off.',
            request: turnAllPreferencesOff,
          })}
          disabled={loading || Boolean(bulkLoading)}
        >
          <i className="fa-regular fa-bell-slash" aria-hidden="true" />
          <span>
            <strong>All Off</strong>
            <small>Set all to Off</small>
          </span>
        </button>
        <button
          type="button"
          className="ntf-quick-btn"
          onClick={handleReset}
          disabled={loading || Boolean(bulkLoading)}
        >
          <i className="fa-solid fa-rotate-left" aria-hidden="true" />
          <span>
            <strong>Reset</strong>
            <small>Use defaults</small>
          </span>
        </button>
      </div>

      <div className="ntf-mode-legend" aria-label="Delivery mode guide">
        <div className="ntf-mode-legend__item">
          <span className="ntf-mode-legend__badge ntf-mode-legend__badge--notification">N</span>
          <span>Notification: regular feed update</span>
        </div>
        <div className="ntf-mode-legend__item">
          <span className="ntf-mode-legend__badge ntf-mode-legend__badge--alert">A</span>
          <span>Alert: urgent, limited to {ALERT_LIMIT}</span>
        </div>
        <div className="ntf-mode-legend__item">
          <span className="ntf-mode-legend__badge ntf-mode-legend__badge--off">Off</span>
          <span>Off: hide this category</span>
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
          <div className="ntf-prefs-list__label">Categories</div>
          {preferences.map((item) => {
            const meta = getMeta(item);
            const effective = getEffectiveDeliveryType(item);
            const saving = savingCategory === item.categoryName;
            const customized = Boolean(item.userSelectedDeliveryType);

            return (
              <div key={item.categoryName} className="notif-category-row" role="listitem">
                <div className="notif-category-row__left">
                  <div className="notif-category-row__icon" aria-hidden="true">
                    <i className={meta.icon} />
                  </div>
                  <div className="notif-category-row__copy">
                    <div className="notif-category-row__name">
                      {meta.title}
                      {customized ? <span>Custom</span> : null}
                      {savedCategory === item.categoryName ? <span>Saved</span> : null}
                    </div>
                    <div className="notif-category-row__desc">{meta.description}</div>
                  </div>
                </div>

                <div className="notif-segment" role="radiogroup" aria-label={`${meta.title} delivery type`}>
                  {DELIVERY_OPTIONS.map((option) => {
                    const selected = effective === option.key;
                    const disableAlertChoice = option.key === 'ALERT' && effective !== 'ALERT' && alertLimitReached;
                    const activeClass = selected && option.key === 'ALERT'
                      ? 'notif-segment__btn--active-alert'
                      : selected && option.key === 'OFF'
                        ? 'notif-segment__btn--active-off'
                        : selected
                          ? 'notif-segment__btn--active'
                          : '';

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={`notif-segment__btn ${activeClass}`}
                        onClick={() => handleSelect(item, option.key)}
                        disabled={saving || disableAlertChoice}
                        aria-checked={selected}
                        role="radio"
                        title={disableAlertChoice ? `Maximum ${ALERT_LIMIT} alert categories reached` : option.title}
                      >
                        {saving && selected ? '...' : option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
