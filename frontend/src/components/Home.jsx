import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ValidateToken from './ValidateToken';
import { getFarmerId, getToken, getRole } from '../lib/auth';

const FEATURES = [
  {
    icon: '\u{1F33E}',
    title: 'Direct Market Access',
    desc: 'Farmers list crops and set their own prices. Buyers browse, compare, and contact farmers directly - no middlemen.',
  },
  {
    icon: '\u2600\uFE0F',
    title: 'Real-Time Weather',
    desc: 'Get hyper-local weather data to make informed decisions on planting, harvesting, and protecting your crops.',
  },
  {
    icon: '\u{1F4CA}',
    title: 'Market Insights',
    desc: 'Stay updated on market trends, average prices, and demand to price competitively and grow strategically.',
  },
];

const STEPS = [
  { n: '01', title: 'Register', desc: 'Create your account as a farmer or buyer in minutes.' },
  { n: '02', title: 'List or Browse', desc: 'Farmers add crop listings; buyers browse the live marketplace.' },
  { n: '03', title: 'Connect Directly', desc: 'Negotiate and transact transparently with no fees.' },
  { n: '04', title: 'Grow Together', desc: 'Access weather data and market insights to make smarter decisions.' },
];

const FAQS = [
  { q: 'How do I register?', a: 'Click "Register" in the top navbar, choose your role (Farmer or Buyer), and follow the steps.' },
  { q: 'Is the platform free?', a: 'Yes - AgriGate is completely free for both farmers and buyers, forever.' },
  { q: 'How do I contact support?', a: 'Reach us via the Contact Us page or email webappfarmer@gmail.com.' },
  { q: 'Is my data safe?', a: 'We never sell your data. Personal details are used solely to provide our service.' },
];

export default function Home() {
  const navigate = useNavigate();
  const farmerId = getFarmerId();
  const token = getToken();
  const role = getRole();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, var(--color-primary-light) 100%)',
          minHeight: '520px',
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'rgba(244,162,97,0.15)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-60px', left: '-60px',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center animate-fade-in-up">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(244,162,97,0.25)', color: 'var(--color-accent-light)' }}
          >
            {'\u{1F331}'} India&apos;s Farmer-First Marketplace
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
            Farm to Table,<br />
            <span style={{ color: 'var(--color-accent)' }}>Without the Middleman</span>
          </h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            AgriGate connects farmers directly with buyers for fair trade, better prices, and a sustainable agricultural future.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {!farmerId ? (
              <>
                <button className="btn-accent btn-lg" onClick={() => navigate('/register')}>
                  Get Started Free
                </button>
                <button
                  className="btn btn-lg border-2 border-white text-white"
                  style={{ background: 'transparent' }}
                  onClick={() => navigate('/view-all-crops')}
                >
                  Browse Crops
                </button>
              </>
            ) : (
              <button className="btn-accent btn-lg" onClick={() => navigate('/market')}>
                Go to Market
              </button>
            )}
          </div>
        </div>
      </section>

      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '5,000+', label: 'Farmers' },
            { value: '12,000+', label: 'Buyers' },
            { value: 'Rs 2Cr+', label: 'Trade Volume' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="section-title">Why AgriGate?</h2>
          <p className="section-subtitle">Everything you need to connect, trade, and grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="card card-hover p-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: 'var(--color-bg)' }}
              >
                {icon}
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--color-primary-dark)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="htw" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps to start trading smarter.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-extrabold text-white mx-auto mb-3"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' }}
                >
                  {n}
                </div>
                <h3 className="font-semibold mb-1 text-sm" style={{ color: 'var(--color-primary-dark)' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{q}</span>
                <span
                  className="shrink-0 text-xl font-light transition-transform duration-200"
                  style={{ color: 'var(--color-primary)', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}
                >
                  +
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: openFaq === i ? '200px' : '0', padding: openFaq === i ? '0 20px 16px' : '0 20px' }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="ts"
        style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="section-title text-lg">Terms of Service</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
              By using AgriGate you agree to: provide accurate information during registration, use the platform for lawful purposes only, and acknowledge that AgriGate facilitates connections but does not guarantee transaction outcomes.
            </p>
          </div>
          <div id="pp">
            <h2 className="section-title text-lg">Privacy Policy</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Your privacy matters. We collect only the data needed to run the platform - your name, contact info, and usage data. We never sell your information. Data is shared only where necessary to provide the service.
            </p>
          </div>
        </div>
      </section>

      {!farmerId && (
        <section
          id="cs"
          className="text-center px-6 py-16"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
        >
          <h2 className="text-3xl font-extrabold text-white mb-3">Join 5,000+ Farmers Today</h2>
          <p className="text-green-200 text-sm mb-6 max-w-xl mx-auto">
            Be part of the AgriGate community. Sign up free and start trading directly - no middlemen, no fees.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn-accent btn-lg" onClick={() => navigate('/register')}>
              Sign Up Free
            </button>
            <button
              className="btn btn-lg border-2 border-white text-white"
              style={{ background: 'transparent' }}
              onClick={() => navigate('/login')}
            >
              I already have an account
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
