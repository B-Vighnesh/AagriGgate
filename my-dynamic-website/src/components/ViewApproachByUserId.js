import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ViewApproachByUserId = () => {
  const [approaches, setApproaches] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch approaches when the component mounts
    const fetchApproaches = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }
      
      try {
        const response = await fetch('http://localhost:8080/api/approach/requests/userId', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setApproaches(data);
        } else {
          setError('Failed to fetch approaches.');
        }
      } catch (err) {
        setError('Error fetching data.');
      }
    };
    
    fetchApproaches();
  }, []);
  
  // Handle deleting an approach
  const handleDelete = async (approachId) => {
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
        setApproaches((prev) => prev.filter((approach) => approach.approachId !== approachId));
      } else {
        alert('Failed to delete approach. Please try again.');
      }
    } catch (error) {
      alert('Error deleting approach.');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Your Approaches</h2>
      <table>
        <thead>
          <tr>
            <th>Approach ID</th>
            <th>Crop Name</th>
            <th>Farmer Name</th>
            <th>User Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {approaches.map((approach) => (
            <tr key={approach.approachId}>
              <td>{approach.approachId}</td>
              <td>{approach.cropName}</td>
              <td>{approach.farmerName}</td>
              <td>{approach.userName}</td>
              <td>
                {/* Delete button for each approach */}
                <button onClick={() => handleDelete(approach.approachId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewApproachByUserId;
