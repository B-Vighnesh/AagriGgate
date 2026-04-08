import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import { requestJson } from '../lib/api';
import { getToken } from '../lib/auth';

const CONTACT_ITEMS = [
  {
    title: 'Email Support',
    value: 'webappfarmer@gmail.com',
    href: 'mailto:webappfarmer@gmail.com',
    description: 'Best for account issues, platform help, and detailed follow-ups.',
  },
  {
    title: 'Call Us',
    value: '+91 8618402581',
    href: 'tel:+918618402581',
    description: 'Useful when you need quick help during working hours.',
  },
  {
    title: 'Office',
    value: 'Mangalore, Karnataka',
    href: '',
    description: 'AagriGgate support and coordination team.',
  },
];

const SUPPORT_PROMISES = [
  'Clear help for platform, access, and account questions',
  'A space to share issues, suggestions, and product feedback',
  'Optional image upload when a screenshot helps explain the problem',
];

export default function ContactUs() {
  const navigate = useNavigate();
  const token = getToken();
  const [form, setForm] = useState({ name: '', email: '', message: '', image: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedSnapshot, setSubmittedSnapshot] = useState(null);

  useEffect(() => {
    if (token) {
      navigate('/enquiry', { replace: true });
    }
  }, [navigate, token]);

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
    setSubmitError('');
  };

  const imageLabel = useMemo(() => form.image?.name || 'No image selected', [form.image]);

  const validateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.message.trim()) {
      nextErrors.message = 'Message is required.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');
    setErrors({});

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('email', form.email.trim());
    formData.append('message', form.message.trim());
    if (form.image) {
      formData.append('image', form.image);
    }

    try {
      await requestJson('/support/contact', {
        method: 'POST',
        body: formData,
      });
      setSubmittedSnapshot({
        name: form.name.trim(),
        email: form.email.trim(),
        hasImage: Boolean(form.image),
      });
      setSubmitted(true);
      setForm({ name: '', email: '', message: '', image: null });
    } catch (error) {
      const apiErrors = error?.details?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        setErrors(apiErrors);
      }
      if (error?.status === 429) {
        setSubmitError('You have reached the maximum of 5 requests. Please register to submit more.');
      } else {
        setSubmitError(error?.message || 'Unable to send your message right now.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page contact-page">
      <div className="ag-container">
        <header className="contact-header">
          <span className="contact-eyebrow">Support Desk</span>
          <h1>Contact AagriGgate</h1>
          <p>Reach our team for help, feedback, and platform-related questions.</p>
        </header>

        <div className="contact-stack">
          <Card className="contact-promise-card">
            <div className="contact-card-head">
              <h2>How We Can Help</h2>
              <p>Use this page when you need guidance, want to report an issue, or want to share feedback.</p>
            </div>
            <div className="contact-promise-list">
              {SUPPORT_PROMISES.map((item) => (
                <div key={item} className="contact-promise-pill">{item}</div>
              ))}
            </div>
          </Card>

          <Card className="contact-form-card">
            {!submitted ? (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-card-head">
                  <h2>Send A Message</h2>
                  <p>Tell us what happened, what you need, or what we can improve.</p>
                </div>

                <div className="contact-form-grid">
                  <div>
                    <label htmlFor="name">Your Name</label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ravi Kumar"
                      required
                    />
                    {errors.name ? <p role="alert" className="contact-form-error">{errors.name}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                    {errors.email ? <p role="alert" className="contact-form-error">{errors.email}</p> : null}
                  </div>
                </div>

                <div>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={6}
                    required
                  />
                  {errors.message ? <p role="alert" className="contact-form-error">{errors.message}</p> : null}
                </div>

                <div className="contact-upload-box">
                  <div>
                    <label htmlFor="image">Image Upload (Optional)</label>
                    <p>Add a screenshot or photo if it helps explain the issue better.</p>
                  </div>
                  <div className="contact-upload-actions">
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <span className="contact-upload-name">{imageLabel}</span>
                  </div>
                </div>

                {submitError ? <p role="alert" className="contact-form-error contact-form-error--banner">{submitError}</p> : null}

                <div className="contact-form-actions">
                  <Button type="submit" loading={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="contact-success">
                <div className="contact-success-badge">Request received</div>
                <h3>Message Sent Successfully</h3>
                <p>Thank you for contacting AagriGgate. Your message has been recorded and our team will review it soon.</p>
                {submittedSnapshot ? (
                  <div className="contact-success-summary">
                    <div className="contact-success-row">
                      <span>Name</span>
                      <strong>{submittedSnapshot.name}</strong>
                    </div>
                    <div className="contact-success-row">
                      <span>Email</span>
                      <strong>{submittedSnapshot.email}</strong>
                    </div>
                    <div className="contact-success-row">
                      <span>Attachment</span>
                      <strong>{submittedSnapshot.hasImage ? 'Included' : 'Not included'}</strong>
                    </div>
                  </div>
                ) : null}
                <div className="contact-success-actions">
                  <Button type="button" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="contact-info-card">
            <div className="contact-card-head">
              <h2>Get In Touch</h2>
              <p>Choose the channel that fits best, or send us a message directly.</p>
            </div>
            <div className="contact-info-list">
              {CONTACT_ITEMS.map((item) => (
                <div key={item.title} className="contact-info-item">
                  <div>
                    <p className="contact-info-item__title">{item.title}</p>
                    {item.href ? (
                      <a href={item.href}>{item.value}</a>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </div>
                  <p className="contact-info-item__desc">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="contact-note">
              If you are logged in, you can also use the <Link to="/enquiry">Support page</Link>.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
