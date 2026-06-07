import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './HelpFAB.css';

function HelpFAB({ onChatClick, onGuideClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef(null);
  const location = useLocation();
  const chatTitle = onChatClick
    ? 'Chat support is currently disabled'
    : 'Chat support is currently unavailable';

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (fabRef.current && !fabRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => setIsOpen(false);

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const handleAction = (callback) => {
    setIsOpen(false);
    if (typeof callback === 'function') {
      callback();
    }
  };

  return (
    <div
      ref={fabRef}
      className={`help-fab ${isOpen ? 'help-fab--open' : ''}`}
    >
      <div className="help-fab__menu" aria-hidden={!isOpen}>
        <button
          type="button"
          className="help-fab__option help-fab__option--disabled"
          disabled
          title={chatTitle}
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span>Chat with us</span>
        </button>
        <button
          type="button"
          className="help-fab__option"
          onClick={() => handleAction(onGuideClick)}
        >
          <BookOpen size={18} aria-hidden="true" />
          <span>User guide</span>
        </button>
      </div>

      <button
        type="button"
        className="help-fab__button"
        aria-label="Open help menu"
        aria-expanded={isOpen}
        data-tooltip="Assistance"
        onClick={() => setIsOpen((open) => !open)}
      >
        <i className="fa-solid fa-headset" aria-hidden="true" />
      </button>
    </div>
  );
}

export default HelpFAB;
