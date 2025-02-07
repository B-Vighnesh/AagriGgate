import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ViewApproach.css';
import ValidateToken from './ValidateToken';

const ViewApproach = () => {
  const [farmerId, setFarmerId] = useState(null); // State to store farmerId
  const [approaches, setApproaches] = useState([]); // State to store approach data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to handle errors
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filteredApproaches, setFilteredApproaches] = useState([]);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  // Function to fetch approaches by farmerId
  const fetchApproachesByFarmerId = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token for authorization
      const storedFarmerId = localStorage.getItem('farmerId'); // Retrieve farmerId from localStorage

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

      setFarmerId(storedFarmerId); // Set farmerId from localStorage

      const response = await fetch(
        `http://localhost:8080/seller/approach/requests/farmer/${storedFarmerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request header
          },
        }
      );

      if (response.ok) {
        // window.alert(response)
        // console.log(response)
       
        const data = await response.json();
        console.log(data)
        setApproaches(data); // Update state with the fetched data
      } else {
        const errorData = await response.text();
        setError("No request has been found");
      }
    } catch (error) {
      console.error('Error fetching approaches:', error);
      setError('No request has been found');
    } finally {
      setLoading(false); // Stop loading spinner
    }
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
        fetchApproachesByFarmerId(); // Refresh data after action
      } else {
        const errorText = await response.text(); // Handle non-JSON response
       
        setError('Action failed: ' + errorText);
      }
    } catch (error) {
      console.error('Error occurred:', error);
      setError('An error occurred while processing your request.');
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
    fetchApproachesByFarmerId();
  }, []);
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
  if (loading) {
  <div>Loading approaches...</div>;
  }

  if (error) {
   <div> {error}</div>;
  }

  return (
    <div className='container'><ValidateToken farmerId={farmerId} token={token} role={role} />
      <h1 class="heading">
      <div class="word">
    <span>B</span>
    <span>U</span>
    <span>Y</span>
    <span>I</span>
    <span>N</span>
    <span>G</span>
    </div>
    <div class="word">
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

      {/* <h2>Approaches for you: </h2> */}
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
        <p>No requests yet</p>
      ) : (
        
        <table  border="1" >
          <thead>
            <tr>
              <th>Crop Name</th>
              {/* <th>Farmer Name</th>
              <th>Farmer Email</th>
              <th>Farmer Phone No</th> */}
              <th>Buyer Name</th>
              <th>Buyer Email</th>
              <th>Buyer Phone No</th>
              <th>Status</th>
              <th>Action</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
          {filteredApproaches.map((approach) => (
              <tr key={approach.approachId}>
                <td>{approach.cropName}</td>
                <td>{approach.userName}</td>
                <td>{approach.userEmail}</td>
                <td>{approach.userPhoneNo}</td>
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
                  <button onClick={() => handleViewDetails(approach.cropId)} className="view-button">
                    View Crop
                  </button>
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
