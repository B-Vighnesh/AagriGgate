import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  KeyRound,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Tractor,
  X,
} from 'lucide-react';
import './UserGuide.css';

const guideSections = [
  {
    id: 'getting-started',
    title: 'Getting started',
    icon: BookOpen,
    cards: [
      {
        id: 'what-is-aagrigate',
        title: 'What is AagriGate?',
        description: 'A digital marketplace connecting farmers directly with buyers. No middlemen — farmers get better prices, buyers get fresher crops.',
      },
      {
        id: 'who-can-use-it',
        title: 'Who can use it? (Farmer vs Buyer)',
        description: 'Farmers can list crops, view requests, and check mandi prices. Buyers can search crops, send purchase requests, and negotiate directly.',
      },
      {
        id: 'creating-account',
        title: 'Creating an account (OTP flow)',
        description: 'Open the app → enter phone number → enter 6-digit OTP (expires in 5 min) → choose Farmer or Buyer → set your district and state.',
      },
    ],
  },
  {
    id: 'farmer-guide',
    title: 'Farmer guide',
    icon: Tractor,
    cards: [
      {
        id: 'list-crop',
        title: 'List a crop',
        description: "Tap 'Add Crop' → fill crop details, quantity, market price, and location → add photos → submit. Clear photos help buyers trust the listing faster.",
      },
      {
        id: 'manage-listings',
        title: 'Manage listings',
        description: 'Go to My Crops. Open a crop to view details, edit, delete, or manage buyer requests for that listing.',
      },
      {
        id: 'buyer-requests',
        title: 'Buyer requests (accept/reject)',
        description: 'You get notified when a buyer is interested. Go to Requests or the crop request view → Accept to continue, or Reject. Your phone number is not shown publicly.',
      },
      {
        id: 'market-prices',
        title: 'Market prices',
        description: 'Use the Market page to compare mandi prices, crop rates, locations, and market trends before deciding a fair price.',
      },
      {
        id: 'dashboard-overview',
        title: 'Dashboard overview',
        description: "Account and Trade pages give quick access to My Crops, Add Crop, Requests, Weather, Market, News, and account tools.",
      },
    ],
  },
  {
    id: 'buyer-guide',
    title: 'Buyer guide',
    icon: ShoppingBag,
    cards: [
      {
        id: 'search-crops',
        title: 'Search & filter crops',
        description: 'Browse crops and use available filters such as crop details, location, and price range. Open any listing for full details.',
      },
      {
        id: 'send-request',
        title: 'Send a purchase request',
        description: "Tap 'Send Request' on any listing → choose quantity and add an optional message → submit. The farmer is notified immediately.",
      },
      {
        id: 'track-requests',
        title: 'Track your requests',
        description: 'Go to My Requests. Status: Pending means waiting, Accepted means you can continue the deal, and Rejected means you can search other listings.',
      },
    ],
  },
  {
    id: 'features-roadmap',
    title: 'Features & coming soon',
    icon: Sparkles,
    cards: [
      {
        id: 'live-mandi-prices',
        title: 'Live mandi prices',
        badge: 'live',
        description: 'Available now on the Market page with crop, mandi, price, analytics, and trend views.',
      },
      {
        id: 'weather-updates',
        title: 'Weather updates',
        badge: 'live',
        description: 'Available now on the Weather page with district forecast signals and weather alerts for field decisions.',
      },
      {
        id: 'agriculture-news',
        title: 'Agriculture news',
        badge: 'live',
        description: 'Available now on the News page with agriculture updates, important advisories, filters, and saved articles.',
      },
      {
        id: 'smart-ai-alerts',
        title: 'Smart AI alerts',
        badge: 'phase 3',
        description: 'Coming in Phase 3 — set a target price for any crop and get notified when prices hit your threshold.',
      },
    ],
  },
  {
    id: 'account-privacy',
    title: 'Account & privacy',
    icon: ShieldCheck,
    cards: [
      {
        id: 'phone-privacy',
        title: 'Phone number privacy',
        description: 'Your number is never shown publicly. It is only used for trusted account and request flows, and you can reject any buyer request at any time.',
      },
      {
        id: 'edit-profile',
        title: 'Edit profile',
        description: 'Tap Profile icon → Edit Profile → update name, location, or photo → Save.',
      },
      {
        id: 'change-password',
        title: 'Change password',
        description: 'Profile → Account Settings → Change Password → enter current password → enter new password twice → Save Changes.',
      },
      {
        id: 'delete-account',
        title: 'Delete account',
        description: 'Profile → Account Settings → Delete Account. Follow the OTP confirmation flow before account removal is processed.',
      },
    ],
  },
  {
    id: 'help-faq',
    title: 'Help & FAQ',
    icon: CircleHelp,
    cards: [
      {
        id: 'otp-not-arriving',
        title: 'OTP not arriving',
        description: 'Wait 60 seconds → tap Resend OTP → check you entered the correct number. Still not working? Email webappfarmer@gmail.com.',
      },
      {
        id: 'report-listing',
        title: 'Report a listing',
        description: 'On any listing, tap ⋮ in the top corner → Report. Or email webappfarmer@gmail.com with the listing ID.',
      },
      {
        id: 'is-it-free',
        title: 'Is it free?',
        description: 'Yes — creating an account, listing crops, searching, and sending requests are all free. Future paid features will be clearly marked.',
      },
      {
        id: 'contact-support',
        title: 'Contact support → webappfarmer@gmail.com',
        description: 'Email: webappfarmer@gmail.com | Response within 24 hours on working days.',
      },
      {
        id: 'glossary',
        title: 'Glossary: mandi, MSP, quintal/kg',
        description: 'Mandi means an agricultural market. MSP means Minimum Support Price announced for selected crops. 1 quintal equals 100 kg.',
      },
    ],
  },
];

