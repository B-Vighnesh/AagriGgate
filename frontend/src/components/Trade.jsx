import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Trade.css'; // Importing the CSS for styling

// Modal Component
const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Please Login</h2>
        <p>You need to be logged in to access the trading features.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Trade = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); // Get the role from localStorage
    if (!token) {
      setIsModalOpen(true); // Show modal if not authenticated
    } else {
      setRole(userRole); // Set the role for conditional rendering
    }
  }, [navigate]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate('/login'); // Redirect to login page when closing the modal
  };

  const handleAddCropClick = () => {
    navigate('/add-crop'); // Redirect to AddCrop component
  };

  const handleViewCropClick = () => {
    if (role === 'farmer') {
      navigate('/view-crop'); // Redirect to ViewCrop component for farmers
    }
  };
  const handleViewApproachClick=()=>{
    navigate('/view-approach')
  }

  // If the user is a buyer, automatically navigate to ViewAllCrops
  useEffect(() => {
    if (role === 'buyer') {
      navigate('/view-all-crops');
    }
  }, [role, navigate]);

  return (
    <div className="trade-container">
      <h1>Trade</h1>

      {/* Show buttons based on role */}
      {!isModalOpen && role && role === 'farmer' && (
        <div className="trade-buttons">
          <div className="addCrop">
            <button className="add-crop-button" onClick={handleAddCropClick}>
              Add Crop
            </button>
          </div>
          <div className="viewCrop">
            <button className="view-crop-button" onClick={handleViewCropClick}>
              View Crop
            </button>
          </div>
          <div className="viewApproach">
            <button className="view-approach-button" onClick={handleViewApproachClick}>
             View Approach
            </button>
          </div>
        </div>
      )}

      {/* Modal for login alert */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default Trade;
