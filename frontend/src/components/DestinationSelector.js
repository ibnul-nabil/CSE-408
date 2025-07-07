import React, { useState, useEffect, useRef } from 'react';
import './DestinationSelector.css';

const API_URL = process.env.REACT_APP_URL;

const DestinationSelector = ({ 
  selectedDestinations = [], 
  customDestinations = [], 
  onDestinationsChange,
  placeholder = "Add destinations...",
  maxDestinations = 5,
  required = false,
  className = ''
}) => {
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setShowCustomInput(false);
        setSearchTerm('');
        setCustomInput('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/destinations`);
      if (response.ok) {
        const data = await response.json();
        setAvailableDestinations(data);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = availableDestinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedDestinations.some(selected => selected.id === dest.id)
  );

  const handleDestinationSelect = (destination) => {
    if (selectedDestinations.length >= maxDestinations) {
      alert(`Maximum ${maxDestinations} destinations allowed`);
      return;
    }

    const newSelections = [...selectedDestinations, destination];
    onDestinationsChange(newSelections, customDestinations);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleCustomDestinationAdd = () => {
    const trimmedInput = customInput.trim();
    if (!trimmedInput) return;

    if (customDestinations.length + selectedDestinations.length >= maxDestinations) {
      alert(`Maximum ${maxDestinations} destinations allowed`);
      return;
    }

    // Check if custom destination already exists
    if (customDestinations.some(custom => 
      custom.toLowerCase() === trimmedInput.toLowerCase()
    )) {
      alert('This destination is already added');
      return;
    }

    // Check if it matches an existing predefined destination
    if (availableDestinations.some(dest => 
      dest.name.toLowerCase() === trimmedInput.toLowerCase()
    )) {
      alert('This destination already exists in our database. Please select it from the dropdown.');
      return;
    }

    const newCustomDestinations = [...customDestinations, trimmedInput];
    onDestinationsChange(selectedDestinations, newCustomDestinations);
    setCustomInput('');
    setShowCustomInput(false);
    setIsDropdownOpen(false);
  };

  const removeDestination = (destinationId) => {
    const newSelections = selectedDestinations.filter(dest => dest.id !== destinationId);
    onDestinationsChange(newSelections, customDestinations);
  };

  const removeCustomDestination = (customDestination) => {
    const newCustomDestinations = customDestinations.filter(dest => dest !== customDestination);
    onDestinationsChange(selectedDestinations, newCustomDestinations);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showCustomInput) {
        handleCustomDestinationAdd();
      } else if (filteredDestinations.length > 0) {
        handleDestinationSelect(filteredDestinations[0]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setShowCustomInput(false);
      setSearchTerm('');
      setCustomInput('');
    }
  };

  const handleCustomInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomDestinationAdd();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomInput('');
    }
  };

  const totalDestinations = selectedDestinations.length + customDestinations.length;

  return (
    <div className={`destination-selector ${className}`} ref={dropdownRef}>
      <div className="destination-input-container">
        <div className="selected-destinations">
          {selectedDestinations.map(destination => (
            <div key={destination.id} className="destination-tag">
              <span>📍 {destination.name}</span>
              <button
                type="button"
                onClick={() => removeDestination(destination.id)}
                className="remove-destination"
              >
                ×
              </button>
            </div>
          ))}
          
          {customDestinations.map(customDest => (
            <div key={customDest} className="destination-tag custom">
              <span>📍 {customDest}</span>
              <button
                type="button"
                onClick={() => removeCustomDestination(customDest)}
                className="remove-destination"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {totalDestinations < maxDestinations && (
          <input
            ref={inputRef}
            type="text"
            value={showCustomInput ? customInput : searchTerm}
            onChange={(e) => {
              if (showCustomInput) {
                setCustomInput(e.target.value);
              } else {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }
            }}
            onFocus={() => {
              if (!showCustomInput) {
                setIsDropdownOpen(true);
              }
            }}
            onKeyDown={showCustomInput ? handleCustomInputKeyDown : handleInputKeyDown}
            placeholder={totalDestinations === 0 ? placeholder : "Add more..."}
            className="destination-input"
          />
        )}
      </div>

      {required && totalDestinations === 0 && (
        <div className="destination-error">
          At least one destination is required
        </div>
      )}

      <div className="destination-counter">
        {totalDestinations}/{maxDestinations} destinations
      </div>

      {isDropdownOpen && !showCustomInput && (
        <div className="destination-dropdown">
          {loading ? (
            <div className="dropdown-loading">Loading destinations...</div>
          ) : (
            <>
              {filteredDestinations.length > 0 ? (
                <div className="dropdown-section">
                  <div className="dropdown-header">Available Destinations</div>
                  {filteredDestinations.slice(0, 10).map(destination => (
                    <div
                      key={destination.id}
                      className="dropdown-item"
                      onClick={() => handleDestinationSelect(destination)}
                    >
                      <span className="destination-icon">📍</span>
                      <span className="destination-name">{destination.name}</span>
                      {destination.country && (
                        <span className="destination-country">{destination.country}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : searchTerm && (
                <div className="dropdown-section">
                  <div className="no-results">No destinations found for "{searchTerm}"</div>
                </div>
              )}

              <div className="dropdown-section">
                <button
                  type="button"
                  className="add-custom-button"
                  onClick={() => {
                    setShowCustomInput(true);
                    setIsDropdownOpen(false);
                    setCustomInput(searchTerm);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                >
                  + Add "{searchTerm || 'custom destination'}"
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DestinationSelector; 