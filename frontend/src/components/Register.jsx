import React, { useState, useEffect } from 'react';
import '../assets/Register.css';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal'; // Import the Modal component
import statesWithDistricts from './StatesWithDistricts';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [userTypeError, setUserTypeError] = useState('');
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNo: '',
    dob: '',
    state: '',
    district: '',
    aadharNo: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [aadharError, setAadharError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [dobError, setDobError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  // Modal state
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const farmerId = localStorage.getItem('farmerId');
    if (farmerId) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleModal = (title, message) => {
    setModal({ isOpen: true, title, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '' });
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });

    if (name === 'aadharNo') {
      setAadharError(/^\d{12}$/.test(value) ? '' : 'Aadhaar number must be 12 digits.');
    }
    if (name === 'phoneNo') {
      // Check if the phone number is 10 digits
      if (!/^\d{10}$/.test(value)) {
        setPhoneError('Phone number must be exactly 10 digits.');
      } 
      // Check if the phone number starts with 6, 7, 8, or 9
      else if (!/^[6-9]/.test(value)) {
        setPhoneError('Phone number must start with 6, 7, 8, or 9.');
      } 
      // Clear error if both conditions are met
      else {
        setPhoneError('');
      }
    }
    
    

    if (name === 'dob') {
      const selectedDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - selectedDate.getFullYear();
      const isUnderage =
        age < 18 || (age === 18 && today.getMonth() < selectedDate.getMonth()) ||
        (age === 18 && today.getMonth() === selectedDate.getMonth() && today.getDate() < selectedDate.getDate());

      setDobError(isUnderage ? 'You must be at least 18 years old to register.' : '');
    }

    if (name === 'email') {
      try {
        const response = await fetch(`http://localhost:8080/users/findEmail/${value}`);
        const emailExists = response.ok ? await response.json() : false;
        setEmailError(emailExists ? 'This email is already in use.' : '');
      } catch {
        setEmailError('An error occurred while checking the email.');
      }
    }

    if (name === 'password' || name === 'confirmPassword') {
      const password = name === 'password' ? value : form.password;
      const confirmPwd = name === 'confirmPassword' ? value : confirmPassword;
      setPasswordError(
        password !== confirmPwd
          ? 'Passwords do not match.'
          : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
          ? ''
          : 'Password must contain numbers, a special character, and upper and lower case.'
      );
      if (name === 'password') setForm({ ...form, password: value });
      if (name === 'confirmPassword') setConfirmPassword(value);
    }

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
    
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!userType) {
      setUserTypeError('Please select a user type.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/auth/send-otp/${form.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setOtpSent(true);
        toggleModal('Success', 'OTP sent to your email.');
      } else {
        toggleModal('Error', `Email not found`);
      }
    } catch {
      toggleModal('Error', `Email not found`);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/auth/verify-otp?email=${encodeURIComponent(form.email)}&otp=${otp}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );

      if (response.ok) {
        toggleModal('Success', 'OTP verified successfully.');
        setOtpVerified(true);
        setStep(2);
      } else {
        toggleModal('Error', 'Invalid OTP. Please try again.');
      }
    } catch {
      toggleModal('Error', 'An error occurred during OTP verification.');
    }
  };
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setForm({ ...form, state: selectedState, district: '' });
  };
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordError || !form.password || !confirmPassword) {
      toggleModal('Error', 'Ensure the passwords match before registering.');
      return;
    }

    try {
      const endpoint = userType === 'buyer'
        ? 'http://localhost:8080/buyer/register'
        : 'http://localhost:8080/users/register';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        toggleModal('Success', 'Registration successful!');
    
        setTimeout(() =>     navigate('/login'), 1000);
      } else {
        toggleModal('Server Busy.');
      }
    } catch {
      toggleModal('Server Busy.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoggedIn) {
    return (
      <div>
        <p>You are already logged in.</p>
        <button onClick={() => navigate('/logout')}>Logout</button>
      </div>
    );
  }

  return (
    <div className="register-page">
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      /> <h1 className="heading">
  <span>R</span>
  <span>E</span>
  <span>G</span>
  <span>I</span>
  <span>S</span>
  <span>T</span>
  <span>E</span>
  <span>R</span>
</h1>
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <div className='user-type'><label>
           <strong>User Type:</strong> <br></br>
            <label>
    <input
      type="radio"
      name="userType"
      value="farmer"
      checked={userType === 'farmer'}
      onChange={(e) => {
        setUserType(e.target.value);
        setUserTypeError(''); // Clear error when selected
      }}
    />
    Farmer
  </label>
  <label>
    <input
      type="radio"
      name="userType"
      value="buyer"
      checked={userType === 'buyer'}
      onChange={(e) => {
        setUserType(e.target.value);
        setUserTypeError(''); // Clear error when selected
      }}
    />
    Buyer
  </label>
  </label>
  </div>
 {/* Show error if it exists */}


          {userTypeError && <p className="error-message">{userTypeError}</p>}

          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            onChange={handleChange}
          />
          {firstNameError && <p className="error-message">{firstNameError}</p>}

          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            
            onChange={handleChange}
          />

          <label htmlFor="phoneNo">Phone No:</label>
          <input
            type="tel"
            id="phoneNo"
            name="phoneNo"
            required
            onChange={handleChange}
          />
          
{phoneError && <p className="error-message">{phoneError}</p>}

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
          />
          {emailError && <p className="error-message">{emailError}</p>}

          <label htmlFor="dob">Date of Birth:</label>
          <input
            type="date"
            id="dob"
            name="dob"
            required
            onChange={handleChange}
          />
{dobError && <p className="error-message">{dobError}</p>}
          <label htmlFor="state">State:</label>
          <select id="state" name="state" required onChange={handleStateChange}>
            <option value="">Select State</option>
            {Object.keys(statesWithDistricts).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <label htmlFor="district">District:</label>
          <select id="district" name="district" required onChange={handleChange} value={form.district}>
            <option value="">Select District</option>
            {form.state && statesWithDistricts[form.state].map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <label htmlFor="aadharNo">Aadhar No:</label>
          <input
            type="text"
            id="aadharNo"
            name="aadharNo"
            required
            onChange={handleChange}
          />
{aadharError && <p className="error-message">{aadharError}</p>}
<label htmlFor="password">Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            required
            onChange={handleChange}
            value={form.password}
          />

          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            required
            onChange={(e) => handleChange(e)}
            value={confirmPassword}
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

<button
  type="submit"
  disabled={
    !!emailError || !!passwordError || !!aadharError || !!phoneError || !!userTypeError ||!!dobError
  }
>
  Send OTP
</button>

          {/* OTP Verification Fields */}
          {otpSent && (
            <div>
              <label htmlFor="otp">Enter OTP:</label>
              <input
                type="text"
                id="otp"
                name="otp"
                required
                value={otp}
                onChange={handleOtpChange}
              />
              <button onClick={handleVerifyOtp}>Verify OTP</button>
            </div>
          )}
        </form>
      )}

      {/* Step 2 Registration Form */}
      {step === 2 && otpVerified && (
        <form onSubmit={handleRegister}>
          <h3>Complete Registration</h3>
          <button type="submit">Register</button>
        </form>
      )}
      <div className='temp-button'>
<button
        id="forgot-password"
        onClick={() => navigate('/forgot-password')}
        className="forgot-password-link"
      >
        Forgot Password?
      </button>

      <button id="log" onClick={() => navigate('/login')} className="login-link">
        Existing user? Login here
      </button>
      </div>
    </div>
  );
};

export default Register; 