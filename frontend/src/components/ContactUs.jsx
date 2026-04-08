import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import { requestJson } from '../lib/api';
import { getToken } from '../lib/auth';

const CONTACT_ITEMS = [
  { title: 'Email', value: 'webappfarmer@gmail.com', href: 'mailto:support@aagriggate.in' },
  { title: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { title: 'Office', value: 'Bengaluru, Karnataka, India', href: '' },
];

export default function ContactUs() {
  const navigate = useNavigate();
  const token = getToken();
  const [form, setForm] = useState({ name: '', email: '', message: '', image: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
          <h1>Contact Us</h1>
          <p>We would love to hear from you. Reach out anytime.</p>
        </header>

        <div className="contact-grid">
          <Card className="contact-info-card">
            <h2>Get In Touch</h2>
            <div className="contact-info-list">
              {CONTACT_ITEMS.map((item) => (
                <div key={item.title} className="contact-info-item">
                  <p className="contact-info-item__title">{item.title}</p>
                  {item.href ? (
                    <a href={item.href}>{item.value}</a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="contact-note">
              If you are logged in, you can also use the <Link to="/enquiry">Support page</Link>.
            </p>
          </Card>

          <Card className="contact-form-card">
            {!submitted ? (
              <form className="contact-form" onSubmit={handleSubmit}>
                <label htmlFor="name">Your Name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ravi Kumar"
                  required
                />
                {errors.name ? <p role="alert">{errors.name}</p> : null}

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
                {errors.email ? <p role="alert">{errors.email}</p> : null}

                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows={5}
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

                {submitError ? <p role="alert">{submitError}</p> : null}

                <Button type="submit" loading={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            ) : (
              <div className="contact-success">
                <h3>Message Sent</h3>
                <p>Thank you for contacting AagriGgate. We will get back to you soon.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
