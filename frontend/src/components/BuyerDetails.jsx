import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../assets/BuyerDetails.css'; 
import buyerIcon from '../images/buyer.jpg';

const BuyerDetails = () => {
  const { buyerId } = useParams(); 
  const [buyer, setBuyer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuyerDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/users/getBuyer/${buyerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBuyer(data);
        } else {
          console.error('Failed to fetch buyer details');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchBuyerDetails();
  }, [buyerId]);

  if (!buyer) {
    return <div className="buyer-loading">Loading...</div>;
  }

  return (
    <div className="buyer-details-container">
         <div className="account-content">
     <button onClick={() => navigate(-1)} className="back-button">
        <i className="fas fa-arrow-left"></i>
      </button>
      <h2 className="buyer-name">{buyer.firstName} {buyer.lastName}</h2>
      <img
        src={ buyerIcon }
        alt="Buyer"
        className="profile-image"
      />
      <p className="buyer-info"><strong>Username:</strong> {buyer.username}</p>
      <p className="buyer-info"><strong>Email:</strong> {buyer.email}</p>
      <p className="buyer-info"><strong>Phone:</strong> {buyer.phoneNo}</p>
      <p className="buyer-info"><strong>Date of Birth:</strong> {buyer.dob}</p>
      <p className="buyer-info"><strong>State:</strong> {buyer.state}</p>
      <p className="buyer-info"><strong>District:</strong> {buyer.district}</p>
      <p className="buyer-info"><strong>Aadhar No:</strong> {buyer.aadharNo}</p>
    </div></div>
  );
};

export default BuyerDetails;
