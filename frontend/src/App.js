import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Modal from "react-modal";
import Swal from "sweetalert2";
import "./App.css";
import axios from "axios";
import PincodeSearch from "./Pincode";
import MerchantAddition from "./addmerchant";
function Dashboard() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    // Create form data
    const formData = new FormData();
    formData.append("file", selectedFile);

    // Send POST request to backend API
    axios.post("http://localhost:5000/upload", formData)
      .then(response => {
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "File uploaded successfully!",
          });
          setSelectedFile(null);
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Failed to upload file!",
          });
        }
        setModalIsOpen(false);
      })
      .catch(error => {
        console.error("Error uploading file:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to upload file!",
        });
        setModalIsOpen(false);
      });
  };

  return (
    <div className="dashboard">
       <h1>Welcome to Dashboard</h1>
      <div className="actions">
        {/* <p className="instruction">Instructions:</p>
        <ul className="instruction-list">
          <li>1. Upload the pincode and merchants CSV file</li>
          <li>2.Search pincode to check serviceability</li>
        </ul> */}
        <button className="upload-button" onClick={() => setModalIsOpen(true)}>
          Upload Data
        </button>
        <Link to="/pincode" className="search-button">
          Search Pincode
        </Link>

      </div>
      <div className="actions">
      <Link to="/addmerchant" className="search-button">
          Add Merchant
        </Link>
        </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="custom-modal"
      >
        <h2>Choose File</h2>
        <label htmlFor="file-upload" className="file-upload-label" style={{marginRight:"1rem"}}>
          <input id="file-upload" type="file" onChange={handleFileChange} />
          <span className="file-upload-button">Choose File</span>
        </label>
        {selectedFile && <p>Selected File: {selectedFile.name}</p>}
        <button onClick={handleSubmit} className="submit-button">
          Submit
        </button>
      </Modal>
    </div>
  );
}


function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/pincode" element={<PincodeSearch />} />
          <Route path="/addmerchant" element={<MerchantAddition />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
