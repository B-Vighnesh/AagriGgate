import React, { useState } from 'react';
import '../assets/ApproachFarmer.css';

const ApproachFarmer = ({ cropId, farmerId, onClose }) => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // State for success message

  const handleApproach = async () => {
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('farmerId'); // Current user's ID

    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    try {
      const url = `http://localhost:8080/buyer/approach/create/${farmerId}/${cropId}/${currentUserId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const message = await response.text();
        setSuccessMessage('Approach request sent successfully!');
        setError(null); // Clear error if success
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || 'Failed to send approach request.');
        setSuccessMessage(null); // Clear success message if error
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while sending the approach request.');
      setSuccessMessage(null); // Clear success message on error
    }
  };

  return (
    <div className="approach-modal">
      <div className="approach-modal-content">
      {!successMessage&&!error && <> <h2>Confirm Approach Farmer</h2>
        <p>Are you sure you want to approach the farmer for this crop?</p>
        <div className="button-group">
          <button onClick={handleApproach} className="yes-button">Yes, Approach</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
         
        </div> </>
        }
        {successMessage && <div className="success-message">{successMessage}
        <button onClick={onClose} className="yes-button">Ok</button>
        </div>
        }
        {error && <div className="error-message">{error}
        <button onClick={onClose} className="yes-button">Ok</button></div>}
      </div>
    </div>
  );
};

export default ApproachFarmer;
