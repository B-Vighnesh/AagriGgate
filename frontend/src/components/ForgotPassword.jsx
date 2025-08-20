import React, { useState } from "react";
import "../assets/ForgotPassword.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [retrievedEmail, setRetrievedEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const maskEmail = (email) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.slice(0, 3)}***@${domain}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Password Validation
    if (name === "newPassword" || name === "confirmPassword") {
      const password = name === "newPassword" ? value : form.newPassword;
      const confirmPwd = name === "confirmPassword" ? value : form.confirmPassword;

      setPasswordError(
        password !== confirmPwd
          ? "Passwords do not match."
          : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
          ? ""
          : "Password must contain numbers, special character, upper and lower case."
      );
    }

    // Update form state
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handlePopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/auth/reset-otp/${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const responseEmail = await response.text();
        setRetrievedEmail(responseEmail);
        setMaskedEmail(maskEmail(responseEmail));
        setOtpSent(true);
        setStep(2);
        handlePopup("OTP sent to your registered email.");
      }
     
       else {
        console.log(response.status);
        if(response.status===500)
        {
          console.log(response.status);
          handlePopup("Server busy please try later");
          return
        }
        handlePopup(`Account not found with ${email}`);
      }
    } catch (error) {
      handlePopup("An error occurred while sending the OTP.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/auth/verify-otp?email=${encodeURIComponent(retrievedEmail)}&otp=${otp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handlePopup("OTP verified successfully. You can now reset your password.");
        setOtpVerified(true);
        setStep(3);
      } else {
        handlePopup("Invalid OTP. Please try again.");
      }
    } catch (error) {
      handlePopup("An error occurred during OTP verification.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      handlePopup("Passwords do not match. Please try again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/users/resetpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: retrievedEmail, newPassword: form.newPassword }),
      });

      if (response.ok) {
       setShowPopup("Password reset successful! Redirecting to login.");
       handlePopup("Password reset successful! Redirecting to login.");
       
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const error = await response.text();
        handlePopup(`Error: ${error}`);
      }
    } catch (error) {
      handlePopup("An error occurred while resetting the password.");
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else navigate('/login')
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="forgot-password-container">
      
      {showPopup && (
        <div className="approach-modal">
          <div className="e-message">
            {popupMessage}
            <br />
            <button onClick={closePopup} className="yes-button">
              Ok
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
        <button onClick={goBack} className="back-button">
          <i className="fas fa-arrow-left"></i>
        </button>
      
          <h2>Forgot Password</h2>
          
          <label htmlFor="email">Enter your registered email/username:</label>
          <input
            type="text"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="buttons">
            <button type="submit">Send OTP</button>
          </div>
        </form>
      )}

      {otpSent && step === 2 && (
        <form onSubmit={handleVerifyOtp}>
              <button onClick={goBack} className="back-button">
          <i className="fas fa-arrow-left"></i>
        </button>
          <h2>Verification</h2>
          
          <p>
            OTP has been sent to your registered email: <strong>{maskedEmail}</strong>
          </p>
          <label htmlFor="otp">Enter OTP:</label>
          <input
            type="text"
            id="otp"
            name="otp"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <div className="buttons">
            <button type="submit">Verify OTP</button>
          </div>
        </form>
      )}

      {otpVerified && step === 3 && (
        <form onSubmit={handleResetPassword}>
              <button onClick={goBack} className="back-button">
          <i className="fas fa-arrow-left"></i>
        </button>
          <h2>Change Password</h2>
          <label htmlFor="newPassword">Enter new password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            required
            value={form.newPassword}
            onChange={handleChange}
          />
          <label htmlFor="confirmPassword">Confirm new password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            required
            value={form.confirmPassword}
            onChange={handleChange}
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
          {passwordError && <h5 className="error-message">{passwordError}</h5>}
          <div className="buttons">
            <button type="submit">Reset Password</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
