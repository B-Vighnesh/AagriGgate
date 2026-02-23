import React from 'react';

export default function Toast({ message, type = 'info' }) {
  if (!message) return null;
  return (
    <div className={`ui-toast ui-toast--${type}`}>
      {message}
    </div>
  );
}
