import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../assets/UpdateCrop.css';

import ValidateToken from './ValidateToken';
const UpdateCrop = () => {
  const navigate = useNavigate();
  const { cropId } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cropData, setCropData] = useState({
    cropName: '',
    cropType: '',
    region: '',
    marketPrice: '',
    quantity: '',
  });
  const [image, setImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const farmerId = localStorage.getItem('farmerId');

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole ===null) {
      navigate("/login"); 
    }
    else if(userRole==="buyer")
    {
      navigate("/404");
    }
    const fetchCropData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please log in.');
          return;
        }

        // Fetch crop data
        const response = await fetch(`http://localhost:8080/crops/crop/${cropId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCropData(data);

          // Fetch existing image data
          const imageResponse = await fetch(`http://localhost:8080/crops/viewUrl/${data.cropID}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            setExistingImageUrl(imageUrl);
          }
        } else {
          setError('Failed to fetch crop data');
        }
      } catch (error) {
        setError('Server Busy');
      }
    };

    fetchCropData();
  }, [cropId]);

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



    const formData = new FormData();

    const cropObject = {
      cropID: parseInt(cropId),
      cropName: cropData.cropName,
      cropType: cropData.cropType,
      region: cropData.region,
      marketPrice: parseFloat(cropData.marketPrice),
      quantity: parseFloat(cropData.quantity),
      farmer: { farmerId: parseInt(farmerId) },
    };

    formData.append('crop', new Blob([JSON.stringify(cropObject)], { type: 'application/json' }));

    if (image) {
      formData.append('imageFile', image);
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/crops/farmer/update/${cropId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage('Crop updated successfully!');
      } else {
        setError('Failed to update crop');
        window.location.reload();
      }
    } catch (error) {
      setError('Server Busy');
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    navigate('/view-crop');
  };

  const handleGoBack = () => {
    navigate('/trade');
  };

  return (
    <div className="update-crop-container">
      
  <button onClick={() => navigate(-1)} className="back-button">
    <ValidateToken farmerId={farmerId} token={token} role={role} />
    <i className="fas fa-arrow-left"></i>
  </button>
  <h1 className="heading">
  <div class="word">
  <span>U</span>
  <span>P</span>
  <span>D</span>
  <span>A</span>
  <span>T</span>
  <span>E</span>
  </div>
  <div class="word">
  <span>C</span>
  <span>R</span>
  <span>O</span>
  <span>P</span>
  </div>
</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="update-crop-form">
        <label htmlFor="cropName">Crop Name:</label>
        <input
          type="text"
          id="cropName"
          name="cropName"
          value={cropData.cropName}
          required
          onChange={handleChange}
        />

        <label htmlFor="cropType">Crop Category:</label>
        <input
          type="text"
          id="cropType"
          name="cropType"
          value={cropData.cropType}
          required
          onChange={handleChange}
        />

        <label htmlFor="marketPrice">Market Price:</label>
        <input
          type="number"
          id="marketPrice"
          name="marketPrice"
          value={cropData.marketPrice}
          required
          onChange={handleChange}
        />

        <label htmlFor="quantity">Quantity:</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={cropData.quantity}
          required
          onChange={handleChange}
        />

        {existingImageUrl && (
          <div className="existing-image">
            <p>Existing Image:</p>
            <img src={existingImageUrl} alt="Crop" style={{ maxWidth: '200px', maxHeight: '200px' }} />
          </div>
        )}

        <label htmlFor="image">Upload New Image (if needed):</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Updating Crop...' : 'Update Crop'}
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
    </div>
  );
};

export default UpdateCrop;
