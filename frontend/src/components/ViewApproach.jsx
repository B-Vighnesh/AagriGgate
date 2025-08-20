import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/ViewApproach.css';
import ValidateToken from './ValidateToken';

const ViewApproach = () => {
  const [farmerId, setFarmerId] = useState(null);
  const [approaches, setApproaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filteredApproaches, setFilteredApproaches] = useState([]);
  const navigate = useNavigate();

  // Fetch token and farmerId once
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const storedFarmerId = localStorage.getItem('farmerId');

  // Fetch approaches by farmerId
  const fetchApproachesByFarmerId = async () => {
    if (!token) {
      setError('You are not logged in!');
      setLoading(false);
      return;
    }

    if (!storedFarmerId) {
      setError('Farmer ID is missing in localStorage!');
      setLoading(false);
      return;
    }

    setFarmerId(storedFarmerId);

    try {
      const response = await fetch(
        `http://localhost:8080/seller/approach/requests/farmer/${storedFarmerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApproaches(data);
      } else {
        setError('No request has been found');
      }
    } catch (error) {
      console.error('Error fetching approaches:', error);
      setError('No request has been found');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBuyer = (buyerId) => {
    navigate(`/view-buyer/${buyerId}`);
  };

  const handleViewDetails = (cropId) => {
    navigate(`/view-details/${cropId}`);
  };

  const handleAction = async (approachId, accept) => {
    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    try {
      const endpoint = accept
        ? `http://localhost:8080/seller/approach/accept/${approachId}`
        : `http://localhost:8080/seller/approach/reject/${approachId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchApproachesByFarmerId();
      } else {
        const errorText = await response.text();
        setError('Action failed: ' + errorText);
      }
    } catch (error) {
      console.error('Error occurred:', error);
      setError('An error occurred while processing your request.');
    }
  };

  useEffect(() => {
    if (role === null) {
      navigate("/login");
    } else if (role === "buyer") {
      navigate("/404");
    }
    fetchApproachesByFarmerId();
  }, [role, navigate]);

  useEffect(() => {
    applyFilter(filterStatus, approaches);
  }, [approaches, filterStatus]);

  const applyFilter = (status, data = approaches) => {
    if (status === 'All') {
      setFilteredApproaches(data);
    } else {
      const filtered = data.filter((approach) => approach.status.toLowerCase() === status.toLowerCase());
      setFilteredApproaches(filtered);
    }
  };

  const handleFilterChange = (event) => {
    const status = event.target.value;
    setFilterStatus(status);
    applyFilter(status);
  };

  // Conditional rendering for loading and error
  if (loading) {
    return <div>Loading approaches...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='container'>
      <ValidateToken farmerId={farmerId} token={token} role={role} />
      <h1 className="heading">
        <div className="word">
          <span>B</span>
          <span>U</span>
          <span>Y</span>
          <span>I</span>
          <span>N</span>
          <span>G</span>
        </div>
        <div className="word">
          <span>P</span>
          <span>R</span>
          <span>O</span>
          <span>P</span>
          <span>O</span>
          <span>S</span>
          <span>A</span>
          <span>L</span>
          <span>S</span>
        </div>
      </h1>

      <div className="filter-container">
        <label htmlFor="status-filter">Filter by Status: </label>
        <select id="status-filter" value={filterStatus} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {filteredApproaches.length === 0 ? (
        <p>No requests yet</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Buyer Name</th>
              <th>Status</th>
              <th>Action</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {filteredApproaches.map((approach) => (
              <tr key={approach.approachId}>
                <td onClick={() => handleViewDetails(approach.cropId)}>{approach.cropName}</td>
                <td onClick={() => handleViewBuyer(approach.userId)}>{approach.userName}</td>
                <td>{approach.status}</td>
                {approach.status.toLowerCase() === 'pending' ? (
                  <td>
                    <button onClick={() => handleAction(approach.approachId, true)} className="accept-button">Accept</button>
                    <button onClick={() => handleAction(approach.approachId, false)} className="reject-button">Reject</button>
                  </td>
                ) : (
                  <td>Action completed</td>
                )}
                <td>
                  <button onClick={() => handleViewDetails(approach.cropId)} className="view-button">View Crop</button>
                  <button onClick={() => handleViewBuyer(approach.userId)} className="view-buyer-button">View Buyer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewApproach;
