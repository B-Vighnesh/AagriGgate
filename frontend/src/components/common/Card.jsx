import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`ui-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
