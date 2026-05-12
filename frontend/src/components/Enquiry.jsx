import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { requestJson } from '../lib/api';
import { getToken } from '../lib/auth';

const SUPPORT_TOPICS = [
  {
    value: 'FEEDBACK',
    title: 'Feedback',
    note: 'Share ideas to improve the product experience.',
    detail: 'Best for feature suggestions, usability ideas, and product improvements.',
    icon: 'fa-lightbulb',
  },
  {
    value: 'ENQUIRY',
    title: 'Support Question',
    note: 'Ask about features, account flow, or platform usage.',
    detail: 'Use this when you need guidance, clarification, or platform help from our team.',
    icon: 'fa-circle-question',
  },
  {
    value: 'COMPLAINT',
    title: 'Complaint',
    note: 'Report an issue that needs attention or follow-up.',
    detail: 'Best for bugs, service issues, and situations where you expect a direct response.',
    icon: 'fa-circle-exclamation',
  },
];

const SUPPORT_POINTS = [
  'One place for questions, feedback, and platform issues',
  'Our team reviews requests and follows up through your registered email',
];

export default function Enquiry() {
  const navigate = useNavigate();
  const token = getToken();

  const [form, setForm] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [submittedSnapshot, setSubmittedSnapshot] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState('');

  const showToast = (text, type = 'info') => {
    setToast({ message: text, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const selectedTopic = SUPPORT_TOPICS.find((item) => item.value === form.type) || null;

  const validateForm = () => {
    const nextErrors = {};
    if (!form.type) {
      nextErrors.type = 'Support type is required.';
    }
    if (!form.message.trim()) {
      nextErrors.message = 'Message is required.';
    }
    return nextErrors;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      showToast('You must be logged in to contact support.', 'error');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast(Object.values(validationErrors)[0], 'error');
      return;
    }

    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append('type', form.type);
    formData.append('message', form.message.trim());

    try {
      await requestJson('/support/request', {
        method: 'POST',
        body: formData,
      });
      setSubmittedSnapshot({
        type: SUPPORT_TOPICS.find((item) => item.value === form.type)?.title || form.type,
      });
      setSubmitted(true);
      setForm({ type: '', message: '' });
      showToast('Support request sent successfully.', 'success');
    } catch (err) {
      const apiErrors = err?.details?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        setErrors(apiErrors);
        showToast(Object.values(apiErrors)[0] || 'Please review the form.', 'error');
      } else {
        showToast(err.message || 'Server busy. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page enquiry-page">
      <div className="ag-container">
        <Card className="enquiry-card support-card">
          {!submitted ? (
            <div className="support-layout">
              <div className="support-intro-block">
                <div className="support-hero__copy">
                  <span className="support-kicker">Universal Support</span>
                  <h3>Support, feedback, and complaints</h3>
                  <p>
                   Reach the AagriGgate team for any platform issue, feedback, or account question.</p>
                </div>
               
              </div>

              <div className="support-body-grid">
                <Card className="support-types-card">
                  <div className="support-section-head">
                    <h2>Choose a Request Types</h2>
                    <p>Select the one that best matches your situation.</p>
                  </div>
                  <div className="support-topics support-topics--interactive">
                    {SUPPORT_TOPICS.map((item) => {
                      const isExpanded = expandedTopic === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          className={`support-topic-card ${form.type === item.value ? 'support-topic-card--active' : ''}`}
                          aria-expanded={isExpanded}
                          onClick={() => {
                            setExpandedTopic((prev) => (prev === item.value ? '' : item.value));
                            setForm((prev) => ({ ...prev, type: item.value }));
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.type;
                              return next;
                            });
                          }}
                        >
                          <span className="support-topic-card__icon" aria-hidden="true">
                            <i className={`fa-solid ${item.icon}`} />
                          </span>
                          <span className="support-topic-card__content">
                            <span className="support-topic-card__head">
                              <strong>{item.title}</strong>
                              <span className="support-topic-card__toggle" aria-hidden="true">{isExpanded ? '-' : '+'}</span>
                            </span>
                            <span className="support-topic-card__note">{item.note}</span>
                            {isExpanded ? (
                              <span className="support-topic-card__details">
                                <small>{item.detail}</small>
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="support-form-card">
                  <form className="enquiry-form" onSubmit={onSubmit}>
                    <div className="support-section-head">
                      <h2>Send To Support</h2>
                      <p>Write a clear message so our team can understand and act on your request.</p>
                    </div>

                    {selectedTopic ? (
                      <div className="support-selected-pill">
                        <i className="fa-solid fa-circle-check" aria-hidden="true" />
                        {selectedTopic.title} selected
                      </div>
                    ) : null}

                    <div>
                      <label htmlFor="topic">Support Type</label>
                      <select
                        id="topic"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a support type</option>
                        {SUPPORT_TOPICS.map((item) => (
                          <option key={item.value} value={item.value}>{item.title}</option>
                        ))}
                      </select>
                      {errors.type ? <p role="alert" className="support-form-error">{errors.type}</p> : null}
                    </div>

                    <div>
                      <label htmlFor="message">Your Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us what happened, what you need help with, or what you would like us to improve..."
                        rows={7}
                        maxLength={1000}
                        required
                      />
                      <div className="support-message-count">{form.message.length} / 1000 characters</div>
                      {errors.message ? <p role="alert" className="support-form-error">{errors.message}</p> : null}
                    </div>

                    {/* Image upload disabled. Backend ignores image even if older clients send it.
                    <div className="support-upload-box">
                      <div>
                        <label htmlFor="image">Image Upload (Optional)</label>
                        <p>Add a screenshot or image if it helps your explanation.</p>
                      </div>
                      <div className="support-upload-actions">
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                        />
                        <span className="support-upload-name">{imageLabel}</span>
                      </div>
                    </div>
                    */}

                    <div className="support-form-actions">
                      <span className="support-form-privacy">
                        <i className="fa-solid fa-lock" aria-hidden="true" />
                        Sent to support team only
                      </span>
                      <Button type="submit" loading={loading}>
                        {loading ? 'Sending support request...' : 'Send to Support'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          ) : (
            <div className="enquiry-success support-success">
              <div className="support-success-badge">Request received</div>
              <h2>Support Request Sent</h2>
              <p>Thank you. Our team will review your message and respond to your registered email shortly.</p>
              {submittedSnapshot ? (
                <div className="support-success-summary">
                  <div className="support-success-row">
                    <span>Request Type</span>
                    <strong>{submittedSnapshot.type}</strong>
                  </div>
                </div>
              ) : null}
              <div className="support-success-actions">
                <Button type="button" onClick={() => setSubmitted(false)}>Send Another Message</Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
