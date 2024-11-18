import { useState, useRef, useEffect } from "react";
import React from 'react';
import { faArrowLeft, faArrowRight, faSearch, faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../assets/static/css/tmp1.css';
import { useNavigate } from "react-router-dom";

const Tmp1 = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const searchContainerRef = useRef(null); // Reference for the search container
    const navigate = useNavigate();

    const customers = [
      "ABB",
      "Mr. Abbas (ADDC) Hassan Mansoor",
      "Acme Corp",
      "Alpine Tech Solutions",
      "Aqua Dynamics",
      "Alpha Industries",
      "Advanced Solutions Ltd.",
    ];

    const handleSearchInput = (event) => {
      const query = event.target.value.toLowerCase();
      setSearchQuery(query);
      const filteredSuggestions = customers.filter((customer) =>
        customer.toLowerCase().includes(query)
      );
      setSuggestions(filteredSuggestions);
    };

    const selectSuggestion = (suggestion) => {
      setSearchQuery(suggestion);
      setSuggestions([]);
    };

    // Effect to handle clicks outside the search container
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
          setSuggestions([]); // Hide suggestions when clicking outside
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleHome = async (e) => {
        e.preventDefault();
        navigate('/menu')
    }

    return (
      <div className="tmp1-container container" style={{ marginTop: "50px" }}>
        <div className="header">
          <h2>Select Customer</h2>
          <h2>Sales Quotation</h2>
        </div>

        <div className="search-container position-relative mb-4" ref={searchContainerRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            className="form-control"
            placeholder="Search customer..."
          />
          <FontAwesomeIcon 
            icon={faSearch} 
            className="search-icon position-absolute" 
            style={{ right: "15px", top: "50%", transform: "translateY(-50%)", fontSize: "20px", color: "#007bff" }} 
          />

          {suggestions.length > 0 && (
            <div className="autocomplete-suggestions position-absolute border rounded bg-white" style={{ top: "100%", width: "100%", zIndex: 10 }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="autocomplete-suggestion p-2"
                  onClick={() => selectSuggestion(suggestion)}
                  style={{ cursor: "pointer" }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="table-container position-relative">
          <div className="background-logo position-absolute" style={{ opacity: 0.1, width: "100%", height: "100%", backgroundImage: "url('background-logo.png')", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}></div>
          <table className="table table-striped table-bordered">
            <thead className="thead-light">
              <tr>
                <th scope="col">CardCode</th>
                <th scope="col">CardName</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A043</td>
                <td>ABB</td>
              </tr>
              <tr>
                <td>A046</td>
                <td>Mr. Abbas (ADDC) Hassan Mansoor</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button onClick={handleHome}
        className="next-button"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '60px',  // Make the button a square
          height: '60px', // Equal width and height for round shape
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%', // Make the button round
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', // Center the icon
          fontSize: '24px', // Increase the icon size
        }}
      >
        <FontAwesomeIcon icon={faHome} />
      </button>
      </div>
    );
};

export default Tmp1;
