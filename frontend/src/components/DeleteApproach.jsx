import React from 'react';
import '../assets/DeleteApproach.css';

const DeleteApproach = ({ approachId }) => {

  const handleDelete = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are not logged in!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/buyer/approach/delete/${approachId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Approach deleted successfully!');
       // Redirect to the list of approaches after deletion
      } else {
        alert('Failed to delete approach. Please try again.');
      }
    } catch (error) {
      alert('Error deleting approach.');
    }
  };

  return (
    <div className="delete-container">
      <h3>Are you sure you want to delete this approach?</h3>
      <button onClick={handleDelete} className="delete-confirm-button">Yes, Delete</button>
     
    </div>
  );
};

export default DeleteApproach;
