import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import ValidateToken from './ValidateToken';
import { requestJson } from '../lib/api';
import { getFarmerId, getToken, getRole } from '../lib/auth';
import { getNews } from '../lib/newsApi';
import { getRequestStatusLabel, normalizeRequestStatus } from '../lib/requestStatus';

// ─── Static Data ──────────────────────────────────────────────────────────────

const SLIDES = [
  {
    eyebrow: 'Direct Trade',
    title: 'Connecting Farmers Directly with Buyers — No Middlemen',
    subtitle: 'List crops, discover buyers, track mandi prices, and plan with weather insights — all in one platform.',
    primary: 'Sell Your Crop',
    secondary: 'Browse Crops',
    panelKicker: 'Why this matters',
    panelTitle: 'Direct trade keeps the conversation simple and transparent.',
    panelPoints: [
      ['Direct Listings', 'Farmers publish crops and buyers respond — no marketplace clutter.'],
      ['Faster Decisions', 'One place for listing, response, and contact removes unnecessary delay.'],
      ['No Middlemen', 'The platform stays focused on direct connection and clearer pricing.'],
    ],
  },
  {
    eyebrow: 'Mandi Intelligence',
    title: 'Know Mandi Prices Before You Sell',
    subtitle: 'Track real-time APMC and mandi crop prices so you decide when and where to sell with confidence.',
    primary: 'Check Mandi Prices',
    secondary: 'Browse Crops',
    panelKicker: 'Market edge',
    panelTitle: 'Better price visibility improves timing and confidence.',
    panelPoints: [
      ['Price Context', 'Compare your listing with live mandi data before setting expectations.'],
      ['Historical Trends', 'Past price data helps you spot the right window to sell.'],
      ['Smarter Selling', 'You decide when to sell with more clarity and less guesswork.'],
    ],
  },
  {
    eyebrow: 'Weather Planning',
    title: 'Plan Farming with Hyperlocal Weather Insights',
    subtitle: 'Get daily hyperlocal weather data and plan harvesting, selling, and logistics smarter.',
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
    subtitle: 'AagriGgate focuses on transparent trade — not platform commissions or middlemen cuts.',
    primary: 'Sign Up Free',
    secondary: 'Browse Crops',
    panelKicker: 'Trust first',
    panelTitle: 'A cleaner platform experience builds confidence for both sides.',
    panelPoints: [
      ['Clear Profiles', 'Farmer and buyer profiles create accountability before contact begins.'],
      ['Simple Access', 'OTP-based entry and recovery keep onboarding practical.'],
      ['Contact on Acceptance', 'Contact details are revealed only after a request is accepted.'],
    ],
  },
];

const SOLUTION_POINTS = [
  ['Unified Marketplace', 'List crops, discover buyers, and respond from one place instead of jumping between tools.'],
  ['Direct Communication', 'Farmers and buyers connect without extra layers slowing down the trade flow.'],
  ['Mandi Price Visibility', 'Daily APMC mandi prices help users compare before making selling decisions.'],
  ['Weather Planning', 'Hyperlocal weather data supports harvest timing, selling windows, and logistics.'],
  ['Crop Waste Marketplace', 'Farmers list agricultural waste for poultry farms and agri businesses — reducing losses.'],
  ['Location Discovery', 'State, district, and region context make nearby trade more practical.'],
  ['Fair Platform Model', 'The product stays focused on direct trade without hidden platform charges.'],
];

const PLATFORM_FEATURES = [
  ['Direct Farmer-to-Buyer Marketplace', 'Crop discovery and contact without middlemen.'],
  ['Daily Mandi Prices', 'APMC price data with historical trends.'],
  ['Hyperlocal Weather Data', 'Daily weather scheduler for harvest and transport planning.'],
  ['In-App Negotiation Chat', 'Farmers and buyers chat directly after request acceptance.'],
  ['Crop Waste Marketplace', 'Move surplus and lower-grade produce to agri businesses.'],
  ['Buyer Request System', 'Buyers post requirements and farmers respond clearly.'],
  ['Location-Based Listings', 'State, district, and region context make discovery practical.'],
  ['OTP Login', 'Simple access and account recovery flows.'],
  ['Notifications Module', 'Scalable alerts with user-controlled preferences.'],
  ['Agriculture News Feed', 'Verified agri news pipeline updated regularly.'],
  ['Profile & Trust System', 'Profiles add confidence before direct contact starts.'],
  ['No Hidden Charges', 'Transparent, direct trade — no platform commissions.'],
];

