import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../assets/ViewApproachByFarmerAndCrop.css';

import ValidateToken from './ValidateToken';
const ViewApproachByFarmerAndCrop = () => {
  const { farmerId, cropId } = useParams(); // Extract farmerId and cropId from route params
  const [approaches, setApproaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filteredApproaches, setFilteredApproaches] = useState([]);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  // Function to fetch approaches by farmerId and cropId
  const fetchApproaches = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token for authorization

      const response = await fetch(`http://localhost:8080/seller/approach/requests/farmer/${farmerId}/${cropId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request header
        },
      });

      if (response.ok&&response!==null) {
       
        const data = await response.json();
        setApproaches(data); // Update state with the fetched data
      } else {
        setError("Session has been expired please login");
        navigate('/account')
      }
    } catch (error) {
      
      console.error('No approach records found for this  crop.');
    //   setError('No approach records found for this farmer and crop.');
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Fetch approaches on component mount
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole ===null) {
      navigate("/login"); 
    }
    else if(userRole==="buyer")
    {
      navigate("/404");
    }
    if (farmerId && cropId) {
      fetchApproaches();
    } else {
      setError('Farmer ID or Crop ID is missing!');
      setLoading(false);
    }
  }, [farmerId, cropId]);
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

  const handleViewBuyer = (buyerId) => {
    navigate(`/view-buyer/${buyerId}`);
  };
  const handleFilterChange = (event) => {
    const status = event.target.value;
    setFilterStatus(status);
    applyFilter(status);
  };
  const handleViewDetails = (cropId) => {
    navigate(`/view-details/${cropId}`);
  };

  const handleAction = async (approachId, accept) => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    try {
      const endpoint = accept
        ? `http://localhost:8080/seller/approach/accept/${approachId}`
        : `http://localhost:8080/seller/approach/reject/${approachId}`;

      const response = await fetch(endpoint, {
        method: 'POST', // Assuming the request type is POST
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.text();
        console.log('Success:', data);
        // Update the UI after successful action
        fetchApproaches();// Refresh data after action
      } else {
        const errorText = await response.text(); // Handle non-JSON response
       
        setError('Action failed: ' + errorText);
      }
    } catch (error) {
      console.error('Error occurred:', error);
      setError('An error occurred while processing your request.');
    }
  };
  if (loading) {
    return <div>Loading approaches...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="container">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

       <button onClick={() => navigate(-1)} className="back-button">
      <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="heading">
   
    <span>R</span>
    <span>E</span>
    <span>Q</span>
    <span>U</span>
    <span>E</span>
    <span>S</span>
    <span>T</span>
    <span>S</span>
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
      {approaches.length === 0 ? (
        <p>No approach records found for this  crop.</p>
      ) : (
        <table >
          <thead>
            <tr>
              <th>Crop Name</th>
              {/* <th>Farmer Name</th>
              <th>Farmer Email</th>
              <th>Farmer Phone No</th> */}
              <th>Buyer Name</th>
              <th>Status</th>
              <th>Action</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
          {filteredApproaches.map((approach) => (
              <tr key={approach.approachId}>
                <td onClick={() => handleViewDetails(approach.cropId)} >{approach.cropName}</td>
                {/* <td>{approach.farmerName}</td>
                <td>{approach.farmerEmail}</td>
                <td>{approach.farmerPhoneNo}</td> */}
                <td onClick={() => handleViewBuyer(approach.userId)}>{approach.userName}</td>
                <td>{approach.status}</td>
               
               {approach.status.toLowerCase() === 'pending' ? (
                 <>
                   <button
                     onClick={() => handleAction(approach.approachId, true)}
                     className="accept-button"
                   >
                     Accept
                   </button>
                   <button
                     onClick={() => handleAction(approach.approachId, false)}
                     className="reject-button"
                   >
                     Reject
                   </button>
                 </>
               ) : (
                 <td>Action completed</td>
               )
               }
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

export default ViewApproachByFarmerAndCrop;
