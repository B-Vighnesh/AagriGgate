import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/AddCrop.css';
import ValidateToken from './ValidateToken';

const AddCrop = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null); 
  
  const [cropData, setCropData] = useState({
    cropName: '',
    cropType: '',
    region: '', // Initially empty, will be set based on location
    marketPrice: '',
    quantity: '',
    unit: 'kg', // Default unit
    description: '',
  });
  
  const farmerId=localStorage.getItem('farmerId')

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [image, setImage] = useState(null);
  const apikey="4138beff07ea4a259f0c2ff71ba19378";
  useEffect(() => {
    const token = localStorage.getItem('token');
    const farmerId = localStorage.getItem('farmerId');
    if (!token || !farmerId) {
      navigate('/login'); // Redirect to login if not authenticated
    }
    const userRole = localStorage.getItem("role");
    if (userRole ===null) {
      navigate("/login"); 
    }
    else if(userRole==="buyer")
    {
      navigate("/404");
    }
    // Automatically set region based on user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchRegionFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.error('Error fetching location:', error);
          setError('Unable to retrieve your location. Please enter your region manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, [navigate]);

  const fetchRegionFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apikey}`);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log(data); // Log the entire response for debugging
  
      if (data.results && data.results.length > 0) {
        const components = data.results[0].components;
  
        // Safely get village, district, and state with fallback
        const village = components.village || components.hamlet || components.locality || '';
        const district = components.district || components.suburb || components.county || ''; // Add 'county' as fallback
        const state = components.state || components.province || components.region || ''; // Add 'region' as fallback
  
        // Combine the region details and remove any empty strings
        const regionParts = [village, district, state].filter(part => part.trim() !== ''); // Filter out empty parts
        const formattedRegion = regionParts.join(', '); // Join with commas
  
        console.log(`Formatted Region: ${formattedRegion}`); // Log the formatted region
  
        // Set the crop data with the retrieved region details
        setCropData((prevData) => ({
          ...prevData,
          region: formattedRegion // Set the formatted region directly
        }));
      } else {
        setError('No results found for the provided coordinates.');
      }
    } catch (error) {
      console.error('Error fetching region data:', error);
      setError('Unable to fetch region data. Please enter your region manually.');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCropData({
      ...cropData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const farmerId = localStorage.getItem('farmerId');

    const formData = new FormData();
    const cropObject = {
      cropName: cropData.cropName,
      cropType: cropData.cropType,
      region: cropData.region,
      marketPrice: parseFloat(cropData.marketPrice),
      quantity: parseFloat(cropData.quantity),
      unit: cropData.unit,
      description: cropData.description,
      farmer: { farmerId: parseInt(farmerId) },
    };

    formData.append('crop', new Blob([JSON.stringify(cropObject)], { type: 'application/json' }));
    if (image) {
      formData.append('imageFile', image);
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8080/crops/farmer/addCrop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage('Crop added successfully!');
        setCropData({ cropName: '', cropType: '', region: '', marketPrice: '', quantity: '', unit: 'kg', description: '' });
        setImage(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add crop');
      }
    } catch (error) {
      setError('Error occurred while adding crop');
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    navigate('/view-crop');
  };
  const handleViewCrop = () => {
    navigate('/view-crop');
  };
  return (
    <div className="add-crop-container"><ValidateToken farmerId={farmerId} token={token} role={role} />
      <h1 className="heading">
      <div class="word">
  <span>A</span>
  <span>D</span>
  <span>D</span>
  </div>
  <div class="word">
  <span>C</span>
  <span>R</span>
  <span>O</span>
  <span>P</span>
  </div>
</h1>

      {/* <button className="go-back-button" onClick={handleGoBack}><i className="fas fa-arrow-left"></i></button>
      <h2>Add Crop</h2> */}
      {/* <button className="add-crop-button" onClick={handleViewCrop}> View Crop</button> */}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="add-crop-form">
        <label htmlFor="cropName">Crop Name:</label>
        <input type="text" id="cropName" name="cropName" value={cropData.cropName} required onChange={handleChange} />

        <label htmlFor="cropType">Crop Category:</label>
        <input type="text" id="cropType" name="cropType" value={cropData.cropType} required onChange={handleChange} />

        <label htmlFor="region">Region:</label>
        <input type="text" id="region" name="region" value={cropData.region} readOnly /> {/* Make the field read-only since it's auto-filled */}

        <label htmlFor="marketPrice">Market Price:</label>
        <input type="number" id="marketPrice" name="marketPrice" value={cropData.marketPrice} required onChange={handleChange} />

        <label htmlFor="quantity">Quantity:</label>
        <input type="number" id="quantity" name="quantity" value={cropData.quantity} required onChange={handleChange} />

        <label htmlFor="unit">Unit:</label>
        <select id="unit" name="unit" value={cropData.unit} onChange={handleChange} required>
          <option value="kg">kg</option>
          <option value="ltr">litre</option>
          <option value="g">gram</option>
          <option value="piece">piece</option>
        </select>

        <label htmlFor="description">Description:</label>
        <textarea id="description" name="description" value={cropData.description} required onChange={handleChange} />

        <label htmlFor="image">Capture an image or upload one:</label>
        <input 
  type="file" 
  id="image" 
  accept="image/*" 
  capture="environment" 
  required 
  onChange={handleImageChange} 
/>
{image && (
  <div className="image-preview">
    <img src={URL.createObjectURL(image)} alt="Crop Preview" />
  </div>
)}


        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Adding Crop...' : 'Add Crop'}
        </button>
      </form>
      {successMessage && (
          <div className="success-modal">
            <div className="success-message">
              <p>{successMessage}</p>
              <button onClick={handleView} className="ok-button">Ok</button>
            </div>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AddCrop;