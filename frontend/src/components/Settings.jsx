import React, { useState, useEffect } from 'react';
import '../assets/Settings.css';
import { useNavigate } from 'react-router-dom';
import ValidateToken from './ValidateToken';

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForDeletion, setPasswordForDeletion] = useState('');

  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const farmerId = localStorage.getItem('farmerId');
  const token = localStorage.getItem('token');

  const handlePopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const validatePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      setPasswordError(
        'Password must contain at least 8 characters, including numbers, special characters, upper and lower case letters.'
      );
      return false;
    }
    setPasswordError('');
    return true;
  };

  useEffect(() => {
    validatePassword();
  }, [newPassword, confirmPassword]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    const token = localStorage.getItem('token');
  

    try {
      const endpoint = role === 'buyer'
        ? `http://localhost:8080/buyer/change-password`
        : `http://localhost:8080/users/change-password`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ farmerId, currentPassword, newPassword }),
      });

      if (response.ok) {
        setPopupMessage('Password changed successfully!');
        setShowPopup(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }  else if(response.status===401)
        {
          window.location.reload();
        }
        else{
          handlePopup(' Current password is Invalid');
        }
    } catch (error) {
      handlePopup('Server Busy');
    }
  };

  const confirmDeleteAccount = () => {
    const token = localStorage.getItem('token');
 

    const endpoint = role === 'buyer'
      ? `http://localhost:8080/buyer/delete`
      : `http://localhost:8080/users/delete`;

    fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ farmerId, currentPassword: passwordForDeletion }),
    })
      .then((response) => {
        if (response.ok)  {  handlePopup('Account successfully deleted.');
          localStorage.clear();
          setTimeout(() => navigate('/register'), 1000);
        }
        else if(response.status===401)
        {
          window.location.reload();
        }
        else{
          handlePopup('Invalid password');
        }
      })
      .catch((error) => {
        setError("Server Busy");
        handlePopup("Server Busy");
      });
  };

  const handleDeleteAccount = () => {
    setConfirmPopup(true);
  };

  const handleConfirmPopup = (confirm) => {
    setConfirmPopup(false);
    if (confirm) {
      confirmDeleteAccount();
      setPasswordForDeletion('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
    
      <h1 className="heading">
        <span>S</span><span>E</span><span>T</span><span>T</span><span>I</span><span>N</span><span>G</span><span>S</span>
      </h1>
     
      {showPopup && (
        <div className="approach-modal">
          <div className="e-message">
            {popupMessage}
            <br />
            <button onClick={closePopup} className="yes-button">Ok</button>
          </div>
        </div>
      )}

      <div className="settings-page"> <ValidateToken farmerId={farmerId} token={token} role={role} />
      <div className="back-button">
          <button onClick={() => navigate(-1)} >
        <i className="fas fa-arrow-left"></i>
      </button>
      </div>
        {confirmPopup && (
          <div className="pop">
            <p>Are you sure you want to delete your account? 🚨</p>
            <label htmlFor="passwordForDeletion">Enter your current password to confirm:</label>
            <input
              type="password"
              id="passwordForDeletion"
              value={passwordForDeletion}
              onChange={(e) => setPasswordForDeletion(e.target.value)}
              required
            />
            <button onClick={() => handleConfirmPopup(true)} className="y-button">Yes</button>
            <button onClick={() => handleConfirmPopup(false)} className="n-button">No</button>
          </div>
        )}

        <div className="settings-section">
          <h2>Reset Password</h2>
          <form onSubmit={handleChangePassword} className="reset-password-form">
            <label htmlFor="currentPassword">Current Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <label htmlFor="newPassword">New Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <p className="password-toggle">
              <label htmlFor="showPassword">Show Password:</label>
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={togglePasswordVisibility}
              />
            </p>

            {passwordError && <p className="error-message">{passwordError}</p>}

            <button type="submit" className="settings-button">Change Password</button>
          </form>
        </div>

        <div className="settings-section delete-section">
          <h2>Delete Account</h2>
          <p>Deleting your account is permanent and cannot be undone. All your data will be removed.</p>
          <button onClick={handleDeleteAccount} className="delete-account-button">Delete Account</button>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </>
  );
};

export default Settings;
