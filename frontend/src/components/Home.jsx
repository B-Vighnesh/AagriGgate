import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { getFarmerId, getToken, getRole } from '../lib/auth';

const SLIDES = [
  {
    eyebrow: 'Direct Trade',
    title: 'Connecting Farmers Directly with Buyers - No Middlemen',
    subtitle: 'Sell crops, discover buyers, track market prices, and plan with weather insights - all in one platform.',
    primary: 'Sell Your Crop',
    secondary: 'Browse Crops',
    panelKicker: 'Why this matters',
    panelTitle: 'Direct trade keeps the conversation simple and transparent.',
    panelPoints: [
      ['Direct Listings', 'Farmers publish crops and buyers respond without marketplace clutter.'],
      ['Faster Decisions', 'One place for listing, response, and contact removes unnecessary delay.'],
      ['No Middlemen', 'The platform stays focused on direct connection and clearer pricing.'],
    ],
  },
  {
    eyebrow: 'Market Intelligence',
    title: 'Know Market Prices Before You Sell',
    subtitle: 'Track real-time market prices and demand so you can decide when and where to sell.',
    primary: 'Check Market Prices',
    secondary: 'Browse Crops',
    panelKicker: 'Market edge',
    panelTitle: 'Better price visibility improves timing and confidence.',
    panelPoints: [
      ['Price Context', 'Compare your listing with live market information before setting expectations.'],
      ['Demand Signals', 'Buyer request activity helps reveal which listings attract faster interest.'],
      ['Smarter Selling', 'You decide when to sell with more clarity and less guesswork.'],
    ],
  },
  {
    eyebrow: 'Weather Planning',
    title: 'Plan Farming with Weather Insights',
    subtitle: 'Get weather information and plan harvesting, selling, and logistics smarter.',
    primary: 'Check Weather',
    secondary: 'Browse Crops',
    panelKicker: 'Weather support',
    panelTitle: 'Weather context helps reduce avoidable timing mistakes.',
    panelPoints: [
      ['Harvest Planning', 'Use current conditions to plan crop handling and harvest timing.'],
      ['Selling Windows', 'Weather information supports better decisions around transport and sale.'],
      ['Less Guesswork', 'Farm operations become easier when weather sits next to trade tools.'],
    ],
  },
  {
    eyebrow: 'Transparent Platform',
    title: 'No Hidden Charges. Direct Trade.',
    subtitle: 'AagriGgate focuses on transparent trade - not platform commissions.',
    primary: 'Sign Up Free',
    secondary: 'Browse Crops',
    panelKicker: 'Trust first',
    panelTitle: 'A cleaner platform experience builds confidence for both sides.',
    panelPoints: [
      ['Clear Profiles', 'Farmer and buyer profiles create accountability before contact begins.'],
      ['Simple Access', 'OTP-based entry and recovery keep onboarding practical.'],
      ['Fair Positioning', 'The product message stays aligned with transparent, direct trade.'],
    ],
  },
];

const SOLUTION_POINTS = [
  ['Unified Marketplace', 'List crops, discover buyers, and respond from one place instead of jumping between tools.'],
  ['Direct Communication', 'Farmers and buyers connect without extra layers slowing down the trade flow.'],
  ['Market Visibility', 'Real-time market pricing helps users compare before taking selling decisions.'],
  ['Weather Planning', 'Weather information supports harvest timing, selling windows, and logistics planning.'],
  ['Location Discovery', 'State, district, and region context make nearby trade more practical.'],
  ['Transparent Profiles', 'Clear profile information and visible crop details increase confidence before contact.'],
  ['Fair Platform Model', 'The product stays focused on direct trade without hidden platform charges.'],
];

