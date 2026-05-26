import React, { useState } from 'react';
import { BookOpen, HelpCircle, MessageCircle, X } from 'lucide-react';
import './HelpFAB.css';

function HelpFAB({ onChatClick, onGuideClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (callback) => {
    setIsOpen(false);
    if (typeof callback === 'function') {
      callback();
    }
  };

  return (
    <div className={`help-fab ${isOpen ? 'help-fab--open' : ''}`}>
      <div className="help-fab__menu" aria-hidden={!isOpen}>
        <button
          type="button"
          className="help-fab__option"
          onClick={() => handleAction(onChatClick)}
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
        aria-label={isOpen ? 'Close help menu' : 'Open help menu'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <HelpCircle size={26} aria-hidden="true" />}
      </button>
    </div>
  );
}

export default HelpFAB;
