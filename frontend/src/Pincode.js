import React, { useState } from "react";
import axios from "axios";
import "./PincodeSearch.css"; // Import CSS file for styling

function PincodeSearch() {
  const [pincode, setPincode] = useState("");
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/merchant/${pincode}`)
      .then((response) => {
        setMerchants(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching merchants:", error);
        setLoading(false);
      });
  };

  return (
    <div className="pincode-search-container">
      <h2>Pincode Search Page</h2>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      <div className="merchants-list">
        <h3>Merchants</h3>
        <div className="scrollable-list">
          {merchants.length > 0 ? (
            <ul>
              {merchants.map((merchant, index) => (
                <li key={index}>{merchant}</li>
              ))}
            </ul>
          ) : (
            <p>No merchants found for this pincode</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PincodeSearch;
