import React, { useState, useEffect } from 'react';
import '../assets/UpdateAccount.css'; // Add your custom styles here
import { useNavigate } from 'react-router-dom';
import statesWithDistricts from './StatesWithDistricts';

import ValidateToken from './ValidateToken';
const UpdateAccount = () => {
  const navigate = useNavigate();
  const farmerId = localStorage.getItem('farmerId');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [showEdit, setShowEdit] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    phoneNo: '',
    dob: '',
    state: '',
    district: '',
    aadharNo: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [aadharError, setAadharError] = useState('');
  const [dobError, setDobError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');

  // Fetch existing user details on component mount
  useEffect(() => {
    if (farmerId && token) {
      const endpoint =
        role === 'buyer'
          ? `http://localhost:8080/buyer/getBuyer/${farmerId}`
          : `http://localhost:8080/users/getFarmer/${farmerId}`;

      const fetchUserDetails = async () => {
        try {
          setLoading(true);
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserDetails(data); // Pre-fill form with user details
          } else {
           navigate('/account')
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserDetails();
    }
  }, [farmerId, token, role]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'firstName') {
      const isValidName = /^[a-zA-Z\s]+$/.test(value); // Checks for letters and spaces only
      setFirstNameError(
        value.length < 2
          ? 'First name must be greater than 2 characters.'
          : !isValidName
          ? 'First name must contain only letters.'
          : ''
      );
    }
    
    if (name === 'phoneNo') {
      if (!/^\d{10}$/.test(value)) {
        setPhoneError('Phone number must be exactly 10 digits.');
      } else if (!/^[6-9]/.test(value)) {
        setPhoneError('Phone number must start with 6, 7, 8, or 9.');
      } else {
        setPhoneError('');
      }
    }

    if (name === 'aadharNo') {
      setAadharError(/^\d{12}$/.test(value) ? '' : 'Aadhaar number must be 12 digits.');
    }

    if (name === 'dob') {
      const selectedDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - selectedDate.getFullYear();
      const isUnderage =
        age < 18 ||
        (age === 18 && today.getMonth() < selectedDate.getMonth()) ||
        (age === 18 && today.getMonth() === selectedDate.getMonth() && today.getDate() < selectedDate.getDate());

      setDobError(isUnderage ? 'You must be at least 18 years old to register.' : '');
    }

    setUserDetails({
      ...userDetails,
      [name]: value,
    });
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setUserDetails({ ...userDetails, state: selectedState, district: '' });
  };

  // Handle form submission
  const handleUpdateAccount = async (e) => {
    e.preventDefault();

    if (phoneError || aadharError || dobError) {
      alert('Please fix the errors before submitting.');
      return;
    }

    const updateEndpoint =
      role === 'buyer'
        ? `http://localhost:8080/buyer/update/${farmerId}`
        : `http://localhost:8080/users/update/${farmerId}`;

    try {
      const response = await fetch(updateEndpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails),
      });

      if (response.ok) {
        setShowEdit(true);
        setTimeout(() => {
          setShowEdit(false);
          navigate('/account'); // Redirect to account page
        }, 2000);
      } else {
        navigate('/account')

      }
    } catch (err) {
      setError(`Server Busy`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="update-account-container">
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <div className="back">
        <button onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
        </button>
      </div>
      <h1 className="heading">
        <div className="word">
          <span>E</span>
          <span>D</span>
          <span>I</span>
          <span>T</span>
        </div>
        <div className="word">
          <span>A</span>
          <span>C</span>
          <span>C</span>
          <span>O</span>
          <span>U</span>
          <span>N</span>
          <span>T</span>
        </div>
      </h1>
      <form onSubmit={handleUpdateAccount}>
        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={userDetails.firstName}
          onChange={handleChange}
        />
        {firstNameError && <p className="error-message">{firstNameError}</p>}

        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={userDetails.lastName}
          onChange={handleChange}
        />

        <label htmlFor="phoneNo">Phone No:</label>
        <input
          type="tel"
          id="phoneNo"
          name="phoneNo"
          value={userDetails.phoneNo}
          onChange={handleChange}
        />
        {phoneError && <p className="error-message">{phoneError}</p>}

        <label htmlFor="dob">Date of Birth:</label>
        <input
          type="date"
          id="dob"
          name="dob"
          value={userDetails.dob}
          onChange={handleChange}
        />
        {dobError && <p className="error-message">{dobError}</p>}

        <label htmlFor="state">State:</label>
        <select id="state" name="state" required onChange={handleStateChange} value={userDetails.state}>
          <option value="">Select State</option>
          {Object.keys(statesWithDistricts).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <label htmlFor="district">District:</label>
        <select id="district" name="district" required onChange={handleChange} value={userDetails.district}>
          <option value="">Select District</option>
          {userDetails.state &&
            statesWithDistricts[userDetails.state].map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
        </select>

        <label htmlFor="aadharNo">Aadhar Number:</label>
        <input
          type="text"
          id="aadharNo"
          name="aadharNo"
          value={userDetails.aadharNo}
          onChange={handleChange}
        />
        {aadharError && <p className="error-message">{aadharError}</p>}

        <button type="submit">Save</button>
      </form>
      {showEdit && (
        <div className="accept-popup">
          <div className="accept-content">
            <h3>Successful</h3>
            <p>Account Edited successfully</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateAccount;
