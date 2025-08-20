import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/ViewAllCrop.css';
import ValidateToken from './ValidateToken';

const ViewAllCrop = () => {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    price: '',
    category: '',
    farmerName: '',
  });

  const farmerId = localStorage.getItem('farmerId');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  // Fetch crops on component load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCrops = async () => {
      try {
        const response = await fetch('http://localhost:8080/crops/viewCrop', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCrops(data);
          setFilteredCrops(data); // Initially show all crops
          data.forEach((crop) => fetchImageWithAuthorization(crop.cropID));
        } else {
          window.location.reload()
        }
      } catch (error) {
        setError('Server Busy');
      }
    };

    fetchCrops();
  }, [navigate]);

  // Fetch crop images
  const fetchImageWithAuthorization = async (cropID) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/crops/viewUrl/${cropID}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageUrls((prevState) => ({ ...prevState, [cropID]: imageUrl }));
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  // Filter crops based on search and filters
  const applyFilters = () => {
    let filtered = crops;

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (crop) =>
          crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crop.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crop.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crop.farmer?.firstName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.region) {
      filtered = filtered.filter((crop) =>
        crop.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }
    if (filters.price) {
      const priceLimit = parseFloat(filters.price);
      filtered = filtered.filter((crop) => crop.marketPrice <= priceLimit);
    }
    if (filters.category) {
      filtered = filtered.filter((crop) =>
        crop.cropType.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.farmerName) {
      filtered = filtered.filter((crop) =>
        crop.farmer?.firstName.toLowerCase().includes(filters.farmerName.toLowerCase())
      );
    }

    setFilteredCrops(filtered);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    // Dynamically filter crops as the user types
    const dynamicFilteredCrops = crops.filter((crop) =>
      crop.cropName.toLowerCase().includes(query.toLowerCase()) ||
      crop.cropType.toLowerCase().includes(query.toLowerCase()) ||
      crop.region.toLowerCase().includes(query.toLowerCase()) ||
      crop.farmer?.firstName.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredCrops(dynamicFilteredCrops);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleViewDetails = (cropID) => {
    navigate(`/view-details/${cropID}`);
  };

  const handleViewApproachClick = () => {
    navigate('/view-approaches-user');
  };

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div><h1 class="heading">
        <div class="word">
    <span>A</span>
    <span>V</span>
    <span>A</span>
    <span>I</span>
    <span>L</span>
    <span>A</span>
    <span>B</span>
    <span>L</span>
    <span>E</span>
    </div>
    <div class="word"><span>C</span>
    <span>R</span>
    <span>O</span>
    <span>P</span>
    <span>S</span>
    </div>
    
   
</h1>
<ValidateToken farmerId={farmerId} token={token} role={role} />
      {/* <div className="viewApproach">
        <button className="view-approach-button" onClick={handleViewApproachClick}>
          View Approach
        </button>
      </div> */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search crops..."
        />
      </div>
      <div className="crop">
        <div className="filters-panel">
          <h3>Filters</h3>
          <label>Region</label>
          <input
            type="text"
            name="region"
            value={filters.region}
            onChange={handleFilterChange}
            placeholder="Filter by Region"
          />
          <label>Price (Max)</label>
          <input
            type="number"
            name="price"
            value={filters.price}
            onChange={handleFilterChange}
            placeholder="Max Price"
          />
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            placeholder="Filter by Category"
          />
          <label>Farmer Name</label>
          <input
            type="text"
            name="farmerName"
            value={filters.farmerName}
            onChange={handleFilterChange}
            placeholder="Filter by Farmer"
          />
          <button onClick={applyFilters}>Apply Filters</button>
        </div>
        <div className="crop-card-container">
          {filteredCrops.length === 0 ? (
            <p>No crops available based on your filters or search.</p>
          ) : (
            filteredCrops.map((crop) => (
              <div className="crop-card" key={crop.cropID}>
                <h3>{crop.cropName}</h3>
                <img
                  src={imageUrls[crop.cropID] || 'https://via.placeholder.com/150'}
                  alt={crop.cropName}
                  className="crop-image"
                />
                <p><strong>Farmer:</strong> {crop.farmer?.firstName || 'N/A'}</p>
                <p><strong>Category:</strong> {crop.cropType}</p>
                <p><strong>Region:</strong> {crop.region}</p>
                <p><strong>Market Price:</strong> {crop.marketPrice.toFixed(2)} per {crop.unit}</p>
                <p><strong>Quantity:</strong> {crop.quantity} {crop.unit}</p>
                {/* <p><strong>Description:</strong> {crop.description}</p> */}
                <button onClick={() => handleViewDetails(crop.cropID)}>View Details</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllCrop;
