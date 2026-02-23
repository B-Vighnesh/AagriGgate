import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../lib/auth';

export default function Enquiry() {
  const navigate = useNavigate();
  const token = getToken();

  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { setError('You must be logged in to send an enquiry.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/enquiries/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message }),
      });
      if (res.ok) setSubmitted(true);
      else setError('Failed to submit. Please try again.');
    } catch { setError('Server busy. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, #d8f3dc 100%)' }}
    >
      <div className="card p-8 w-full max-w-lg animate-fade-in-up">
        <button onClick={() => navigate(-1)} className="text-sm font-medium mb-4 block" style={{ color: 'var(--color-primary)' }}>← Back</button>

        {submitted ? (
          <div className="text-center py-6">
            <p className="text-5xl mb-3">📨</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>Enquiry Sent!</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              Thank you for your message. We'll respond to your registered email shortly.
            </p>
            <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        ) : (
          <>
            <h1 className="section-title text-2xl">Send an Enquiry</h1>
            <p className="section-subtitle">Have a question? We're here to help.</p>

            {error && <p className="text-sm mb-3 font-medium" style={{ color: 'var(--color-error)' }}>{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Your Message *</label>
                <textarea
                  className="form-input min-h-[130px] resize-none"
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your question or concern…"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? <><span className="spinner" /> Sending…</> : '📤 Send Message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
