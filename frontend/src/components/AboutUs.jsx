import React, { useState } from 'react';
import Card from './common/Card';
import { getRole } from '../lib/auth';

// ─── Data ────────────────────────────────────────────────────────────────────

const WHAT_WE_DO = [
  ['Direct Trade', 'Farmers list crops and buyers respond directly — no middlemen, no hidden charges.'],
  ['Mandi Prices', 'Daily APMC and mandi prices with historical trends to help both sides negotiate fairly.'],
  ['Weather Insights', 'Hyperlocal weather data to plan harvest, transport, and selling windows.'],
  ['Buyer Requests', 'Buyers post crop requirements directly to farmers on the platform.'],
  ['In-App Chat', 'Negotiation chat between farmers and buyers after request acceptance.'],
  ['Crop Waste Market', 'Farmers list agricultural waste for poultry farms and agri businesses — reducing losses.'],
];

const VALUES = [
  'No hidden charges',
  'No middlemen',
  'Transparent pricing',
  'Direct communication',
  'Verified profiles',
  'Local context',
];

const FARMER_FEATURES = [
  ['Add crop for sale', 'Sell directly'],
  ['Crop waste listing', 'Move surplus or lower-grade produce separately'],
  ['Urgent sell option', 'Push time-sensitive listings faster'],
  ['Discount pricing', 'Offer quicker deals when needed'],
  ['View buyer requests', 'Demand visibility'],
  ['In-app chat', 'Negotiate post-acceptance'],
  ['Weather info', 'Plan farming'],
  ['Mandi prices', 'Know fair rates before listing'],
  ['Notifications', 'Stay updated on requests and responses'],
  ['Hidden profile', 'Privacy until deal is accepted'],
  ['OTP login', 'Easy access'],
];

const BUYER_FEATURES = [
  ['Browse all crops', 'Direct sourcing from farmers'],
  ['Browse urgent crops', 'Catch time-sensitive deals sooner'],
  ['Browse waste crops', 'Source lower-cost surplus produce'],
  ['Browse discount listings', 'Spot reduced-price crops quickly'],
  ['Send crop requirement', 'Post bulk purchase needs directly'],
  ['In-app chat', 'Negotiate with farmer post-acceptance'],
  ['Mandi prices', 'Know fair rates before negotiating'],
  ['Request tracking', 'Follow your requests end to end'],
  ['Notifications', 'Get alerted on request updates'],
];