const TRUST_POINTS = [
  'No hidden charges',
  'No middlemen',
  'Verified profiles',
  'Direct communication',
  'Transparent crop pricing',
  'Contact revealed only on acceptance',
];

const FARMER_FEATURES = [
  ['Add crop for sale', 'Sell directly'],
  ['Crop waste listing', 'Move surplus or lower-grade produce separately'],
  ['Urgent sell option', 'Push time-sensitive listings faster'],
  ['Discount pricing', 'Offer quicker deals when needed'],
  ['Crop status updates', 'Mark listings as available or sold'],
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
  ['Sort by time or price', 'Compare listings the way you want'],
  ['Send crop requirement', 'Post bulk purchase needs directly'],
  ['In-app chat', 'Negotiate with farmer post-acceptance'],
  ['Mandi prices', 'Know fair rates before negotiating'],
  ['Request tracking', 'Follow requests end to end'],
  ['Notifications', 'Get alerted on request updates'],
  ['Contact farmer', 'Direct deal after acceptance'],
];

const INTELLIGENCE_POINTS = [
  'Check APMC mandi prices before listing or buying',
  'View historical price trends to spot the right selling window',
  'Use hyperlocal weather data to plan harvest and transport',
  'Understand demand through buyer request activity',
];

const FARMER_STEPS = [
  'Create your account with OTP — quick and simple',
  'Add the crops you want to sell with photos and price',
  'Interested buyers send you a request',
  'Accept, chat, and close the deal directly',
];

const BUYER_STEPS = [
  'Create your account and get started',
  'Browse crops or post your requirement directly',
  'Send a request to the farmer you want',
  'Connect after acceptance and agree on the deal',
];

const ROADMAP = [
  ['Price Trend Graphs', 'Historical mandi price movement for better timing decisions.'],
  ['Farmer Network', 'Community Q&A where farmers share real field knowledge.'],
  ['Demand Heatmaps', 'Visual display of high-demand areas across regions.'],
  ['Custom Market Alerts', 'User-defined price and location thresholds with push notifications.'],
  ['Weather Alerts', 'Automatic alerts for heavy rain, heat, and wind by location.'],
  ['AI Price Prediction', 'ML model suggests best selling price from historical data.'],
  ['Crop Detection', 'Image-based crop quality and variety identification.'],
  ['Smart Alerts Engine', 'AI synthesises weather, subsidies, and laws into personalised advisories.'],
  ['AI Chat Bot', 'Conversational assistant for app usage and market understanding.'],
  ['Multi-language Support', 'Regional language access across Indian states.'],
  ['Escrow Payments', 'Direct and secure payment system between farmers and buyers.'],
  ['Logistics & Storage', 'Transport and warehouse booking integration.'],
  ['Fertilizer Marketplace', 'Farmers browse and buy verified seeds and inputs.'],
  ['Agent Network', 'Trained local agents assist farmers with listings and transactions.'],
  ['Offline Mode', 'Core features with SMS fallback and automatic data sync.'],
  ['IoT Integration', 'Field sensors for real-time soil, weather, and crop data.'],
];

const FAQS = [
  ['Is AagriGgate free to use?', 'Yes. The platform is built around direct trade with no hidden charges or commissions.'],
  ['Who can use the platform?', 'Farmers and buyers can both register and use the platform.'],
  ['How are farmers and buyers connected?', 'Through crop listings, buyer requests, and in-app chat after acceptance.'],
  ['When is contact information shared?', 'Contact details are revealed only after a buyer request is accepted by the farmer — protecting both parties.'],
  ['Is there a chat feature?', 'Yes. After a request is accepted, farmers and buyers can negotiate directly via in-app chat.'],
  ['How is pricing decided?', 'Users compare listing prices with mandi price data before negotiating and deciding.'],
];

