import React from 'react';
import '../assets/Modal.css';

const Modal = ({ isOpen, title, message, onClose, primaryAction, secondaryAction }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">

        <button
          onClick={onClose}
          className="modal-btn modal-btn--secondary"
          type="button"
        >
          Close
        </button>

        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="modal-btn modal-btn--primary"
            type="button"
          >
            {primaryAction.label}
          </button>
        )}

      </div>
      </div>
    </div>
  );
};

export default Modal;
