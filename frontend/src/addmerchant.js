import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Merchant.css";

function MerchantAddition() {
  const [merchantName, setMerchantName] = useState("");
  const [pincodeList, setPincodeList] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = () => {
    setLoading(true);
    const data = {
      merchantName: merchantName,
      pincodeList: pincodeList.split(",").map(pincode => pincode.trim())
    };

    axios
      .post("http://localhost:5000/add-merchant", data)
      .then((response) => {
        if (response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Merchant added successfully to pin codes!",
          });
          setMerchantName("");
          setPincodeList("");
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Failed to add merchant!",
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error adding merchant:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to add merchant!",
        });
        setLoading(false);
      });
  };

  return (
    <div className="merchant-addition-container">
      <h2>Add Merchant</h2>
      <div className="form-container">
        <div className="input-container">
          <label htmlFor="merchant-name">Merchant Name</label>
          <input
            type="text"
            id="merchant-name"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="pincode-list">Pincode List (comma-separated)</label>
          <textarea
            id="pincode-list"
            rows="5"
            value={pincodeList}
            onChange={(e) => setPincodeList(e.target.value)}
          />
        </div>
        <button className="submit-button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default MerchantAddition;
