import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { requestJson } from '../lib/api';
import { getToken } from '../lib/auth';

const SUPPORT_TOPICS = [
  { value: 'FEEDBACK', title: 'Feedback', note: 'Share ideas to improve the product experience.' },
  { value: 'ENQUIRY', title: 'Enquiry', note: 'Ask about features, account flow, or usage.' },
  { value: 'COMPLAINT', title: 'Complaint', note: 'Report an issue that needs attention or follow-up.' },
];

export default function Enquiry() {
  const navigate = useNavigate();
  const token = getToken();

  const [form, setForm] = useState({ type: '', message: '', image: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (text, type = 'info') => {
    setToast({ message: text, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  const handleChange = (event) => {
    const { name, value, files, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? (files?.[0] || null) : value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

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
    if (form.image) {
      formData.append('image', form.image);
    }

    try {
      await requestJson('/support/request', {
        method: 'POST',
        body: formData,
      });
      setSubmitted(true);
      setForm({ type: '', message: '', image: null });
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
            <>
              <div className="support-hero">
                <div className="support-hero__copy">
                  <span className="support-kicker">Universal Support</span>
                  <h1>Feedback, questions, and complaints in one place</h1>
                  <p>
                    Use this page whenever you want help from the AagriGgate team. Whether it is a platform issue,
                    feature feedback, or an account question, we will review it from here.
                  </p>
                </div>
                <div className="support-topics">
                  {SUPPORT_TOPICS.map((item) => (
                    <div
                      key={item.value}
                      className={`support-topic-card ${form.type === item.value ? 'support-topic-card--active' : ''}`}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form className="enquiry-form" onSubmit={onSubmit}>
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
                {errors.type ? <p role="alert">{errors.type}</p> : null}

                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what happened, what you need help with, or what you would like us to improve..."
                  rows={6}
                  required
                />
                {errors.message ? <p role="alert">{errors.message}</p> : null}

                <label htmlFor="image">Image Upload (Optional)</label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                />
                <Button type="submit" loading={loading}>
                  {loading ? 'Sending support request...' : 'Send to Support'}
                </Button>
              </form>
            </>
          ) : (
            <div className="enquiry-success support-success">
              <h2>Support Request Sent</h2>
              <p>Thank you. Our team will review your message and respond to your registered email shortly.</p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          )}
        </Card>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