const PLATFORM_FEATURES = [
  ['Direct Farmer-to-Buyer Marketplace', 'Direct crop discovery and contact without middlemen.'],
  ['Real-Time Market Prices', 'Search market price data before making a selling decision.'],
  ['Weather Information', 'Use weather context for harvesting and selling plans.'],
  ['Location-Based Listings', 'State, district, and region context make discovery practical.'],
  ['OTP Login', 'Simple access and account recovery flows.'],
  ['Transparent Pricing', 'Crop details and price context are visible to users.'],
  ['Buyer Request System', 'Buyers can approach and farmers can respond clearly.'],
  ['Crop Listing System', 'Create, update, and manage crop listings from one dashboard.'],
  ['Profile & Trust System', 'Profiles add confidence before direct contact starts.'],
  ['No Hidden Charges', 'The platform message stays focused on direct and fair trade.'],
];

const TRUST_POINTS = [
  'No hidden charges',
  'Verified profiles',
  'Direct communication',
  'Transparent crop pricing',
  'Local context with state, district, and region',
  'Demand visibility through buyer requests',
];

const FARMER_FEATURES = [
  ['Add crop for sale', 'Sell directly'],
  ['Browse all crops', 'See market activity'],
  ['Urgent sell option', 'Push time-sensitive listings faster'],
  ['Waste crop listing', 'Move surplus or lower-grade produce separately'],
  ['Discount pricing', 'Offer quicker deals when needed'],
  ['Crop status updates', 'Mark listings as available or sold'],
  ['View buyer requests', 'Demand visibility'],
  ['Weather info', 'Plan farming'],
  ['Market price', 'Avoid middlemen'],
  ['Direct contact with buyers', 'Negotiate'],
  ['Hidden profile', 'Privacy'],
  ['OTP login', 'Easy access'],
];

const BUYER_FEATURES = [
  ['Find farmers', 'Direct sourcing'],
  ['Browse urgent crops', 'Catch time-sensitive deals sooner'],
  ['Browse waste crops', 'Source lower-cost surplus produce'],
  ['Browse discount listings', 'Spot reduced-price crops quickly'],
  ['Sort crops by time or price', 'Compare listings the way you want'],
  ['Send crop requirement', 'Bulk purchase'],
  ['View crop details', 'Quality info'],
  ['Request tracking', 'Follow requests from oldest to newest'],
  ['Contact farmer', 'Direct deal'],
];

const INTELLIGENCE_POINTS = [
  'Check real-time market prices before selling',
  'Understand crop demand trends through request visibility',
  'Use weather data to plan harvesting and selling',
  'Make better selling decisions based on data, not guesswork',
];

const FARMER_STEPS = [
  'Create your account and get started',
  'Add the crops you want to sell',
  'Interested buyers reach out to you',
  'Discuss the price and close the deal',
];

const BUYER_STEPS = [
  'Create your account',
  'Explore crops or share what you need',
  'Connect directly with the farmer',
  'Agree on the deal and plan the next steps',
];

const ROADMAP = [
  ['Multi-language', 'A more accessible experience for users across different regions.'],
  ['Location context', 'Better logistics support for sourcing and transport planning.'],
  ['Price negotiation', 'More structured bargaining and offer flows inside the platform.'],
  ['Farmer Network', 'A public knowledge-sharing space where farmers can ask questions, share solutions, and learn from real field experience.'],
  ['Price prediction', 'Smart selling'],
  ['Weather alerts', 'Crop safety'],
  ['Demand heatmap', 'Demand insights'],
  ['Chat system', 'Direct in-app conversation between farmers and buyers.'],
  ['Notifications', 'Timely updates for requests, responses, and important actions.'],
  ['Price trend graphs', 'Clear pricing movement over time for better decisions.'],
  ['Admin panel', 'A stronger operational layer for trust, moderation, and control.'],
  ['Transport booking', 'Logistics'],
  ['Fertilizer marketplace', 'Extra revenue'],
  ['Loan / subsidy info', 'Farmer support'],
  ['AI crop recommendation', 'Smart farming'],
  ['Image / crop detection', 'Visual assistance for crop-related workflows and checks.'],
  ['Warehouse booking', 'Storage'],
  ['Digital contract', 'Trust'],
  ['Escrow payment', 'Secure payment'],
];