const PHASES = [
  {
    phase: 'Phase 1',
    title: 'Core Marketplace',
    status: 'complete',
    statusLabel: 'Complete',
    desc: 'The foundational trade layer — crop listings, buyer requests, mandi prices, and contact reveal after acceptance.',
    items: [
      'OTP and password login for farmers and buyers',
      'Crop listings with photos, updates, and status',
      'Search and filters by location, type, and price',
      'Buyer purchase requests with contact reveal on acceptance',
      'Daily mandi price display with basic trends',
      'Crop waste marketplace for surplus produce',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Engagement Layer',
    status: 'complete',
    statusLabel: 'Complete',
    desc: 'Communication, administration, and real-world data services that make AagriGgate an active ecosystem.',
    items: [
      'In-app negotiation chat post request acceptance',
      'Scalable notifications with preference controls',
      'Hyperlocal weather data via daily scheduler',
      'Agriculture news from verified sources',
      'Admin panel for users, listings, and complaints',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Insights & Optimisation',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    desc: 'Price graphs, demand heatmaps, crop recommendations, and custom alerts — turning data into decisions.',
    items: [
      'Price trend graphs using historical mandi data',
      'Farmer network — community Q&A between farmers',
      'Demand heatmaps for high-demand regions',
      'Custom market alerts by price and location',
      'Automatic weather alerts for rain, heat, and wind',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'AI & Predictive Intelligence',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    desc: 'ML models, computer vision, and smart advisory engines that personalise the platform for every farmer.',
    items: [
      'AI price prediction based on historical market data',
      'Crop detection via image — quality and variety',
      'Smart alerts synthesising weather, subsidies, and laws',
      'AI chatbot for platform usage and market understanding',
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Ecosystem & Transactions',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    desc: 'Payments, logistics, warehousing, and a fertilizer marketplace — completing the full trade loop.',
    items: [
      'Escrow-based direct payments between farmers and buyers',
      'Transport and warehouse booking integration',
      'Fertilizers and seeds marketplace for verified sellers',
      'Multi-language support across Indian states',
    ],
  },
  {
    phase: 'Phase 6',
    title: 'Rural Intelligence & Access',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    desc: 'Extends AagriGgate beyond digital — assisted access, offline mode, and on-field IoT data.',
    items: [
      'Agent network — trained local agents assist farmers on-ground',
      'Offline mode with SMS fallback and automatic data sync',
      'IoT integration for soil, weather, and crop field sensors',
    ],
  },
];

const FAQS = [
  ['Is AagriGgate free to use?', 'Yes. The platform is built around direct trade with no hidden charges.'],
  ['Who can use the platform?', 'Farmers and buyers can both register and use the platform.'],
  ['How are farmers and buyers connected?', 'Through crop listings, buyer requests, and contact revealed only after acceptance.'],
  ['Does the platform charge commission?', 'No. The platform stays focused on transparent, direct trade.'],
  ['When is contact information shared?', 'Contact details are revealed only after a buyer request is accepted by the farmer — protecting both parties.'],
  ['Is there a chat feature?', 'Yes. After a request is accepted, farmers and buyers can negotiate directly via in-app chat.'],
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="faq-list">
      {items.map(([q, a], index) => {
        const open = openIndex === index;
        return (
          <Card key={q} className="faq-card">
            <button
              type="button"
              className="faq-card__button"
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span className="faq-card__question">{q}</span>
              <span className="faq-card__toggle">{open ? '\u2212' : '+'}</span>
            </button>
            {open && <p className="faq-card__answer">{a}</p>}
          </Card>
        );
      })}
    </div>
  );
}

function PhaseCard({ phase, title, status, statusLabel, desc, items }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`about-phase-card about-phase-card--${status}`}>
      <button
        type="button"
        className="about-phase-card__header"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="about-phase-card__meta">
          <span className="about-phase-card__phase">{phase}</span>
          <span className={`about-phase-badge about-phase-badge--${status}`}>{statusLabel}</span>
        </div>
        <div className="about-phase-card__title-row">
          <h3 className="about-phase-card__title">{title}</h3>
          <span className="about-phase-card__toggle">{open ? '\u2212' : '+'}</span>
        </div>
        <p className="about-phase-card__desc">{desc}</p>
      </button>
      {open && (
        <ul className="about-phase-card__items">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutUs() {
  const role = getRole();
  const isFarmer = role === 'farmer';

  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <p className="about-hero__kicker">About AagriGgate</p>
        <h1 className="about-hero__title">Direct farm-to-buyer trade. No middlemen.</h1>
        <p className="about-hero__sub">
          AagriGgate connects farmers and buyers through transparent crop listings,
          daily mandi prices, weather insights, and in-app negotiation — all in one place.
        </p>
      </section>

      {/* What we do */}
      <section className="ag-container about-section">
        <p className="about-section__kicker">What We Do</p>
        <h2 className="about-section__title">One platform for the full trade journey</h2>
        <div className="about-highlights-grid">
          {WHAT_WE_DO.map(([title, desc]) => (
            <Card key={title} className="about-highlight-card">
              <strong>{title}</strong>
              <p>{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Role-specific features */}
      <section className="about-section about-section--surface">
        <div className="ag-container">
          <p className="about-section__kicker">
            {isFarmer ? 'For You \u2014 Farmer' : 'For You \u2014 Buyer'}
          </p>
          <h2 className="about-section__title">
            {isFarmer
              ? 'Tools built for farmers who want to sell smarter'
              : 'Tools built for buyers who want direct sourcing'}
          </h2>
          <div className="about-features-list">
            {(isFarmer ? FARMER_FEATURES : BUYER_FEATURES).map(([feature, why]) => (
              <div key={feature} className="about-feature-row">
                <strong>{feature}</strong>
                <span>{why}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="ag-container about-section">
        <p className="about-section__kicker">Our Values</p>
        <h2 className="about-section__title">Built around trust and transparency</h2>
        <div className="trust-strip">
          {VALUES.map((val) => (
            <Card key={val} className="trust-chip-card">
              <strong>{val}</strong>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform Phases */}
      <section className="about-section about-section--surface">
        <div className="ag-container">
          <p className="about-section__kicker">Platform Roadmap</p>
          <h2 className="about-section__title">How we are building AagriGgate</h2>
          <p className="about-section__sub">
            Six phases take AagriGgate from a core marketplace to a full agricultural operating system.
            Tap any phase to see what is inside.
          </p>
          <div className="about-phases-list">
            {PHASES.map((p) => (
              <PhaseCard key={p.phase} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ag-container about-section">
        <p className="about-section__kicker">FAQ</p>
        <h2 className="about-section__title">Common questions</h2>
        <FAQAccordion items={FAQS} />
      </section>

      {/* Contact */}
      <section className="about-section about-section--surface">
        <div className="ag-container">
          <p className="about-section__kicker">Contact & Support</p>
          <h2 className="about-section__title">Reach us directly</h2>
          <div className="about-contact-grid">
            <Card className="about-contact-card">
              <p className="about-contact-card__label">Email</p>
              <a href="mailto:webappfarmer@gmail.com">webappfarmer@gmail.com</a>
            </Card>
            <Card className="about-contact-card">
              <p className="about-contact-card__label">Phone</p>
              <a href="tel:+918618402581">+91 86184 02581</a>
            </Card>
            <Card className="about-contact-card">
              <p className="about-contact-card__label">Location</p>
              <span>Mangalore, Karnataka</span>
            </Card>
          </div>
          <p className="about-legal">&copy; 2026 AagriGgate. All rights reserved.</p>
        </div>
      </section>

    </div>
  );
}