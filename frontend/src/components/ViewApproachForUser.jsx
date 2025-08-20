import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/ViewApproachForUser.css';
import ValidateToken from './ValidateToken';

const ViewApproachForUser = () => {
  const [approaches, setApproaches] = useState([]); // To store the fetched approaches
  const [loading, setLoading] = useState(true); // To manage loading state
  const [error, setError] = useState(null); // To store error messages
  const navigate = useNavigate();
  const userId = localStorage.getItem('farmerId'); // Assuming the user ID is saved in localStorage
  const token = localStorage.getItem('token'); // Token for authorization
  const [successMessage, setSuccessMessage] = useState(null);

  const role = localStorage.getItem('role');
  const farmerId = localStorage.getItem('farmerId');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filteredApproaches, setFilteredApproaches] = useState([]);
  // Fetching the approaches from the backend
  const fetchApproaches = async () => {
    if (!userId || !token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/buyer/approach/requests/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          setError("No approaches found.");
        } else {
          setApproaches(data);
          // applyFilter('All')
        }
      } else {
        setError("Session has been expired please login");
        navigate('/account')
      }
    } catch (error) {
      setError("Server Busy");
      
    } finally {
      setLoading(false);
    }
   
  };

  // Deleting an approach
  const handleDelete = async (approachId) => {
    if (!token) {
      setError("You are not logged in.");
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
        setApproaches(approaches.filter((approach) => approach.approachId !== approachId)); // Remove the deleted approach from the list
         setSuccessMessage("Approach deleted successfully.");
      } else {
        setError("Session has been expired please login");
        navigate('/account')
      }
    } catch (error) {
     
      setError("Server Busy");
    }
  };

  // Fetch approaches when the component mounts
  useEffect(() => {
    fetchApproaches();
    
  }, []);
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole ===null) {
      navigate("/login"); 
    }
    else if(userRole==="farmer")
    {
      navigate("/404");
    }
    applyFilter(filterStatus, approaches);
  }, [approaches, filterStatus]);
  const handleViewDetails = (cropID) => {
    navigate(`/view-details/${cropID}`);
  };
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
  const onClose = () => {
    setSuccessMessage(""); 
  };
  
  // Loading and error states
  if (loading) {
    return <div>Loading approaches...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className='container'>
       <ValidateToken farmerId={farmerId} token={token} role={role} />
      <h1 class="heading">
      <div class="word">
    <span>M</span>
    <span>Y</span>
    </div>
    <div class="word">
    <span>R</span>
    <span>E</span>
    <span>Q</span>
    <span>U</span>
    <span>E</span>
    <span>S</span>
    <span>T</span>
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
      {approaches.length === 0 ? (
        <p>No approaches found for you.</p>
      ) : (
        <table >
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Farmer Name</th>
              <th>View</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {filteredApproaches.map((approach) =>(
              <tr key={approach.approachId}>
                <td>{approach.cropName}</td>
                <td>{approach.farmerName}</td>
                <td>
                  <button onClick={() => handleViewDetails(approach.cropId)} className="view-button">
                    View Crop
                  </button>
                </td>
                <td>{approach.status}</td>
                <td>
                  {approach.status.toLowerCase() === "pending" ? ( // Enable delete only if status is "pending"
                    <button onClick={() => handleDelete(approach.approachId)} className="delete-button">
                      Delete
                    </button>
                  ) : (
                    <span>Action not allowed</span> // Show a message if the action is not allowed
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {successMessage && (
        <div className="success-modal">
          <div className="success-message">
            <p>{successMessage}</p>
            <button onClick={onClose} className="ok-button">Ok</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApproachForUser;
