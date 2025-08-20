import React, { useState, useEffect } from 'react';
import '../assets/DeleteCrop.css';
import { useNavigate } from 'react-router-dom';

import ValidateToken from './ValidateToken';
const DeleteCrop = ({ cropId, onClose }) => {
  const [successMessage, setSuccessMessage] = useState(null); // State for success message
  const farmerId=localStorage.getItem('farmerId')

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
const handleOk = () => {
  navigate(`/view-crop`);
};
useEffect(() => {
  const userRole = localStorage.getItem("role");
if (userRole ===null) {
  navigate("/login"); 
}
else if(userRole==="buyer")
{
  navigate("/404");
}
});
  const handleDelete = async () => {

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/crops/farmer/delete1/${cropId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
         setSuccessMessage('Crop deleted successfully!');
        setError(null);
        // navigate('/view-crop');
        // onClose(); // Close the modal after successful deletion
      } else {
        setError('Failed to delete the crop.');
      }
    } catch (error) {
      setError('Server Busy');
    }
  };

  return (
    <div className="delete-modal"><div className="delete-modal-content">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

     {!successMessage &&<>
        <h2>Are you sure you want to delete this crop?</h2>
        <div className="button-group">
          <button onClick={handleDelete} className="yes-button">Yes</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div></>
        }
        {successMessage && <div className="success-message">{successMessage}
        <button onClick={handleOk} className="yes-button">Ok</button>
        </div>
        }
        {error && <div className="error-message">{error}</div>}
      </div>
  </div>
  );
};

export default DeleteCrop;
