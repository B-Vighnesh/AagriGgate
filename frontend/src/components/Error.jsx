import React, { useState, useEffect } from 'react';
import '../assets/Error.css';  // Optional: To style your error page
import { useNavigate } from 'react-router-dom';

const Error = () => {
    
  const navigate = useNavigate();
    useEffect(() => {
        setTimeout(() => navigate('/account'), 1000);
    });
  return (
    <div className="error-page">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
    </div>
  );
};

export default Error;