const FAQS = [
  ['Is AagriGgate free to use?', 'Yes. The platform is positioned around direct trade without hidden charges.'],
  ['Who can use the platform?', 'Farmers and buyers can both register and use the platform.'],
  ['How are farmers and buyers connected?', 'Through crop listings, request flows, and direct contact details.'],
  ['Does the platform charge commission?', 'The platform messaging is built around transparent trade and no hidden charges.'],
  ['How is pricing decided?', 'Users compare listing prices with market price information before deciding.'],
];

function SectionTitle({ id, kicker, title, subtitle, light = false }) {
  return (
    <div id={id}>
      <p className={`section-kicker ${light ? 'section-kicker--light' : ''}`}>{kicker}</p>
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
    </div>
  );
}

function FeatureCard({ title, desc, className = '' }) {
  return (
    <Card className={`core-feature-card ${className}`.trim()}>
      <h3>{title}</h3>
      <p>{desc}</p>
    </Card>
  );
}

function StepCard({ index, text }) {
  return (
    <Card className="step-card step-card--flow">
      <span>{index}</span>
      <p>{text}</p>
    </Card>
  );
}

function FAQAccordion({ items, openFaq, setOpenFaq }) {
  return (
    <div className="faq-list">
      {items.map(([q, a], index) => {
        const open = openFaq === index;
        return (
          <Card key={q} className="faq-card">
            <button type="button" className="faq-card__button" onClick={() => setOpenFaq(open ? null : index)}>
              <span className="faq-card__question">{q}</span>
              <span className="faq-card__toggle">{open ? '-' : '+'}</span>
            </button>
            {open ? <p className="faq-card__answer">{a}</p> : null}
          </Card>
        );
      })}
    </div>
  );
}

