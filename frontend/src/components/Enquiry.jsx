import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import { apiFetch } from '../lib/api';
import { getToken } from '../lib/auth';

const SUPPORT_TOPICS = [
  { title: 'Feedback', note: 'Share ideas to improve the product experience.' },
  { title: 'Question', note: 'Ask about features, account flow, or usage.' },
  { title: 'Complaint', note: 'Report an issue that needs attention or follow-up.' },
];

export default function Enquiry() {
  const navigate = useNavigate();
  const token = getToken();

  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('Feedback');
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
      showToast('You must be logged in to contact support.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch('/admin/enquiry', {
        method: 'POST',
        body: JSON.stringify({ message: `[${topic}] ${message}` }),
      });
      if (!response.ok) throw new Error('Failed to submit support request.');
      setSubmitted(true);
      showToast('Support request sent successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Server busy. Please try again.', 'error');
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
                    <div key={item.title} className={`support-topic-card ${topic === item.title ? 'support-topic-card--active' : ''}`}>
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
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  required
                >
                  {SUPPORT_TOPICS.map((item) => (
                    <option key={item.title} value={item.title}>{item.title}</option>
                  ))}
                </select>

                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what happened, what you need help with, or what you would like us to improve..."
                  rows={6}
                  required
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