// ─── Reusable UI components ───────────────────────────────────────────────────

function SectionTitle({ id, kicker, title, subtitle, light = false }) {
  return (
    <div id={id} className="section-title-block">
      <p className={`section-kicker${light ? ' section-kicker--light' : ''}`}>{kicker}</p>
      <h2 className={`section-title${light ? ' section-title--light' : ''}`}>{title}</h2>
      {subtitle
        ? <p className={`section-subtitle${light ? ' section-subtitle--light' : ''}`}>{subtitle}</p>
        : null}
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
      <span className="step-card__index">{index}</span>
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
            <button
              type="button"
              className="faq-card__button"
              onClick={() => setOpenFaq(open ? null : index)}
            >
              <span className="faq-card__question">{q}</span>
              <span className="faq-card__toggle">{open ? '\u2212' : '+'}</span>
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
      if (frame >= active.title.length) window.clearInterval(timer);
    }, 48);
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
            <Button variant="accent" size="lg" onClick={() => onPrimary(activeIndex)}>
              {primaryLabel}
            </Button>
            <Button variant="outline" size="lg" className="hero-outline" onClick={onSecondary}>
              {active.secondary}
            </Button>
          </div>
          <div className="hero-slider__dots">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`hero-slider__dot${index === activeIndex ? ' hero-slider__dot--active' : ''}`}
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
              <div key={title} className="hero-slider__panel-point">
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

// ─── Quick section-anchor nav (guest only) ────────────────────────────────────

