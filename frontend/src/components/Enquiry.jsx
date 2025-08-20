import React, { useState } from 'react';
import '../assets/Enquiry.css';
import { useNavigate } from 'react-router-dom';
const Enquiry = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null); // To handle and display errors

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Retrieve the JWT token from localStorage

    if (!token) {
      setError('You are not authenticated. Please log in first.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/enquiries/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ message }), // Send the message in the request body
      });

      if (response.ok) {
        const data = await response.text();
        console.log('Server response:', data);
        setSubmitted(true); // Show thank-you message
      } else {
        const errorData = await response.text();
        setError(errorData.message || 'Failed to submit the enquiry.');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('An error occurred while sending your message. Please try again.');
    }
  };

  return (
    <div className="enquiry">
     
      {submitted ? (
        <p>Thank you for your message! We will respond shortly through email.</p>
      ) : (
        <form onSubmit={handleSubmit} className="enquiry-form">
             <h1 class="heading">
    <span>E</span>
    <span>N</span>
    <span>Q</span>
    <span>U</span>
    <span>I</span>
    <span>R</span>
    <span>Y</span>
</h1>
             <div className="back-button">
          <button onClick={() => navigate(-1)} >
        <i className="fas fa-arrow-left"></i>
      </button>
      </div>
          {error && <p className="error-message">{error}</p>} {/* Display errors */}
          <label>
            Message:
            <textarea
              name="message"
              value={message}
              onChange={handleChange}
              required
              placeholder="Write your message here"
            />
          </label>
          <button type="submit">Send Message</button>
        </form>
      )}
    </div>
  );
};

export default Enquiry;