function Slider({ slides, activeIndex, onPrimary, onSecondary, setActiveIndex, isLoggedIn }) {
  const active = slides[activeIndex];
  const primaryLabel = isLoggedIn && activeIndex === 3 ? 'Go To Account' : active.primary;
  const [typedTitle, setTypedTitle] = useState('');

  useEffect(() => {
    let frame = 0;
    setTypedTitle('');

    const timer = window.setInterval(() => {
      frame += 1;
      setTypedTitle(active.title.slice(0, frame));
      if (frame >= active.title.length) {
        window.clearInterval(timer);
      }
    }, 52);

    return () => window.clearInterval(timer);
  }, [activeIndex, active.title]);

  return (
    <section className="hero hero--slider">
      <div className="ag-container hero-slider">
        <div key={`content-${activeIndex}`} className="hero-slider__content">
          <p className="hero__tag">{active.eyebrow}</p>
          <h1 className="hero__title hero__title--typing">
            {typedTitle}
            <span className="hero__title-cursor" aria-hidden="true" />
          </h1>
          <p className="hero__subtitle">{active.subtitle}</p>
          <div className="hero__actions">
            <Button variant="accent" size="lg" onClick={() => onPrimary(activeIndex)}>{primaryLabel}</Button>
            <Button variant="outline" size="lg" className="hero-outline" onClick={onSecondary}>{active.secondary}</Button>
          </div>
          <div className="hero-slider__dots">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`hero-slider__dot ${index === activeIndex ? 'hero-slider__dot--active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <Card key={`panel-${activeIndex}`} className="hero-slider__panel">
          <p className="hero-slider__panel-kicker">{active.panelKicker}</p>
          <h2 className="hero-slider__panel-title">{active.panelTitle}</h2>
          <div className="hero-slider__panel-list">
            {active.panelPoints.map(([title, desc]) => (
              <div key={title}>
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();
  const isLoggedIn = Boolean(token && farmerId && role);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const currentTitle = SLIDES[activeSlide]?.title || '';
    const typingDuration = currentTitle.length * 52;
    const slideDelay = Math.max(6500, typingDuration + 2200);

    const timer = window.setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, slideDelay);

    return () => window.clearTimeout(timer);
  }, [activeSlide]);

  const onPrimaryAction = (index) => {
    if (index === 0) {
      navigate(farmerId ? '/add-crop' : '/register');
      return;
    }
    if (index === 1) {
      navigate('/market');
      return;
    }
    if (index === 2) {
      navigate('/weather');
      return;
    }
    navigate(farmerId ? '/account' : '/register');
  };

  const onSecondaryAction = () => {
    navigate('/view-all-crops');
  };

  return (
    <div className="home-page">
      <ValidateToken token={token} role={role} farmerId={farmerId} />

      <Slider
        slides={SLIDES}
        activeIndex={activeSlide}
        onPrimary={onPrimaryAction}
        onSecondary={onSecondaryAction}
        setActiveIndex={setActiveSlide}
        isLoggedIn={isLoggedIn}
      />

      <section className="ag-container section reveal-block">
        <SectionTitle
          id="problem"
          kicker="Problem"
          title="Trade is still too fragmented for everyday farmers and buyers"
          subtitle="Farmers often sell crops at lower prices due to middlemen and lack of market information. Buyers struggle to find reliable farmers, compare crop listings, and plan logistics efficiently. Most information like prices, weather, and demand is scattered across different sources."
        />
        <p className="closing-line">AagriGgate brings all of this into one platform - simple, transparent, and direct.</p>
      </section>

      <section className="section section--surface reveal-block">
        <div className="ag-container">
          <SectionTitle
            id="solution"
            kicker="Solution"
            title="What AagriGgate Solves"
            subtitle="The platform brings the most important trade and planning tools together in one place."
          />
          <div className="solution-grid">
            {SOLUTION_POINTS.map(([title, desc], index) => (
              <Card key={title} className={`solution-card solution-card--${(index % 3) + 1}`}>
                <div className="solution-card__index">{String(index + 1).padStart(2, '0')}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-container section reveal-block">
        <SectionTitle
          id="features"
          kicker="Platform Features"
          title="Everything important is already inside one platform"
          subtitle="Listing, discovery, pricing, weather, and communication are part of the same user journey."
        />
        <div className="core-feature-grid">
          {PLATFORM_FEATURES.map(([title, desc], index) => (
            <FeatureCard
              key={title}
              title={title}
              desc={desc}
              className={index % 2 === 1 ? 'core-feature-card--offset' : ''}
            />
          ))}
        </div>
      </section>

      <section className="section section--surface reveal-block">
        <div className="ag-container">
          <SectionTitle
            id="trust"
            kicker="Trust / Why Choose Us"
            title="Built Around Trust and Transparency"
            subtitle="Made for trust, not hidden costs."
          />
          <div className="trust-strip">
            {TRUST_POINTS.map((item) => (
              <Card key={item} className="trust-chip-card">
                <strong>{item}</strong>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-container section reveal-block">
        <SectionTitle
          id="farmers"
          kicker="For Farmers"
          title="Features for Farmers"
          subtitle="Farmers earn more when they sell directly with better information."
        />
        <div className="feature-table-grid feature-table-grid--single">
          <Card className="feature-table feature-table--farmer">
            <h3>Farmer Tools</h3>
            <div className="feature-table__rows">
              {FARMER_FEATURES.map(([feature, why]) => (
                <div key={feature} className="feature-table__row">
                  <strong>{feature}</strong>
                  <span>{why}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="section section--surface reveal-block">
        <div className="ag-container">
          <SectionTitle
            id="buyers"
            kicker="For Buyers"
            title="Features for Buyers"
            subtitle="Buyers get reliable supply directly from farmers with transparent pricing."
          />
          <div className="feature-table-grid feature-table-grid--single">
            <Card className="feature-table feature-table--buyer">
              <h3>Buyer Tools</h3>
              <div className="feature-table__rows">
                {BUYER_FEATURES.map(([feature, why]) => (
                  <div key={feature} className="feature-table__row">
                    <strong>{feature}</strong>
                    <span>{why}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="ag-container section reveal-block">
        <SectionTitle
          id="intelligence"
          kicker="Weather + Market Intelligence"
          title="Market & Weather Intelligence"
          subtitle="This is the app's smart layer: better timing, better pricing, and better planning."
        />
        <div className="intelligence-grid">
          <Card className="intelligence-card intelligence-card--market">
            <h3>Market Intelligence</h3>
            <p>Check real-time market prices before selling and compare trade context with your own listing strategy.</p>
          </Card>
          <Card className="intelligence-card intelligence-card--weather">
            <h3>Weather Intelligence</h3>
            <p>Use weather information to plan harvesting, selling, and logistics with less guesswork.</p>
          </Card>
          <Card className="intelligence-card intelligence-card--decision">
            <h3>Decision Support</h3>
            <ul className="home-list">
              {INTELLIGENCE_POINTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="section section--surface reveal-block">
        <div className="ag-container">
          <SectionTitle
            id="how-it-works"
            kicker="How It Works"
            title="How AagriGgate Works"
            subtitle="A simple journey that helps farmers and buyers connect without confusion."
          />
          <div className="how-grid">
            <Card className="how-column">
              <h3>For Farmers</h3>
              <div className="steps-grid steps-grid--stacked">
                {FARMER_STEPS.map((step, index) => (
                  <StepCard key={step} index={`0${index + 1}`} text={step} />
                ))}
              </div>
            </Card>
            <Card className="how-column">
              <h3>For Buyers</h3>
              <div className="steps-grid steps-grid--stacked">
                {BUYER_STEPS.map((step, index) => (
                  <StepCard key={step} index={`0${index + 1}`} text={step} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="ag-container section reveal-block">
        <SectionTitle
          id="future"
          kicker="Future Vision"
          title="Future Direction"
          subtitle="Our goal is to build a complete digital ecosystem for agriculture - not just a listing platform."
        />
        <div className="future-layout">
          <Card className="feature-table feature-table--roadmap">
            <h3>Future Roadmap</h3>
            <div className="feature-table__rows">
              {ROADMAP.map(([feature, impact]) => (
                <div key={feature} className="feature-table__row">
                  <strong>{feature}</strong>
                  <span>{impact}</span>
                </div>
              ))}
            </div>
          </Card>
          <div className="vision-cards">
            <Card className="vision-card vision-card--primary">
              <p className="vision-card__eyebrow">Smart Selling</p>
              <h3>Price prediction and demand heatmaps can become the platform's strategic edge</h3>
              <p>These features can help farmers decide not just what to sell, but when and where to sell.</p>
            </Card>
            <Card className="vision-card vision-card--secondary">
              <p className="vision-card__eyebrow">Execution Layer</p>
              <h3>Logistics, contracts, and secure payments can turn discovery into trusted execution</h3>
              <p>That is how the platform evolves from a useful tool into a complete agriculture ecosystem.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="section section--surface reveal-block">
        <div className="ag-container">
          <SectionTitle
            id="faq"
            kicker="FAQ"
            title="Common questions before users join"
          />
          <FAQAccordion items={FAQS} openFaq={openFaq} setOpenFaq={setOpenFaq} />
        </div>
      </section>

      <section className="cta reveal-block">
        <div className="ag-container">
          <SectionTitle
            kicker="Call To Action"
            title="Start Selling or Sourcing With More Clarity"
            subtitle="Direct trade, smart decisions, and transparent workflows - all in one place."
            light
          />
          <div className="hero__actions">
            <Button variant="accent" onClick={() => navigate(isLoggedIn ? '/account' : '/register')}>
              {isLoggedIn ? 'Go To Account' : 'Sign Up'}
            </Button>
            <Button variant="outline" className="hero-outline" onClick={() => navigate('/view-all-crops')}>Browse Crops</Button>
            <Button variant="outline" className="hero-outline" onClick={() => navigate(farmerId ? '/view-all-crops' : '/register')}>Post Requirement</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
