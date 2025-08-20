import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/ViewCrop.css';

import ValidateToken from './ValidateToken';
const ViewCrop = () => {
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const farmerId=localStorage.getItem('farmerId')

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  useEffect(() => {
    const token = localStorage.getItem('token');
    const farmerId = localStorage.getItem('farmerId');

    if (!token || !farmerId) {
      navigate('/login');
      return;
    }
    const userRole = localStorage.getItem("role");
    if (userRole ===null) {
      navigate("/login"); 
    }
    else if(userRole==="buyer")
    {
      navigate("/404");
    }
    const fetchCrops = async () => {
      try {
        const response = await fetch(`http://localhost:8080/crops/farmer/viewCrop/${farmerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCrops(data);
          data.forEach(crop => fetchImageWithAuthorization(crop.cropID));
        } else {
          setError('session has been expired please login ');
        }
      } catch (error) {
        setError('Server Busy');
      }
    };

    fetchCrops();
  }, [navigate]);

  const fetchImageWithAuthorization = async (cropID) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/crops/viewUrl/${cropID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageUrls(prevState => ({ ...prevState, [cropID]: imageUrl }));
      } else {
        console.error('Failed to fetch image');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filterCrops = () => {
    if (searchQuery.trim() === '') {
      return crops;
    }
    return crops.filter(crop =>
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleViewDetails = (cropID) => {
    navigate(`/view-details/${cropID}`);
  };

  const handleGoBack = () => {
    navigate('/trade');
  };

  const handleAddCrop = () => {
    navigate('/add-crop');
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="view-crop-container"><ValidateToken farmerId={farmerId} token={token} role={role} />
      <div className="header">
     
      {/* <button className="go-back-button" onClick={handleGoBack}><i className="fas fa-arrow-left"></i></button> */}

      <h1 class="heading">
       
  <div class="word">
        <span>C</span>
        <span>R</span>
        <span>O</span>
        <span>P</span>
        <span>S</span></div>
        <div class="word">
        <span>D</span>
        <span>A</span>
        <span>S</span>
        <span>H</span>
        <span>B</span>
        <span>O</span>
        <span>A</span>
        <span>R</span>
        <span>D</span></div>
    </h1>
        {/* <button className="add-crop-button" onClick={handleAddCrop}>+ Add Crop</button> */}
      </div>

      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search crops..."
        />
      </div>

      <div className="crop-card-container">
        {filterCrops().length === 0 ? (
          <div className="empty-state">
            <h2>No Crops Found</h2>
            <p>Try adding crops or modifying your search filters.</p>
          </div>
        ) : (
          filterCrops().map((crop) => (
            <div className="crop-card" key={crop.cropID} onClick={() => handleViewDetails(crop.cropID)}>
               <h3>{crop.cropName}</h3>
              <img
                src={imageUrls[crop.cropID] || 'https://via.placeholder.com/300'}
                alt={crop.cropName}
                className="crop-image"
              />
              <div className="crop-details" >
               
                <p><strong>Type:</strong> {crop.cropType}</p>
                <p><strong>Region:</strong> {crop.region}</p>
                <p><strong>Market Price:</strong> &#8377;
                {crop.marketPrice.toFixed(2)} per {crop.unit}</p>
                <p><strong>Quantity:</strong> {crop.quantity} {crop.unit}</p>
                {/* <p><strong>Description:</strong> {crop.description}</p> */}
                <button className="view-details-button" onClick={() => handleViewDetails(crop.cropID)}>View Details</button>
           
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewCrop;
