import React, { useEffect, useState, useCallback } from "react";
import "../assets/Market.css";
import { useNavigate } from 'react-router-dom';

import commodities from './commodities';
import statesAndDistricts from './statesAndDistricts';
import ValidateToken from './ValidateToken';

const Market = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commodity, setCommodity] = useState("Tomato"); // Default commodity
  const navigate = useNavigate();
  const [arrivalDate, setArrivalDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [districtOptions, setDistrictOptions] = useState([]);
  const [averagePrice, setAveragePrice] = useState(null);
  const [bestPriceData, setBestPriceData] = useState(null); // Includes price and market
  const [highestPriceData, setHighestPriceData] = useState(null); // Includes price and market
  const apiKey="579b464db66ec23bdd000001602edb9ef1a64cd961329419d730f705";
  const [savedData, setSavedData] = useState([]);
  const [filterCommodity, setFilterCommodity] = useState("");
const [filterState, setFilterState] = useState("");
const [filterDistrict, setFilterDistrict] = useState("");
const [minPriceFilter, setMinPriceFilter] = useState("");
const [maxPriceFilter, setMaxPriceFilter] = useState("");
const [selectedState, setSelectedState] = useState("");
const [selectedDistrict, setSelectedDistrict] = useState("");
const [popupMessage, setPopupMessage] = useState(null);
const filteredData = savedData.filter((item) => {
  let matchesFilter = true;

  // Filter by Commodity
  if (filterCommodity && item.Commodity !== filterCommodity) {

    matchesFilter = false;
  }

  // Filter by State
  if (selectedState && item.State !== selectedState) {
   
    matchesFilter = false;
  }

  // Filter by District
  if (selectedDistrict && item.District !==selectedDistrict) {
    matchesFilter = false;
  }

  // Filter by Min Price
  if (minPriceFilter && parseFloat(item.Min_Price) < parseFloat(minPriceFilter)) {
    matchesFilter = false;
  }

  // Filter by Max Price
  if (maxPriceFilter && parseFloat(item.Max_Price) > parseFloat(maxPriceFilter)) {
    matchesFilter = false;
  }

  return matchesFilter;
});
const farmerId=localStorage.getItem('farmerId')

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');


  const handleSaveData = async (item) => {
    const token = localStorage.getItem("token"); 
    item.farmerId=localStorage.getItem("farmerId"); 
    try {
      const response = await fetch("http://localhost:8080/api/saved-market-data/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
        body: JSON.stringify(item), // Convert item to JSON string
      });
  if(response.ok)
  {
    const savedItem = await response.json();
    setPopupMessage(`Data for ${savedItem.Commodity || "Market"} saved successfully!`);
    handleViewSavedData();
  }
      if (!response.ok) {
        window.location.reload();
      }
     
    } catch (error) {
      setPopupMessage("Server busy");
    }
  };
  const handleDeleteData = async (id) => {
    const token = localStorage.getItem("token"); // Fetch Bearer token
    if (!token) {
      setPopupMessage("User not authenticated. Please log in.");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/saved-market-data/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token
          "X-Id": id,
        },
      });
  
      if (!response.ok) {
      window.location.reload();
      }
  
      setPopupMessage("Data deleted successfully!");
      handleViewSavedData();
    } catch (error) {
     setPopupMessage("Server busy");
    }
  };
  
  const handleViewSavedData = async () => {
    const token = localStorage.getItem("token");
    try {
      const farmerId = localStorage.getItem("farmerId"); // Replace with the actual farmerId
      const response = await fetch("http://localhost:8080/api/saved-market-data/getAll", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token
          "X-Farmer-Id": farmerId, // Custom header for farmerId
        },
      });
  
      if (!response.ok) {
      window.location.reload();
      }
  
      const savedData = await response.json();
      setSavedData(savedData);
    } catch (error) {
     setPopupMessage("Server busy");
      
    }
  };
  
  
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
const apiUrl = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${apiKey}&format=json&offset=0&limit=1000&filters[State]=${state}&filters[District]=${district}&filters[Commodity]=${commodity}&filters[Arrival_Date]=${arrivalDate}`;


    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("Server is busy. Please try again later.");
        } else {
          throw new Error("Server is busy. Please try again later.");
        }
      }

      const data = await response.json();
      const records = data.records || [];
      setMarketData(records);
console.log(marketData)
      // Calculate average price, best price, and highest price with their respective markets
      const modalPrices = records
        .map((item) => parseFloat(item.Modal_Price))
        .filter((price) => !isNaN(price)); // Ensure valid numbers
      const minPrices = records
        .map((item) => ({ price: parseFloat(item.Min_Price), market: item.Market }))
        .filter((item) => !isNaN(item.price));
      const maxPrices = records
        .map((item) => ({ price: parseFloat(item.Max_Price), market: item.Market }))
        .filter((item) => !isNaN(item.price));

      const avgPrice = modalPrices.length > 0
        ? (modalPrices.reduce((acc, price) => acc + price, 0) / modalPrices.length).toFixed(2)
        : null;
      
      const bestPrice = minPrices.length > 0
        ? minPrices.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), minPrices[0])
        : null;

      const highestPrice = maxPrices.length > 0
        ? maxPrices.reduce((prev, curr) => (curr.price > prev.price ? curr : prev), maxPrices[0])
        : null;

      setAveragePrice(avgPrice);
      setBestPriceData(bestPrice);
      setHighestPriceData(highestPrice);

      setLoading(false);
    } catch (error) {
      console.error("Server is busy. Please try again later.");
      setError("Server is busy. Please try again later.");
      setLoading(false);
    }
  }, [commodity, arrivalDate, state, district]);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole ===null) {
      navigate("/login"); 
    }
    else if(userRole==="buyer")
    {
      navigate("/404");
    }
    if (state && district && commodity) {
      fetchMarketData();
    }
  }, [fetchMarketData]);

  const handleStateChange = (selectedState) => {
    setState(selectedState);
    setDistrictOptions(statesAndDistricts[selectedState] || []);
    setDistrict(""); // Reset district when state changes
  };
  const closePopup = () => {
    setPopupMessage(null);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    fetchMarketData();
  };

  return (
    <div>
      <ValidateToken farmerId={farmerId} token={token} role={role} />

      <h1 class="heading">
        <span>M</span>
        <span>A</span>
        <span>R</span>
        <span>K</span>
        <span>E</span>
        <span>T</span>
        
    </h1>
      <div className="market">
        
      <form onSubmit={handleSubmit} className="market-form">
  <label>
    Commodity:
    <select
      value={commodity}
      onChange={(e) => setCommodity(e.target.value)}
    >
      {commodities.map((commodityItem) => (
        <option key={commodityItem} value={commodityItem}>
          {commodityItem}
        </option>
      ))}
    </select>
  </label>
  <label>
    Arrival Date:
    <input
      type="date"
      value={arrivalDate}
      max={new Date().toISOString().split("T")[0]} // Set the maximum date to today
      onChange={(e) => setArrivalDate(e.target.value)}
    />
  </label>
  <label>
    State:
    <select
      value={state}
      required
      onChange={(e) => handleStateChange(e.target.value)}
    >
      <option value="">Select State</option>
      {Object.keys(statesAndDistricts).map((stateName) => (
        <option key={stateName} value={stateName}>
          {stateName}
        </option>
      ))}
    </select>
  </label>
  <label>
    District:
    <select
      value={district}
      required
      onChange={(e) => setDistrict(e.target.value)}
      disabled={!state}
    >
      <option value="">Select District</option>
      {districtOptions.map((districtName) => (
        <option key={districtName} value={districtName}>
          {districtName}
        </option>
      ))}
    </select>
  </label>
  <button type="submit">Fetch Data</button>
  <button type="button" onClick={handleViewSavedData} className="view-saved-button">
    View Saved Data
  </button>
</form>


        {state && district && commodity && arrivalDate&&(
          <div className="market-summary">
            <h2>Prices of {commodity} in {district}, {state} on {arrivalDate}</h2>
            {averagePrice !== null ? (
              <>
                <p>
                  <strong>Average Price:</strong> ₹{averagePrice}
                </p>
                <p>
                  <strong>Lowest Price:</strong> ₹{bestPriceData?.price || "N/A"} at {bestPriceData?.market || "N/A"}
                </p>
                <p>
                  <strong>Highest Price:</strong> ₹{highestPriceData?.price || "N/A"} at {highestPriceData?.market || "N/A"}
                </p>
                <p>
                  <strong>Arrival Date:</strong> {arrivalDate}
                </p>
              </>
            ) : (
              <p></p>
            )}
          </div>
        )}
        

<div className="market-list">
  {loading && <p>Loading market data...</p>}
  {error && <p className="market-error">Server is busy. Please try again later.</p>}
  {!loading && !error && marketData.length > 0 ? (
    marketData.map((item, index) => (
      <div className="market-item" key={index}>
        <h3>Commodity: {item.Commodity || "N/A"}</h3>
        {item.State && <p><strong>State:</strong> {item.State}</p>}
        {item.District && <p><strong>District:</strong> {item.District}</p>}
        {item.Market && <p><strong>Market:</strong> {item.Market}</p>}
        {item.Variety && <p><strong>Variety:</strong> {item.Variety}</p>}
        {item.Grade && <p><strong>Grade:</strong> {item.Grade}</p>}
        {item.Arrival_Date && <p><strong>Arrival Date:</strong> {item.Arrival_Date}</p>}
        {item.Min_Price && <p><strong>Min Price:</strong> ₹{item.Min_Price}</p>}
        {item.Max_Price && <p><strong>Max Price:</strong> ₹{item.Max_Price}</p>}
        {item.Modal_Price && <p><strong>Modal Price:</strong> ₹{item.Modal_Price}</p>}
        
        {/* Save Button */}
        <button
          onClick={() => handleSaveData(item)}
          className="save-button"
        >
          Save
        </button>
      </div>
    ))
  ) : !loading && !error && marketData.length === 0 ? (
    <p>No price data available for {commodity}</p>
  ) : null}
</div>
{savedData.length > 0 && (
  <div className="saved-data">
    <h2>Saved Market Data</h2>

    {/* Filter Section */}
    <div className="filter-section">
      <label>
        Filter by Commodity:
        <select value={filterCommodity} onChange={(e) => setFilterCommodity(e.target.value)}>
          <option value="">All</option>
          {commodities.map((commodityItem) => (
            <option key={commodityItem} value={commodityItem}>
              {commodityItem}
            </option>
          ))}
        </select>
      </label>

      <label>
  Filter by State:
  <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
    <option value="">All</option>
    {Object.keys(statesAndDistricts).map((state) => (
      <option key={state} value={state}>
        {state}
      </option>
    ))}
  </select>
</label>

<label>
  Filter by District:
  <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
    <option value="">All</option>
    {statesAndDistricts[selectedState]?.map((district) => (
      <option key={district} value={district}>
        {district}
      </option>
    ))}
  </select>
</label>


      <label>
        Min Price:
        <input
          type="number"
          value={minPriceFilter}
          onChange={(e) => setMinPriceFilter(e.target.value)}
          placeholder="Min Price"
        />
      </label>

      <label>
        Max Price:
        <input
          type="number"
          value={maxPriceFilter}
          onChange={(e) => setMaxPriceFilter(e.target.value)}
          placeholder="Max Price"
        />
      </label>
    </div>

    {/* Display Filtered Market List */}
    <div className="market-list">
      {filteredData.map((item, index) => (
        <div className="market-item" key={index}>
          <h3>Commodity: {item.Commodity || "N/A"}</h3>
          {item.State && <p><strong>State:</strong> {item.State}</p>}
          {item.District && <p><strong>District:</strong> {item.District}</p>}
          {item.Market && <p><strong>Market:</strong> {item.Market}</p>}
          {item.Variety && <p><strong>Variety:</strong> {item.Variety}</p>}
          {item.Grade && <p><strong>Grade:</strong> {item.Grade}</p>}
          {item.Arrival_Date && <p><strong>Arrival Date:</strong> {item.Arrival_Date}</p>}
          {item.Min_Price && <p><strong>Min Price:</strong> ₹{item.Min_Price}</p>}
          {item.Max_Price && <p><strong>Max Price:</strong> ₹{item.Max_Price}</p>}
          {item.Modal_Price && <p><strong>Modal Price:</strong> ₹{item.Modal_Price}</p>}
          {/* Delete Button */}
          <button
            onClick={() => handleDeleteData(item.id)}
            className="delete-button"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  </div>
)}{popupMessage && (
  <div className="popup-overlay" onClick={closePopup}>
    <div className="popup">
      <p>{popupMessage}</p>
      {/* <button className="popup-close" onClick={closePopup}>
        Close
      </button> */}
    </div>
  </div>
)}




      </div>
    </div>
  );
};

export default Market;
