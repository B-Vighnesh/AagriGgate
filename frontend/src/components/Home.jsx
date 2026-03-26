import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getFarmerId, getToken, getRole } from '../lib/auth';

const CORE_POINTS = [
  'No hidden charges for farmers or buyers',
  'Direct farmer-to-buyer discovery',
  'Transparent crop pricing and demand visibility',
  'Simple OTP-based account access',
];

const TRUST_POINTS = [
  {
    title: 'No Hidden Charges',
    desc: 'AagriGgate focuses on direct trade value, not surprise platform fees.',
  },
  {
    title: 'Farmer and Buyer Profiles',
    desc: 'Verified account details and profile visibility improve trust before a deal starts.',
  },
  {
    title: 'Location-Based Selling',
    desc: 'Region, state, and district context help users evaluate nearby opportunities faster.',
  },
];

const FARMER_FEATURES = [
  ['Add crop for sale', 'Sell directly'],
  ['View buyer requests', 'Demand visibility'],
  ['Weather info', 'Plan farming'],
  ['Market price', 'Avoid middlemen'],
  ['Direct contact with buyers', 'Negotiate directly'],
  ['Profile', 'Build trust'],
  ['OTP login', 'Easy access'],
  ['Location-based buyers', 'Nearby sales'],
];

const BUYER_FEATURES = [
  ['Find farmers', 'Direct sourcing'],
  ['Send crop requirement through requests', 'Bulk purchase planning'],
  ['View crop details', 'Quality info'],
  ['Contact farmer', 'Direct deal'],
  ['Location context', 'Better logistics planning'],
  ['Price negotiation', 'Better rates'],
];

const ADMIN_FUTURE = [
  ['Approve sellers', 'Prevent fraud'],
  ['Remove fake users', 'Improve trust'],
  ['View transactions', 'Analytics'],
  ['Platform stats', 'Growth tracking'],
];

const FUTURE_ROADMAP = [
  ['Price prediction', 'Very powerful'],
  ['Weather alerts', 'Useful'],
  ['Crop demand heatmap', 'Smart selling'],
  ['Transport booking', 'Logistics'],
  ['Fertilizer marketplace', 'Extra revenue'],
  ['Loan / subsidy info', 'Farmer support'],
  ['AI crop recommendation', 'Advanced'],
  ['Warehouse booking', 'Storage'],
  ['Digital contract', 'Trust'],
  ['Escrow payment', 'Secure payment'],
];

const FAQS = [
  { q: 'Is AagriGgate free to use?', a: 'Yes. The current platform experience is focused on direct trade without hidden charges.' },
  { q: 'Who can use the app?', a: 'Both farmers and buyers can register, manage profiles, and use crop discovery or request flows.' },
  { q: 'What makes it different?', a: 'It combines crop listings, requests, weather, market pricing, and direct contact in one place.' },
];

function FeatureTable({ title, rows, tone = 'default' }) {
  return (
    <Card className={`feature-table feature-table--${tone}`}>
      <h3>{title}</h3>
      <div className="feature-table__rows">
        {rows.map(([feature, why]) => (
          <div key={`${title}-${feature}`} className="feature-table__row">
            <strong>{feature}</strong>
            <span>{why}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

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
            AagriGgate helps farmers and buyers connect directly with transparent pricing, local context,
            and practical tools for everyday trade.
          </p>

          <div className="hero__points">
            {CORE_POINTS.map((point) => (
              <span key={point} className="hero__point">{point}</span>
            ))}
          </div>

          <div className="hero__actions">
            {!farmerId && (
              <>
                <Button variant="accent" size="lg" onClick={() => navigate('/register')}>Get Started</Button>
                <Button variant="outline" size="lg" className="hero-outline" onClick={() => navigate('/view-all-crops')}>Browse Crops</Button>
              </>
            )}
            {farmerId && (
              <>
                <Button variant="accent" size="lg" onClick={() => navigate('/market')}>Go to Market</Button>
                <Button variant="outline" size="lg" className="hero-outline" onClick={() => navigate('/weather')}>Check Weather</Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="problem" className="ag-container section">
        <div className="home-split">
          <div>
            <p className="section-kicker">Problem Statement</p>
            <h2 className="section-title">Trade is still too fragmented for everyday farmers and buyers</h2>
            <p className="section-subtitle">
              Farmers often struggle with price opacity, scattered demand, and middlemen pressure. Buyers struggle
              to discover reliable sellers, compare listings clearly, and build confidence before reaching out.
            </p>
          </div>
          <Card className="problem-card">
            <h3>What AagriGgate solves</h3>
            <ul className="home-list">
              <li>One place to list, discover, compare, and respond</li>
              <li>Local selling context with state, district, and region-aware listings</li>
              <li>Practical tools like weather and market price data inside the same flow</li>
              <li>Direct connection between farmers and buyers without unnecessary complexity</li>
            </ul>
          </Card>
        </div>
      </section>

      <section id="trust" className="section section--surface">
        <div className="ag-container">
          <p className="section-kicker">Trust and Transparency</p>
          <h2 className="section-title">Built around fair trade, visibility, and straightforward access</h2>
          <div className="feature-grid">
            {TRUST_POINTS.map((item) => (
              <Card key={item.title} className="feature-card feature-card--trust">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="ag-container section">
        <p className="section-kicker">Features Based on Current Backend</p>
        <h2 className="section-title">What users can already do on the platform</h2>
        <p className="section-subtitle">The app already supports direct crop trade workflows for farmers and buyers.</p>
        <div className="feature-table-grid">
          <FeatureTable title="For Farmers" rows={FARMER_FEATURES} tone="farmer" />
          <FeatureTable title="For Buyers" rows={BUYER_FEATURES} tone="buyer" />
        </div>
      </section>

      <section id="taglines" className="section section--surface">
        <div className="ag-container">
          <p className="section-kicker">Product Taglines</p>
          <div className="tagline-grid">
            <Card className="tagline-card">
              <h3>Sell locally. Trade directly. Grow confidently.</h3>
              <p>A product experience designed to reduce friction between harvest and demand.</p>
            </Card>
            <Card className="tagline-card">
              <h3>Clear prices, real buyers, practical tools.</h3>
              <p>Everything important stays inside the same platform instead of being scattered across channels.</p>
            </Card>
            <Card className="tagline-card">
              <h3>Made for trust, not hidden costs.</h3>
              <p>Transparent profiles, request workflows, and direct contact keep the trade path simpler.</p>
            </Card>
          </div>
        </div>
      </section>

      <section id="future" className="ag-container section">
        <p className="section-kicker">Future Direction</p>
        <h2 className="section-title">Planned features that can make AagriGgate stand out</h2>
        <p className="section-subtitle">These additions can push the platform from useful to genuinely powerful.</p>
        <div className="feature-table-grid">
          <FeatureTable title="For Admin (Future)" rows={ADMIN_FUTURE} tone="admin" />
          <FeatureTable title="Standout Roadmap" rows={FUTURE_ROADMAP} tone="roadmap" />
        </div>
      </section>

      <section id="faq" className="ag-container section">
        <p className="section-kicker">FAQs</p>
        <h2 className="section-title">Common questions about the platform</h2>
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
            <p className="section-kicker section-kicker--light">Ready to Join?</p>
            <h2>Start selling or sourcing with more clarity</h2>
            <p>Sign up free, browse crops, and use direct request flows without hidden platform charges.</p>
            <div className="hero__actions">
              <Button variant="accent" onClick={() => navigate('/register')}>Sign Up</Button>
              <Button variant="outline" className="hero-outline" onClick={() => navigate('/login')}>Sign In</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