function QuickLinks() {
  const links = [
    { label: 'Problem',      href: '#problem' },
    { label: 'Solution',     href: '#solution' },
    { label: 'Features',     href: '#features' },
    { label: 'Farmers',      href: '#farmers' },
    { label: 'Buyers',       href: '#buyers' },
    { label: 'Mandi',        href: '#intelligence' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Roadmap',      href: '#future' },
    { label: 'FAQ',          href: '#faq' },
  ];
  return (
    <nav className="home-quicklinks" aria-label="Page sections">
      <div className="home-quicklinks__inner">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="home-quicklinks__link">
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── Dashboard helpers ────────────────────────────────────────────────────────

function getDayGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatPrice(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 'Rs 0';
  return `Rs ${numeric.toFixed(0)}`;
}

function getNewsDateLabel(item) {
  const published = item?.publishedAt || item?.createdAt || '';
  if (!published) return '';
  const date = new Date(published);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function FarmerQuickActions({ navigate }) {
  const actions = [
    { label: 'Add crop', icon: 'fa-solid fa-plus',       path: '/add-crop' },
    { label: 'My crops', icon: 'fa-solid fa-seedling',   path: '/view-crop' },
    { label: 'Requests', icon: 'fa-regular fa-clock',    path: '/view-approach' },
    { label: 'Mandi',    icon: 'fa-solid fa-chart-line', path: '/market' },
  ];
  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <p className="dashboard-section__label">Quick actions</p>
      </div>
      <div className="dashboard-quick-actions">
        {actions.map((item) => (
          <button
            key={item.label}
            type="button"
            className="dashboard-quick-card"
            onClick={() => navigate(item.path)}
          >
            <span className="dashboard-quick-card__icon" aria-hidden="true">
              <i className={item.icon} />
            </span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Logged-in dashboard ──────────────────────────────────────────────────────

function LoggedInDashboard({ role, token, farmerId, navigate }) {
  const [profile, setProfile]               = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [latestCrops, setLatestCrops]       = useState([]);
  const [latestNews, setLatestNews]         = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    let active = true;
    const requestPath = role === 'farmer'
      ? '/seller/approach/requests/me?page=0&size=3'
      : '/buyer/approach/requests/me?page=0&size=3';
    const profilePath = role === 'farmer' ? '/farmers/me' : '/buyers/me';

    (async () => {
      try {
        const [profileData, requestsData, cropsData, newsData] = await Promise.allSettled([
          requestJson(profilePath, { method: 'GET' }),
          requestJson(requestPath, { method: 'GET' }),
          requestJson(
            `/crops/legacy?page=0&size=${role === 'buyer' ? 4 : 2}&sortBy=newest`,
            { method: 'GET' },
          ),
          getNews({ page: 0, size: 3, sortBy: 'newest' }),
        ]);
        if (!active) return;
        setProfile(profileData.status === 'fulfilled' ? profileData.value : null);
        setRecentRequests(
          requestsData.status === 'fulfilled' && Array.isArray(requestsData.value?.content)
            ? requestsData.value.content.slice(0, 3) : [],
        );
        setLatestCrops(
          cropsData.status === 'fulfilled' && Array.isArray(cropsData.value?.content)
            ? cropsData.value.content.slice(0, role === 'buyer' ? 4 : 2) : [],
        );
        setLatestNews(
          newsData.status === 'fulfilled' && Array.isArray(newsData.value?.content)
            ? newsData.value.content.slice(0, 3) : [],
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [farmerId, role, token]);

  const isFarmer     = role === 'farmer';
  const displayName  = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User';
  const location     = [profile?.district, profile?.state].filter(Boolean).join(', ') || '';
  const requestRoute = isFarmer ? '/view-approach' : '/view-approaches-user';

  if (loading) {
    return (
      <section className="page page--center">
        <div className="ui-spinner ui-spinner--lg" />
      </section>
    );
  }

  return (
    <section className="page dashboard-home-page">
      <div className="ag-container dashboard-home">

        {/* Greeting card */}
        <Card className="dashboard-greeting">
          <p className="dashboard-greeting__sub">{getDayGreeting()}</p>
          <h1 className="dashboard-greeting__name">{displayName}</h1>
          <p className="dashboard-greeting__role">
            {isFarmer ? 'Farmer' : 'Buyer'}{location ? ` \u00b7 ${location}` : ''}
          </p>
          {!isFarmer && (
            <p className="dashboard-greeting__welcome">
              Find fresh crops directly from farmers near you.
            </p>
          )}
        </Card>

        {/* Farmer: quick actions | Buyer: latest crops grid */}
        {isFarmer ? (
          <FarmerQuickActions navigate={navigate} />
        ) : (
          <section className="dashboard-section">
            <div className="dashboard-section__header">
              <p className="dashboard-section__label">Latest crops</p>
              <button
                type="button"
                className="dashboard-section__link"
                onClick={() => navigate('/view-all-crops')}
              >
                See all
              </button>
            </div>
            <div className="dashboard-crops-grid">
              {latestCrops.length > 0 ? latestCrops.map((crop) => (
                <button
                  key={crop.cropID}
                  type="button"
                  className="dashboard-crop-card"
                  onClick={() => navigate(`/view-details/${crop.cropID}`)}
                >
                  <p className="dashboard-crop-card__title">{crop.cropName}</p>
                  <p className="dashboard-crop-card__meta">
                    {crop.region || crop.cropType || 'Crop listing'}
                  </p>
                  <p className="dashboard-crop-card__price">{formatPrice(crop.marketPrice)}</p>
                  <p className="dashboard-crop-card__sub">Qty: {crop.quantity} {crop.unit}</p>
                </button>
              )) : (
                <Card className="dashboard-empty-card">
                  <p className="dashboard-empty">Latest crop listings will appear here.</p>
                </Card>
              )}
            </div>
          </section>
        )}

        {/* Recent / My requests */}
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <p className="dashboard-section__label">
              {isFarmer ? 'Recent requests' : 'My requests'}
            </p>
            <button
              type="button"
              className="dashboard-section__link"
              onClick={() => navigate(requestRoute)}
            >
              See all
            </button>
          </div>
          <Card className="dashboard-list-card">
            {recentRequests.length > 0 ? recentRequests.map((item) => {
              const normalized      = normalizeRequestStatus(item.status);
              const counterpartName = isFarmer ? item.userName : item.farmerName;
              return (
                <button
                  key={item.approachId}
                  type="button"
                  className="dashboard-request-item"
                  onClick={() => navigate(`/requests/${item.approachId}`)}
                >
                  <div>
                    <strong>{item.cropName}</strong>
                    <span>{isFarmer ? 'Buyer' : 'Farmer'}: {counterpartName || 'User'}</span>
                  </div>
                  <span className={`approach-badge ${{
                    pending:   'approach-badge--pending',
                    accepted:  'approach-badge--accepted',
                    completed: 'approach-badge--completed',
                    failed:    'approach-badge--failed',
                    expired:   'approach-badge--expired',
                  }[normalized] || ''}`}>
                    {getRequestStatusLabel(item.status)}
                  </span>
                </button>
              );
            }) : (
              <p className="dashboard-empty">Your recent requests will appear here.</p>
            )}
          </Card>
        </section>

        {/* Latest news */}
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <p className="dashboard-section__label">Latest news</p>
            <button
              type="button"
              className="dashboard-section__link"
              onClick={() => navigate('/news')}
            >
              See all
            </button>
          </div>
          <Card className="dashboard-list-card dashboard-list-card--news">
            {latestNews.length > 0 ? latestNews.map((item) => (
              <button
                key={item.id}
                type="button"
                className="dashboard-news-item"
                onClick={() => navigate(`/news/${item.id}`)}
              >
                <strong>{item.title}</strong>
                <div className="dashboard-news-item__meta">
                  <span className="dashboard-news-item__category">{item.category || 'News'}</span>
                  <span>{getNewsDateLabel(item)}</span>
                </div>
              </button>
            )) : (
              <p className="dashboard-empty">Latest news updates will appear here.</p>
            )}
          </Card>
        </section>

      </div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Home() {
  const navigate   = useNavigate();
  const farmerId   = getFarmerId();
  const token      = getToken();
  const role       = getRole();
  const isLoggedIn = Boolean(token && farmerId && role);
  const [openFaq, setOpenFaq]         = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const currentTitle   = SLIDES[activeSlide]?.title || '';
    const typingDuration = currentTitle.length * 48;
    const slideDelay     = Math.max(6500, typingDuration + 2200);
    const timer = window.setTimeout(
      () => setActiveSlide((prev) => (prev + 1) % SLIDES.length),
      slideDelay,
    );
    return () => window.clearTimeout(timer);
  }, [activeSlide]);

  const onPrimaryAction = (index) => {
    if (index === 0) { navigate(farmerId ? '/add-crop' : '/register'); return; }
    if (index === 1) { navigate('/market'); return; }
    if (index === 2) { navigate('/weather'); return; }
    navigate(farmerId ? '/account' : '/register');
  };

  // ── Logged-in view ──
  if (isLoggedIn) {
    return (
      <div className="home-page">
        <ValidateToken token={token} role={role} farmerId={farmerId} />
        <LoggedInDashboard role={role} token={token} farmerId={farmerId} navigate={navigate} />
      </div>
    );
  }

  // ── Guest / landing view ──
  return (
    <div className="home-page">
      <ValidateToken token={token} role={role} farmerId={farmerId} />

      <Slider
        slides={SLIDES}
        activeIndex={activeSlide}
        onPrimary={onPrimaryAction}
        onSecondary={() => navigate('/view-all-crops')}
        setActiveIndex={setActiveSlide}
        isLoggedIn={isLoggedIn}
      />

      {/* Sticky quick-nav anchors */}
      <QuickLinks />

      {/* Problem */}
      <section className="ag-container section reveal-block" id="problem">
        <SectionTitle
          kicker="Problem"
          title="Trade is still too fragmented for everyday farmers and buyers"
          subtitle="Farmers sell below fair value due to middlemen and scattered market information. Buyers struggle to find reliable farmers and compare listings. Mandi prices, weather data, and demand signals live in completely different places."
        />
        <p className="closing-line">
          AagriGgate brings all of this into one platform — simple, transparent, and direct.
        </p>
      </section>

      {/* Solution */}
      <section className="section section--surface reveal-block">
        <div className="ag-container">
          <SectionTitle
            id="solution"
            kicker="Solution"
            title="What AagriGgate Solves"
            subtitle="The most important trade and planning tools in one place."
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

      {/* Platform Features */}
      <section className="ag-container section reveal-block">
        <SectionTitle
          id="features"
          kicker="Platform Features"
          title="Everything important is already inside one platform"
          subtitle="Listings, mandi prices, weather, chat, notifications, and news — part of the same user journey."
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

      {/* Trust */}
      <section className="section section--surface reveal-block">
        <div className="ag-container">
          <SectionTitle
            id="trust"
            kicker="Why Choose Us"
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

      {/* Farmer features */}
      <section className="ag-container section reveal-block">
        <SectionTitle
          id="farmers"
          kicker="For Farmers"
          title="Features for Farmers"
          subtitle="Farmers earn more when they sell directly with better information."
        />
        <div className="feature-table-grid feature-table-grid--single">
          <Card className="feature-table feature-table--farmer">
            <div className="feature-table__head">
              <h3>Farmer Tools</h3>
              <Button type="button" size="sm" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
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

      {/* Buyer features */}
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
              <div className="feature-table__head">
                <h3>Buyer Tools</h3>
                <Button type="button" size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
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

      {/* Mandi + Weather intelligence */}
      <section className="ag-container section reveal-block">
        <SectionTitle
          id="intelligence"
          kicker="Mandi + Weather Intelligence"
          title="Mandi Prices & Weather — Built Into the Platform"
          subtitle="The smart layer that helps farmers and buyers make better decisions every day."
        />
        <div className="intelligence-grid">
          <Card className="intelligence-card intelligence-card--market">
            <h3>Mandi Intelligence</h3>
            <p>
              Daily APMC and mandi prices with historical trends. Compare market data with
              your listing before selling.
            </p>
          </Card>
          <Card className="intelligence-card intelligence-card--weather">
            <h3>Weather Intelligence</h3>
            <p>
              Hyperlocal daily weather data to plan harvest timing, transport windows,
              and selling decisions.
            </p>
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

      {/* How it works */}
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

      {/* Future roadmap */}
      <section className="ag-container section reveal-block">
        <SectionTitle
          id="future"
          kicker="Future Vision"
          title="How We Are Building AagriGgate"
          subtitle="Six phases from core marketplace to a full agricultural operating system."
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
              <h3>AI price prediction and demand heatmaps can become the platform&apos;s strategic edge</h3>
              <p>These features help farmers decide not just what to sell, but when and where to sell.</p>
            </Card>
            <Card className="vision-card vision-card--secondary">
              <p className="vision-card__eyebrow">Full Ecosystem</p>
              <h3>Payments, logistics, contracts, and offline access complete the agricultural operating system</h3>
              <p>
                That is how AagriGgate evolves from a useful tool into infrastructure
                for Indian agriculture.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--surface reveal-block">
        <div className="ag-container">
          <SectionTitle
            id="faq"
            kicker="FAQ"
            title="Common questions before you join"
          />
          <FAQAccordion items={FAQS} openFaq={openFaq} setOpenFaq={setOpenFaq} />
        </div>
      </section>

      {/* CTA */}
      <section className="cta reveal-block">
        <div className="ag-container">
          <SectionTitle
            kicker="Get Started"
            title="Start Selling or Sourcing With More Clarity"
            subtitle="Direct trade, mandi prices, weather insights — all in one place. No hidden charges."
            light
          />
          <div className="hero__actions">
            <Button variant="accent" onClick={() => navigate('/register')}>Sign Up Free</Button>
            <Button variant="outline" className="hero-outline" onClick={() => navigate('/view-all-crops')}>
              Browse Crops
            </Button>
            <Button variant="outline" className="hero-outline" onClick={() => navigate('/register')}>
              Post Requirement
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}