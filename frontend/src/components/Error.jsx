import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Error() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, #d8f3dc 100%)' }}
    >
      <div className="animate-fade-in-up">
        <p className="text-8xl mb-4 select-none">🌾</p>
        <h1
          className="text-6xl font-black mb-2"
          style={{ color: 'var(--color-primary)' }}
        >
          404
        </h1>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Page Not Found
        </h2>
        <p className="text-base mb-8 max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
          Looks like this field hasn't been planted yet. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="btn-primary px-6 py-2.5" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
          <Link to="/" className="btn-outline px-6 py-2.5">
            🏠 Home
          </Link>
        </div>
      </div>
    </div>
  );
}
