import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';

const CONTACT_ITEMS = [
  { title: 'Email', value: 'webappfarmer@gmail.com', href: 'mailto:support@aagriggate.in' },
  { title: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { title: 'Office', value: 'Bengaluru, Karnataka, India', href: '' },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 700);
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
              If you are logged in, you can also use the <Link to="/enquiry">Enquiry page</Link>.
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
