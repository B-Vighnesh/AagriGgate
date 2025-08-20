import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ValidateToken({ farmerId, token, role }) {
  const navigate = useNavigate();
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          handleSessionExpired();
          return;
        }

        const response = await fetch('http://localhost:8080/auth/isTokenValid', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          handleSessionExpired();
        }
      } catch (error) {
        handleSessionExpired();
      }
    };

    const handleSessionExpired = () => {
      localStorage.removeItem('farmerId');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setPopupMessage('Session has expired. Please log in again.');
      setTimeout(() => {
        navigate('/login');
      }, 3000); 
    };

    if (token) {
      checkTokenValidity();
    }
  }, [token, farmerId, role, navigate]);

  const closePopup = () => {
    setPopupMessage(null);
  };

  return (
    <div>
      {popupMessage && (
        <div className="popup-overlay" style={styles.overlay} onClick={closePopup}>
          <div className="popup" style={styles.popup}>
            <p>{popupMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidateToken;

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
  },
};
