import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { Truck, ArrowLeft, Filter, Search, Calendar, X } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import './SelectTransportPage.css';

const API_URL = process.env.REACT_APP_URL;

const SelectTransportPage = ({ isEditMode = false, onPrevious, onNext }) => {
  const navigate = useNavigate();
  const { tourData, setTransportation } = useTour();
  const [transports, setTransports] = useState([]);
  const [selectedTransports, setSelectedTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedType, setSelectedType] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Manual route filter
  const [fromDestination, setFromDestination] = useState('');
  const [toDestination, setToDestination] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [isManualRouteActive, setIsManualRouteActive] = useState(false);

  // Get destinations from tour data (only destinations, not sub-places)
  const getTourDestinations = () => {
    if (!tourData.places || tourData.places.length === 0) {
      return [
        { id: 1, name: "Cox's Bazar" },
        { id: 2, name: "Sylhet" },
        { id: 3, name: "Sreemangal" },
        { id: 4, name: "Sunamganj" },
        { id: 5, name: "Bandarban" },
        { id: 6, name: "Khagrachari" },
        { id: 7, name: "Chattogram" },
        { id: 8, name: "Sundarbans" },
        { id: 9, name: "Rangamati" },
        { id: 10, name: "Dhaka" }
      ];
    }
    
    // Extract only destinations from tour data
    return tourData.places.map(place => ({
      id: place.destination.id,
      name: place.destination.name
    }));
  };

  const destinations = getTourDestinations();

  // Format date to readable format (July 7th, 2025)
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/transport`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transports');
      }

      const data = await response.json();
      setTransports(data);
    } catch (error) {
      console.error('Error fetching transports:', error);
      setError('Failed to load transport options');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransport = (transport) => {
    const isSelected = selectedTransports.some(t => t.transportId === transport.id);
    
    if (isSelected) {
      setSelectedTransports(selectedTransports.filter(t => t.transportId !== transport.id));
    } else {
      const newTransport = {
        transportId: transport.id,
        transportName: transport.name,
        transportType: transport.type,
        transportClass: transport.class,
        fromDestination: transport.startPlaceName,
        toDestination: transport.endPlaceName,
        costPerPerson: calculateCostPerPerson(transport),
        passengerCount: passengerCount,
        totalCost: calculateCostPerPerson(transport) * passengerCount,
        travelDate: ''
      };
      setSelectedTransports([...selectedTransports, newTransport]);
    }
  };

  const calculateCostPerPerson = (transport) => {
    // Calculate cost based on selected route
    if (isManualRouteActive && fromDestination && toDestination) {
      // Find the transport stops for this transport
      const fromStop = transport.stops?.find(stop => stop.destinationId === parseInt(fromDestination));
      const toStop = transport.stops?.find(stop => stop.destinationId === parseInt(toDestination));
      
      if (fromStop && toStop) {
        return Math.abs(toStop.cumulativePrice - fromStop.cumulativePrice);
      }
    }
    
    // Default cost calculation
    return transport.stops?.[transport.stops.length - 1]?.cumulativePrice || 0;
  };

  const handleManualRouteFilter = () => {
    if (fromDestination && toDestination && passengerCount > 0) {
      // Check if from and to destinations are the same
      if (fromDestination === toDestination) {
        alert('From and To destinations cannot be the same. Please select different destinations.');
        return;
      }
      setIsManualRouteActive(true);
    }
  };

  const clearManualRouteFilter = () => {
    setFromDestination('');
    setToDestination('');
    setPassengerCount(1);
    setIsManualRouteActive(false);
  };

  // Handle destination selection changes
  const handleFromDestinationChange = (value) => {
    setFromDestination(value);
    // Clear manual route if from destination is same as to destination
    if (value === toDestination && value !== '') {
      alert('From and To destinations cannot be the same. Please select different destinations.');
      setFromDestination('');
      return;
    }
    if (isManualRouteActive) {
      setIsManualRouteActive(false);
    }
  };

  const handleToDestinationChange = (value) => {
    setToDestination(value);
    // Clear manual route if to destination is same as from destination
    if (value === fromDestination && value !== '') {
      alert('From and To destinations cannot be the same. Please select different destinations.');
      setToDestination('');
      return;
    }
    if (isManualRouteActive) {
      setIsManualRouteActive(false);
    }
  };

  const handleDateChange = (transportId, date) => {
    setSelectedTransports(prev => 
      prev.map(transport => 
        transport.transportId === transportId 
          ? { ...transport, travelDate: date }
          : transport
      )
    );
  };

  const handleRemoveTransport = (transportId) => {
    setSelectedTransports(prev => prev.filter(transport => transport.transportId !== transportId));
  };

  const handleNext = () => {
    // Check if no transports are selected and show confirmation popup
    if (selectedTransports.length === 0) {
      const confirmed = window.confirm(
        'You haven\'t selected any transportation for this tour. Are you sure you want to continue without transportation?'
      );
      if (!confirmed) {
        return; // User cancelled, stay on current page
      }
    } else {
      // Check if all selected transports have travel dates - STRICT VALIDATION
      const transportsWithoutDates = selectedTransports.filter(transport => !transport.travelDate);
      if (transportsWithoutDates.length > 0) {
        alert(
          `Please set travel dates for all selected transports:\n\n${transportsWithoutDates.map(t => `• ${t.transportName}`).join('\n')}\n\nYou cannot proceed without setting travel dates.`
        );
        return; // Prevent proceeding - user must set dates
      }
    }
    
    // Save transportation to context (can be empty array)
    console.log('💾 Saving transportation to context:', selectedTransports);
    setTransportation(selectedTransports);
    
    if (isEditMode && onNext) {
      onNext();
    } else {
      navigate('/confirm-tour');
    }
  };

  const handlePrevious = () => {
    if (isEditMode && onPrevious) {
      onPrevious();
    } else {
      navigate('/finalize-route');
    }
  };

  const filteredTransports = transports.filter(transport => {
    // Type filter
    if (selectedType !== 'all' && transport.type !== selectedType) return false;
    
    // Class filter
    if (selectedClass !== 'all' && transport.class !== selectedClass) return false;
    
    // Search filter
    if (searchTerm && !transport.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Manual route filter
    if (isManualRouteActive && fromDestination && toDestination) {
      const hasFromStop = transport.stops?.some(stop => stop.destinationId === parseInt(fromDestination));
      const hasToStop = transport.stops?.some(stop => stop.destinationId === parseInt(toDestination));
      return hasFromStop && hasToStop;
    }
    
    return true;
  });

  const renderTransportCard = (transport) => {
    const isSelected = selectedTransports.some(t => t.transportId === transport.id);
    const costPerPerson = calculateCostPerPerson(transport);
    
    return (
      <div key={transport.id} className="transport-card">
        <div className="transport-header">
          <div className="transport-icon">
            {transport.type === 'bus' && '🚌'}
            {transport.type === 'train' && '🚂'}
            {transport.type === 'flight' && '✈️'}
          </div>
          <div className="transport-info">
            <h3 className="transport-name">{transport.name}</h3>
            <p className="transport-route">
              {transport.startPlaceName} → {transport.endPlaceName}
            </p>
            <div className="transport-details">
              <span className="transport-type">{transport.type.toUpperCase()}</span>
              <span className="transport-class">{transport.class}</span>
            </div>
          </div>
          <div className="transport-cost">
            <span className="cost-label">Per Person:</span>
            <span className="cost-amount">৳{costPerPerson}</span>
          </div>
        </div>
        
        <div className="transport-description">
          <p>{transport.description}</p>
        </div>
        
        <div className="transport-actions">
          <button
            className={`select-transport-btn ${isSelected ? 'selected' : ''}`}
            onClick={() => handleSelectTransport(transport)}
          >
            {isSelected ? 'Selected' : 'Select Transport'}
          </button>
        </div>
      </div>
    );
  };

  const renderSelectedTransports = () => {
    if (selectedTransports.length === 0) return null;

    return (
      <div className="selected-transportation-section">
        <h3>Selected Transportation</h3>
        <div className="selected-transports-list">
          {selectedTransports.map((transport) => (
            <div key={transport.transportId} className="selected-transport">
              <div className="selected-transport-header">
                <div className="selected-transport-info">
                  <h4 className="selected-transport-name">{transport.transportName}</h4>
                  <div className="selected-transport-route">
                    {transport.fromDestination} → {transport.toDestination}
                  </div>
                  <div className="selected-transport-costs">
                    <div className="cost-item">
                      <span className="cost-label">Cost per person:</span>
                      <span className="cost-value">৳{transport.costPerPerson}</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">Total cost:</span>
                      <span className="cost-value total">৳{transport.totalCost}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="selected-transport-actions">
                <div className="selected-transport-date">
                  <label>Travel Date:</label>
                  <div 
                    className={`date-input-container ${!transport.travelDate ? 'empty-date' : ''}`}
                    onClick={() => {
                      const input = document.querySelector(`input[data-transport-id="${transport.transportId}"]`);
                      if (input) {
                        input.showPicker ? input.showPicker() : input.click();
                      }
                    }}
                  >
                    <Calendar className="date-icon" />
                    <input
                      type="date"
                      value={transport.travelDate}
                      onChange={(e) => handleDateChange(transport.transportId, e.target.value)}
                      min={tourData.startDate}
                      max={tourData.endDate}
                      className="date-input"
                      data-transport-id={transport.transportId}
                    />
                    <div className="date-display">
                      {transport.travelDate ? formatDateDisplay(transport.travelDate) : "Pick travel date"}
                    </div>
                  </div>
                  {!transport.travelDate && (
                    <small className="date-hint error">⚠️ Travel date is required</small>
                  )}
                </div>
                
                <button
                  className="remove-transport-btn"
                  onClick={() => handleRemoveTransport(transport.transportId)}
                >
                  <X size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="transport-page-container">
        <div className="loading">Loading transport options...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transport-page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="transport-page-container">
      <div className="transport-page-wrapper">
        <div className="transport-page-header">
          <h1 className="transport-page-title">{isEditMode ? 'Edit Transport' : 'Select Transportation'}</h1>
          <p className="transport-page-subtitle">Choose your transportation options between destinations</p>
        </div>
        
        <StepIndicator currentStep={5} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Truck className="title-icon" />
              Available Transportation
            </h2>
            <p className="card-description">
              Select transportation options for your journey
            </p>
          </div>
          
          <div className="card-content">
            {/* Filters */}
            <div className="filters-section">
              <div className="filters-layout">
                <div className="filter-left">
                  <div className="manual-route-filter">
                    <h4>Manual Route Filter</h4>
                    <div className="filter-inputs">
                      <select
                        value={fromDestination}
                        onChange={(e) => handleFromDestinationChange(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">From Destination</option>
                        {destinations.map(dest => (
                          <option 
                            key={dest.id} 
                            value={dest.id}
                            disabled={dest.id.toString() === toDestination}
                          >
                            {dest.name} {dest.id.toString() === toDestination ? '(Same as To)' : ''}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={toDestination}
                        onChange={(e) => handleToDestinationChange(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">To Destination</option>
                        {destinations.map(dest => (
                          <option 
                            key={dest.id} 
                            value={dest.id}
                            disabled={dest.id.toString() === fromDestination}
                          >
                            {dest.name} {dest.id.toString() === fromDestination ? '(Same as From)' : ''}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        value={passengerCount}
                        onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                        min="1"
                        placeholder="Passengers"
                        className="filter-input"
                      />
                      
                      <button
                        onClick={handleManualRouteFilter}
                        className="filter-btn"
                        disabled={!fromDestination || !toDestination}
                      >
                        Apply Filter
                      </button>
                      
                      {isManualRouteActive && (
                        <button
                          onClick={clearManualRouteFilter}
                          className="filter-btn clear"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    {isManualRouteActive && (
                      <div className="active-route">
                        Route: {destinations.find(d => d.id === parseInt(fromDestination))?.name} → {destinations.find(d => d.id === parseInt(toDestination))?.name} ({passengerCount} passengers)
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="filter-right">
                  <div className="search-filter">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search transports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  
                  <div className="filter-options">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Types</option>
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                      <option value="flight">Flight</option>
                    </select>
                    
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Classes</option>
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Transport Cards */}
            <div className="transports-grid">
              {filteredTransports.length > 0 ? (
                filteredTransports.map(renderTransportCard)
              ) : (
                <div className="no-transports">
                  <p>No transport options found for the selected criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Selected Transports Summary */}
        {renderSelectedTransports()}
        
        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            className="btn btn-outline"
            onClick={handlePrevious}
          >
            <ArrowLeft className="btn-icon" />
            <span>Previous</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
          >
            <span>Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectTransportPage; 