import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../assets/ViewDetails.css';
import DeleteCrop from './DeleteCrop';

import ApproachFarmer from './ApproachFarmer';

const ViewDetails = () => {
  const { cropId } = useParams();
  const [cropDetails, setCropDetails] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [approachStatus, setApproachStatus] = useState(null);
  const [showDeleteComponent, setShowDeleteComponent] = useState(false); // State to manage DeleteCrop visibility
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const currentUserId = localStorage.getItem('farmerId'); // Get the role from localStorage
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Manage modal visibility
  const [showApproachModal, setShowApproachModal] = useState(false); 
  const [showAccept, setShowAccept] = useState(false); 
  const [requests,setRequests]=useState(false)

  const handleUpdateClick = () => {
    navigate(`/update-crop/${cropId}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteComponent(true); // Show DeleteCrop component
  };

  const handleApproachFarmerClick = () => {
    const currentUserId = localStorage.getItem('farmerId'); // Get the current user ID from localStorage

    if (cropDetails && cropDetails.farmer) {
      const farmerId = cropDetails.farmer.farmerId;

      navigate('/approach-farmer', {
        state: {
          cropID: cropId,
          farmerId: farmerId,
          userId: currentUserId,
        },
      });
    } else {
      alert('Farmer details are not available.');
    }
  };

  const handleViewApproachedClick = () => {
    if (cropDetails && cropDetails.farmer) {
      const farmerId = cropDetails.farmer.farmerId;
      navigate(`/view-approaches/farmer/${farmerId}/crop/${cropId}`);
    } else {
      alert('Farmer details are not available.');
    }
  };

  useEffect(() => {
    const fetchCropDetails = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/crops/crop/${cropId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
         
          setCropDetails(data);
        
          
        } else { setError('This Crop has been deleted by Farmer');
          setTimeout(() => {
           navigate(-1); // Redirect to account page
         }, 500)
       }
       const farmerId=localStorage.getItem('farmerId');;
       fetch(`http://localhost:8080/seller/approach/requests/farmer/${farmerId}/${cropId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request header
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parse JSON if response is OK
          } else if (response.status === 401) {
            throw new Error("Unauthorized access. Please log in again.");
          } else {
            throw new Error(`Error: ${response.statusText}`);
          }
        })
        .then((data) => {
          const requests = Array.isArray(data) ? data.length : 0; // Determine the number of requests
          setRequests(requests); // Update state directly
        })
        .catch((error) => {
          console.error("Error fetching approach requests:", error.message);
          setRequests(0); // Set state to 0 in case of error
        });
        const imageResponse = await fetch(`http://localhost:8080/crops/viewUrl/${cropId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (imageResponse.ok) {
          const blob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(blob);
          setImageUrl(imageUrl);
        }

        const userId = localStorage.getItem('farmerId');
        const statusResponse = await fetch(`http://localhost:8080/buyer/approach/requests/user/${userId}/${cropId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setApproachStatus(statusData);
        }
        
      } catch (error) {
        console.log(error)
        setError('This Crop has been deleted by Farmer');
         setTimeout(() => {
          navigate(-1); // Redirect to account page
        }, 500)
      }
    };

    fetchCropDetails();
  }, [cropId]);

  useEffect(() => {
    if (approachStatus === true) {
      setShowAccept('Please check your email for further process.');
    
    } else if (approachStatus === false) {
     setShowAccept('You have already made an approach or it is still pending.');
    }
  }, [approachStatus]);
const onClose = () => {
  setShowAccept('');
}

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!cropDetails) {
    return <div>Loading crop details...</div>;
  }

  return (
    <div className="full-page-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <i className="fas fa-arrow-left"></i>
      </button>
      <h1 className="heading">
        
  <div class="word">
        <span>C</span>
        <span>R</span>
        <span>O</span>
        <span>P</span>
        </div>
        <div class="word">
        <span>D</span>
        <span>E</span>
        <span>T</span>
        <span>A</span>
        <span>I</span>
        <span>L</span>
        <span>S</span>
        </div>
      </h1>

      {imageUrl && <img src={imageUrl} alt={cropDetails.cropName} className="full-page-image" />}

      <div className="full-page-details">
        <h3>{cropDetails.cropName}</h3>
        <p><strong>Type:</strong> {cropDetails.cropType}</p>
        <p><strong>Region:</strong> {cropDetails.region}</p>
        <p><strong>Market Price:</strong> {cropDetails.marketPrice.toFixed(2)}</p>
        <p><strong>Quantity:</strong> {cropDetails.quantity} kg</p>
        <p><strong>Farmer:</strong> {cropDetails.farmer?.firstName} {cropDetails.farmer?.lastName}</p>
        <p><strong>Description:</strong> {cropDetails.description}</p>
        <p><strong>Added Date:</strong> {cropDetails.postDate}</p>
        {role === 'buyer' ? (
         <button 
         onClick={() => setShowApproachModal(true)} 
         className="action-button approach-button">
         Approach Farmer
       </button>
     
        ) : (
          <><p><strong>Total Requests for this crop:</strong>{requests}</p>
          <div className="button-group">
            
            <button onClick={handleUpdateClick} className="action-button">Update Crop</button>
            <button onClick={handleViewApproachedClick} className="action-button view-approached-button">View Approached</button>
            <button onClick={() => setShowDeleteModal(true)} className="action-button delete-button">Delete Crop</button>
          </div></>
        )}
     {showDeleteModal && (
          <DeleteCrop 
            cropId={cropId} 
            onClose={() => setShowDeleteModal(false)} // Close the modal when "Cancel" is clicked
          />
        )}
          {showApproachModal && (
         <ApproachFarmer 
           cropId={cropId} 
           farmerId={cropDetails.farmer?.farmerId}
           userId={ currentUserId}
           onClose={() => setShowApproachModal(false)} 
         />
       )}
       {showAccept && (
  <div className="accept-popup">
    <div className="accept-content">
      <h3>Farmer Accepted</h3>
      <p>Farmer already accepted your request for this crop. Please check your email for further process.</p>
      <div className="popup-buttons">
        <button onClick={onClose} className="ok-button">Ok</button>
      </div>
    </div>
  </div>
)}

 </div>
    </div>
  );
};

export default ViewDetails;
