import React from 'react';
import '../assets/Modal.css';

const Modal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onClose} className="modal-close-btn">
          Close
        </button> 
      </div>
    </div>
  );
};

export default Modal;
