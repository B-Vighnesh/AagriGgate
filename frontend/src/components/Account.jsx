import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Account.css';
import farmerIcon from '../images/farmer.jpg';
import buyerIcon from '../images/buyer.jpg';
import ValidateToken from './ValidateToken';

const Account = () => {
  
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const farmerId = localStorage.getItem('farmerId');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [showLogout, setShowLogout] = useState(false); 
  useEffect(() => {
    const token = localStorage.getItem('token'); // Check for authentication token
    const userRole = localStorage.getItem("role");
   
    if (userRole ===null) {
      navigate("/login"); 
    }
   
    if (farmerId && token) {
      const endpoint =
        role === 'buyer'
          ? `http://localhost:8080/buyer/getBuyer/${farmerId}`
          : `http://localhost:8080/users/getFarmer/${farmerId}`;
      fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) 
            {
              
      alert("Session has been expired please login")
             

            }
            else{
          return response.json();
            }
        })
        .then((data) => setUserData(data))
        .catch((error) =>  
          {           setError("Server Busy")

    });
    } else {
      
      window.location.reload();

    }
  }, [farmerId, token, role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmerId');
    localStorage.removeItem('role');
    setTimeout(() => navigate('/logout'), 1000);
    // window.location.reload();
  };
const handleShowLogout = () => {
  setShowLogout(true)
}
const handleSettings = () => {
navigate('/settings')
}

  const onClose = () => {
    setShowLogout('');
  }
  
  return (
    <div className="account-container">
      <ValidateToken farmerId={farmerId} token={token} role={role} />
      {userData ? (
        <div className="account-content">
          <h2 className="account-heading">
            Welcome, {userData.firstName} {userData.lastName}! 👋
          </h2>
          <div className="image-container">
            <img
              src={role === 'buyer' ? buyerIcon : farmerIcon}
              alt="Profile"
              className="profile-image"
            />
          </div>
          <div className="account-info">
            <p><strong>🧑‍💻 Username:</strong> {userData.username}</p>
            <p><strong>📧 Email:</strong> {userData.email}</p>
            <p><strong>📞 Phone Number:</strong> {userData.phoneNo}</p>
            <p><strong>🎂 Date of Birth:</strong> {userData.dob}</p>
            <p><strong>🗺️ State:</strong> {userData.state}</p>
            <p><strong>📍District:</strong> {userData.district}</p>
            <div className="button-group">
              <button onClick={() => navigate('/update-account')} className="edit-button">✏️ Edit</button>
              <button onClick={() => navigate('/enquiry')} className="enquiry-button">🙋‍♂️ Enquiry</button>
              <button onClick={handleSettings} className="delete-button">⚙️ Settings</button>
            </div>
          </div>
          <button onClick={handleShowLogout} className="logout-button">🚪 Logout</button>
          {showLogout && (
  <div className="accept-popup">
    <div className="accept-content">
      <h3>Logout</h3>
      <p>Are you sure want to Logout?</p>
      <div className="popup-buttons">
        <button onClick={handleLogout} className="ya-button">Yes</button>
        <button onClick={onClose} className="no-button">Cancel</button>
      </div>
    </div>
  </div>
)}
        </div>
      ) : (
        null
      )}
      {error && <p className="error-message">⚠️ {error}</p>}
    </div>
  );
};

export default Account;
