import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CONTACT_INFO = [
  { icon: '📧', label: 'Email', value: 'support@aagriggate.in', href: 'mailto:support@aagriggate.in' },
  { icon: '📞', label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: '📍', label: 'Office', value: 'Bengaluru, Karnataka, India', href: null },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulated send (no back-end endpoint for contact forms in this project)
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 800);
  };

  return (
    <div className="page-wrapper max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="section-title text-4xl">Contact Us</h1>
        <p className="section-subtitle text-base">We'd love to hear from you. Reach out anytime!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>Get In Touch</h2>
            <div className="space-y-4">
              {CONTACT_INFO.map(({ icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>{value}</a>
                    ) : (
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs mt-8" style={{ color: 'var(--color-text-muted)' }}>
            Alternatively, use the <Link to="/enquiry" style={{ color: 'var(--color-primary)' }}>Enquiry form</Link> if you're logged in.
          </p>
        </div>

        {/* Contact Form */}
        <div className="card p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <p className="text-4xl mb-3">✉️</p>
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-success)' }}>Message Sent!</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>We'll get back to you within 24–48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input className="form-input" name="name" required value={form.name} onChange={handleChange} placeholder="Ravi Kumar" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-input min-h-[110px] resize-none"
                  name="message" required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? <><span className="spinner" /> Sending…</> : '📤 Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
