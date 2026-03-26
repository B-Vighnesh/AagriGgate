import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getFarmerId, getToken, getRole } from '../lib/auth';

const FEATURES = [
  {
    title: 'Direct Market Access',
    desc: 'Farmers list crops and set prices. Buyers browse and connect directly with no middleman.',
  },
  {
    title: 'Real-Time Weather',
    desc: 'Use local weather information for harvest planning and crop safety.',
  },
  {
    title: 'Market Insights',
    desc: 'Track demand and pricing trends to make better trade decisions.',
  },
];

const STEPS = [
  { id: '01', title: 'Register', desc: 'Create your farmer or buyer account in minutes.' },
  { id: '02', title: 'List or Browse', desc: 'Farmers list crops and buyers browse offers.' },
  { id: '03', title: 'Connect', desc: 'Discuss requirements and complete transactions directly.' },
  { id: '04', title: 'Grow', desc: 'Use weather and market data to improve outcomes.' },
];

const FAQS = [
  { q: 'How do I register?', a: 'Open Register from the top menu and complete the steps.' },
  { q: 'Is AagriGgate free?', a: 'Yes. The platform is free for both farmers and buyers.' },
  { q: 'How can I contact support?', a: 'Use Contact Us page or email webappfarmer@gmail.com.' },
];

export default function Home() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="home-page">
      <ValidateToken token={token} role={role} farmerId={farmerId} />

      <section className="hero">
        <div className="ag-container">
          <p className="hero__tag">India&apos;s Farmer-First Marketplace</p>
          <h1 className="hero__title">
            Farm to Table, <span>Without the Middleman</span>
          </h1>
          <p className="hero__subtitle">
            AagriGgate connects farmers and buyers for transparent trade and better prices.
          </p>
          <div className="hero__actions">
            {!farmerId && (
              <>
                <Button variant="accent" size="lg" onClick={() => navigate('/register')}>Get Started</Button>
                <Button variant="outline" size="lg" className="hero-outline" onClick={() => navigate('/view-all-crops')}>Browse Crops</Button>
              </>
            )}
            {farmerId && (
              <Button variant="accent" size="lg" onClick={() => navigate('/market')}>Go to Market</Button>
            )}
          </div>
        </div>
      </section>
{/* 
      <section className="stats">
        <div className="container stats__grid">
          <div><strong>5,000+</strong><span>Farmers</span></div>
          <div><strong>12,000+</strong><span>Buyers</span></div>
          <div><strong>Rs 2Cr+</strong><span>Trade Volume</span></div>
        </div>
      </section> */}

      <section className="ag-container section">
        <h2 className="section-title">Why AagriGgate?</h2>
        <p className="section-subtitle">Everything you need to connect, trade, and grow.</p>
        <div className="feature-grid">
          {FEATURES.map((item) => (
            <Card key={item.title} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section section--surface">
        <div className="ag-container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            {STEPS.map((step) => (
              <Card key={step.id} className="step-card">
                <span>{step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="ag-container section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {FAQS.map((item, index) => {
            const open = openFaq === index;
            return (
              <Card key={item.q} className="faq-card">
                <button type="button" className="faq-card__button" onClick={() => setOpenFaq(open ? null : index)}>
                  <span className="faq-card__question">{item.q}</span>
                  <span className="faq-card__toggle">{open ? '-' : '+'}</span>
                </button>
                {open && <p className="faq-card__answer">{item.a}</p>}
              </Card>
            );
          })}
        </div>
      </section>

      {!farmerId && (
        <section className="cta">
          <div className="ag-container">
            <h2>Join AagriGgate Today</h2>
            <p>Sign up free and start trading directly.</p>
            <div className="hero__actions">
              <Button variant="accent" onClick={() => navigate('/register')}>Sign Up</Button>
              <Button variant="outline" className="hero-outline" onClick={() => navigate('/login')}>Already have an account</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
