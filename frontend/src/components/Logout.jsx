import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Logout.css';

const Logout = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('farmerId');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setShowPopup(true); // Show popup
      setTimeout(() => {
        setShowPopup(false);
       
        navigate('/login'); // Redirect to account page
      }, 1000); // Redirect after 2 seconds
    };

    handleLogout();
  }, [navigate]);

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Logging you out...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;