const totalGuideCards = guideSections.reduce((total, section) => total + section.cards.length, 0);

function UserGuide({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [openCardId, setOpenCardId] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setOpenCardId(null);
    }
  }, [isOpen]);

  const visibleSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return guideSections
      .map((section) => {
        const cards = normalizedQuery
          ? section.cards.filter((card) => (
              `${card.title} ${card.description}`.toLowerCase().includes(normalizedQuery)
            ))
          : section.cards;

        return { ...section, cards };
      })
      .filter((section) => section.cards.length > 0 || !normalizedQuery);
  }, [query]);

  const handleFeedback = () => {};

  if (!isOpen) return null;

  return (
    <div className="user-guide" role="presentation">
      <button
        type="button"
        className="user-guide__backdrop"
        aria-label="Close user guide"
        onClick={onClose}
      />

      <aside className="user-guide__drawer" role="dialog" aria-modal="true" aria-labelledby="user-guide-title">
        <header className="user-guide__header">
          <div className="user-guide__hero">
            <div className="user-guide__hero-main">
              <div className="user-guide__hero-icon">
                <Sprout size={22} aria-hidden="true" />
              </div>
              <div>
                <strong>AagriGate assistance</strong>
                <span>{totalGuideCards} help topics</span>
              </div>
            </div>
            <button type="button" className="user-guide__close" aria-label="Close user guide" onClick={onClose}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <label className="user-guide__search" htmlFor="user-guide-search">
          <Search size={18} aria-hidden="true" />
          <input
            id="user-guide-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpenCardId(null);
            }}
            placeholder="Search guide..."
          />
          {query ? (
            <button
              type="button"
              className="user-guide__search-clear"
              aria-label="Clear guide search"
              onClick={() => {
                setQuery('');
                setOpenCardId(null);
              }}
            >
              <X size={15} aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <div className="user-guide__content">
          {visibleSections.length > 0 ? (
            visibleSections.map((section) => {
              const SectionIcon = section.icon;

              return (
                <section className="user-guide__section" key={section.id}>
                  <div className="user-guide__section-title">
                    <span className="user-guide__section-icon">
                      <SectionIcon size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{section.title}</h3>
                      <p>{section.cards.length} topic{section.cards.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>

                  <div className="user-guide__cards">
                    {section.cards.map((card) => {
                      const isCardOpen = openCardId === card.id;

                      return (
                        <article className={`guide-card ${isCardOpen ? 'guide-card--open' : ''}`} key={card.id}>
                          <button
                            type="button"
                            className="guide-card__toggle"
                            aria-expanded={isCardOpen}
                            onClick={() => setOpenCardId(isCardOpen ? null : card.id)}
                          >
                            <span className="guide-card__title-row">
                              <span>{card.title}</span>
                              {card.badge ? <span className={`guide-card__badge guide-card__badge--${card.badge.replace(/\s+/g, '-')}`}>{card.badge}</span> : null}
                            </span>
                            <ChevronDown size={18} aria-hidden="true" />
                          </button>

                          {isCardOpen ? (
                            <div className="guide-card__body">
                              <p>{card.description}</p>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>

                  <div className="user-guide__feedback" aria-label={`Feedback for ${section.title}`}>
                    <span>Was this helpful?</span>
                    <button type="button" onClick={() => handleFeedback(section.title, 'up')} aria-label={`${section.title} was helpful`}>
                      👍
                    </button>
                    <button type="button" onClick={() => handleFeedback(section.title, 'down')} aria-label={`${section.title} was not helpful`}>
                      👎
                    </button>
                  </div>
                </section>
              );
            })
          ) : (
            <div className="user-guide__empty">
              <KeyRound size={22} aria-hidden="true" />
              <p>No guide cards match your search.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default UserGuide;
