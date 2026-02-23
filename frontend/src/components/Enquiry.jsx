import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { apiFetch } from '../lib/api';
import { getToken } from '../lib/auth';

export default function Enquiry() {
  const navigate = useNavigate();
  const token = getToken();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (text, type = 'info') => {
    setToast({ message: text, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 2600);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      showToast('You must be logged in to send enquiry.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch('/enquiries/enquiry', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to submit enquiry.');
      setSubmitted(true);
      showToast('Enquiry sent successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Server busy. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page enquiry-page">
      <div className="ag-container">
        <Card className="enquiry-card">
          {/* <button type="button" className="link-back" onClick={() => navigate(-1)}>Back</button> */}

          {!submitted ? (
            <>
              <h1>Send an Enquiry</h1>
              <p>Have a question? We are here to help.</p>

              <form className="enquiry-form" onSubmit={onSubmit}>
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe your question or concern..."
                  rows={6}
                  required
                />
                <Button type="submit" loading={loading}>
                  {loading ? 'Sending message...' : 'Send Message'}
                </Button>
              </form>
            </>
          ) : (
            <div className="enquiry-success">
              <h2>Enquiry Sent</h2>
              <p>Thank you. We will respond to your registered email shortly.</p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          )}
        </Card>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
