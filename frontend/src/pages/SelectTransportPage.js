import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '../context/TourContext';
import { useAuth } from '../context/AuthContext';
import StepIndicator from '../components/StepIndicator';
import { ArrowLeft, ArrowRight, Bus, Train, Plane, Ship, Filter, Calendar, MapPin, DollarSign } from 'lucide-react';
import './SelectTransportPage.css';

const SelectTransportPage = () => {
  const navigate = useNavigate();
  const { tourData, setTransportation } = useTour();
  const { user } = useAuth();
  
  const [transports, setTransports] = useState([]);
  const [transportStops, setTransportStops] = useState([]);
  const [selectedTransports, setSelectedTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [manualStartPoint, setManualStartPoint] = useState('');
  const [manualEndPoint, setManualEndPoint] = useState('');
  const [showManualFilter, setShowManualFilter] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  
  // Available filter options
  const transportTypes = ['bus', 'train', 'flight', 'boat'];
  const transportClasses = ['economy', 'business'];
  
  // Available destinations for manual filtering
  const destinations = [
    { id: 1, name: "Cox's Bazar" },
    { id: 2, name: "Sylhet" },
    { id: 3, name: "Sreemangal" },
    { id: 4, name: "Sunamganj" },
    { id: 5, name: "Bandarban" },
    { id: 6, name: "Khagrachari" },
    { id: 7, name: "Chattogram" },
    { id: 8, name: "Sundarbans" },
    { id: 9, name: "Rangamati" }
  ];
  
  useEffect(() => {
    fetchTransports();
    fetchTransportStops();
  }, []);
  
  useEffect(() => {
    // Generate route combinations from tour places
    if (tourData.places && tourData.places.length > 1) {
      const routes = [];
      for (let i = 0; i < tourData.places.length - 1; i++) {
        const currentPlace = tourData.places[i];
        const nextPlace = tourData.places[i + 1];
        routes.push({
          startPointId: currentPlace.destination.id,
          endPointId: nextPlace.destination.id,
          startPointName: currentPlace.destination.name,
          endPointName: nextPlace.destination.name
        });
      }
      setSelectedRoutes(routes);
    }
  }, [tourData.places]);
  
  const fetchTransports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/transport');
      if (!response.ok) {
        throw new Error('Failed to fetch transports');
      }
      const data = await response.json();
      setTransports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTransportStops = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/transport/stops');
      if (!response.ok) {
        throw new Error('Failed to fetch transport stops');
      }
      const data = await response.json();
      setTransportStops(data);
    } catch (err) {
      console.error('Error fetching transport stops:', err);
    }
  };
  
  const getTransportIcon = (type) => {
    switch (type) {
      case 'bus': return <Bus size={20} />;
      case 'train': return <Train size={20} />;
      case 'flight': return <Plane size={20} />;
      case 'boat': return <Ship size={20} />;
      default: return <Bus size={20} />;
    }
  };
  
  const getTransportTypeColor = (type) => {
    switch (type) {
      case 'bus': return '#4CAF50';
      case 'train': return '#2196F3';
      case 'flight': return '#FF9800';
      case 'boat': return '#9C27B0';
      default: return '#757575';
    }
  };
  
  const handleTransportSelect = (transport) => {
    const isSelected = selectedTransports.some(t => t.id === transport.id);
    
    if (isSelected) {
      setSelectedTransports(selectedTransports.filter(t => t.id !== transport.id));
    } else {
      // Calculate cost based on selected route and passenger count
      let calculatedCost = 0;
      if (selectedRoutes.length > 0) {
        const route = selectedRoutes[0];
        calculatedCost = calculateTransportCost(transport.id, route.startPointId, route.endPointId);
      }
      
      // Add transport with default date
      const transportWithDate = {
        ...transport,
        date: tourData.startDate || new Date().toISOString().split('T')[0],
        cost: calculatedCost
      };
      setSelectedTransports([...selectedTransports, transportWithDate]);
    }
  };
  
  const handleTransportDateChange = (transportId, date) => {
    setSelectedTransports(prev => 
      prev.map(transport => 
        transport.id === transportId 
          ? { ...transport, date } 
          : transport
      )
    );
  };
  

  
  const handleTypeFilter = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const handleClassFilter = (transportClass) => {
    setSelectedClasses(prev => 
      prev.includes(transportClass) 
        ? prev.filter(c => c !== transportClass)
        : [...prev, transportClass]
    );
  };
  
  const handleManualRouteFilter = () => {
    if (manualStartPoint && manualEndPoint) {
      const startDest = destinations.find(d => d.id === parseInt(manualStartPoint));
      const endDest = destinations.find(d => d.id === parseInt(manualEndPoint));
      
      if (startDest && endDest) {
        setSelectedRoutes([{
          startPointId: parseInt(manualStartPoint),
          endPointId: parseInt(manualEndPoint),
          startPointName: startDest.name,
          endPointName: endDest.name
        }]);
        setShowManualFilter(false);
      }
    }
  };
  
  const clearManualFilter = () => {
    setManualStartPoint('');
    setManualEndPoint('');
    setSelectedRoutes([]);
    setShowManualFilter(false);
  };
  
  const calculateTransportCost = (transportId, startPointId, endPointId) => {
    // Find the stops for this transport
    const transportStopsForRoute = transportStops.filter(stop => stop.transportId === transportId);
    
    // Find prices for start and end points
    const startStop = transportStopsForRoute.find(stop => stop.stopId === startPointId);
    const endStop = transportStopsForRoute.find(stop => stop.stopId === endPointId);
    
    if (startStop && endStop) {
      // Calculate absolute difference and multiply by passenger count
      const priceDifference = Math.abs(endStop.price - startStop.price);
      return priceDifference * passengerCount;
    }
    
    return 0;
  };
  
  const calculatePerPersonCost = (transportId, startPointId, endPointId) => {
    // Find the stops for this transport
    const transportStopsForRoute = transportStops.filter(stop => stop.transportId === transportId);
    
    // Find prices for start and end points
    const startStop = transportStopsForRoute.find(stop => stop.stopId === startPointId);
    const endStop = transportStopsForRoute.find(stop => stop.stopId === endPointId);
    
    if (startStop && endStop) {
      // Calculate absolute difference (per person cost)
      const priceDifference = Math.abs(endStop.price - startStop.price);
      return priceDifference;
    }
    
    return 0;
  };
  
  const filteredTransports = transports.filter(transport => {
    // Filter by type
    if (selectedTypes.length > 0 && !selectedTypes.includes(transport.type)) {
      return false;
    }
    
    // Filter by class
    if (selectedClasses.length > 0 && !selectedClasses.includes(transport.transportClass)) {
      return false;
    }
    
    // Filter by route (if routes are selected)
    if (selectedRoutes.length > 0) {
      const matchesRoute = selectedRoutes.some(route => {
        // Get stops for this transport
        const transportStopsForRoute = transportStops.filter(stop => stop.transportId === transport.id);
        
        // Check if transport has stoppages at both start and end points
        const hasStartStop = transportStopsForRoute.some(stop => stop.stopId === route.startPointId);
        const hasEndStop = transportStopsForRoute.some(stop => stop.stopId === route.endPointId);
        
        return hasStartStop && hasEndStop;
      });
      
      if (!matchesRoute) {
        return false;
      }
    }
    
    return true;
  });
  
  const handlePrevious = () => {
    navigate('/finalize-route');
  };
  
  const handleNext = () => {
    setTransportation(selectedTransports);
    navigate('/confirm-tour');
  };
  
  const calculateTotalCost = () => {
    return selectedTransports.reduce((total, transport) => total + (transport.cost || 0), 0);
  };
  
  if (loading) {
    return (
      <div className="select-transport-page">
        <div className="loading">Loading transports...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="select-transport-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }
  
  return (
    <div className="select-transport-page">
      <div className="container">
        <div className="header">
          <h1>Select Transportation</h1>
          <p>Choose your preferred transportation options for each leg of your journey</p>
        </div>
        
        <StepIndicator currentStep={5} />
        
        <div className="transport-page-content">
          {/* Tour Summary */}
          <div className="tour-summary">
            <h3>Tour Summary</h3>
            <div className="summary-content">
              <div className="summary-item">
                <strong>Title:</strong> {tourData.title}
              </div>
              <div className="summary-item">
                <strong>Duration:</strong> {tourData.startDate} to {tourData.endDate}
              </div>
              <div className="summary-item">
                <strong>Places:</strong> {tourData.places?.length || 0} destinations
              </div>
              <div className="summary-item">
                <strong>Hotels:</strong> {tourData.accommodations?.length || 0} selected
              </div>
            </div>
          </div>
        
        {/* Filters */}
        <div className="filters-section card">
          <div className="card-header">
            <h2 className="card-title">
              <Filter className="title-icon" />
              Filter Transportation
            </h2>
          </div>
          <div className="card-content">
            <div className="filters-layout">
              {/* Left side - Manual Route Filter */}
              <div className="filter-left">
                <div className="input-group">
                  <label>From:</label>
                  <select 
                    value={manualStartPoint} 
                    onChange={(e) => setManualStartPoint(e.target.value)}
                    className="input"
                  >
                    <option value="">Select start point</option>
                    {destinations.map(dest => (
                      <option key={dest.id} value={dest.id}>{dest.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label>To:</label>
                  <select 
                    value={manualEndPoint} 
                    onChange={(e) => setManualEndPoint(e.target.value)}
                    className="input"
                  >
                    <option value="">Select end point</option>
                    {destinations.map(dest => (
                      <option key={dest.id} value={dest.id}>{dest.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Passengers:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                    className="input"
                  />
                </div>
                
                <div className="route-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleManualRouteFilter}
                    disabled={!manualStartPoint || !manualEndPoint}
                  >
                    Apply Route Filter
                  </button>
                  
                  {(manualStartPoint || manualEndPoint) && (
                    <button 
                      className="btn btn-outline"
                      onClick={clearManualFilter}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                
                {selectedRoutes.length > 0 && (
                  <div className="active-route">
                    <strong>Active Route:</strong> {selectedRoutes[0].startPointName} → {selectedRoutes[0].endPointName}
                  </div>
                )}
              </div>
              
              {/* Right side - Type and Class filters */}
              <div className="filter-right">
                <div className="filter-group">
                  <div className="filter-options">
                    {transportTypes.map(type => (
                      <label key={type} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeFilter(type)}
                        />
                        <span className="filter-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="filter-group">
                  <div className="filter-options">
                    {transportClasses.map(transportClass => (
                      <label key={transportClass} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(transportClass)}
                          onChange={() => handleClassFilter(transportClass)}
                        />
                        <span className="filter-label">{transportClass.charAt(0).toUpperCase() + transportClass.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Available Transports */}
        <div className="transports-section card">
          <div className="card-header">
            <h2 className="card-title">
              <Bus className="title-icon" />
              Available Transportation
            </h2>
          </div>
          <div className="card-content">
          <div className="transports-grid">
            {filteredTransports.map(transport => {
              const isSelected = selectedTransports.some(t => t.id === transport.id);
              const selectedTransport = selectedTransports.find(t => t.id === transport.id);
              
              return (
                <div key={transport.id} className={`transport-card ${isSelected ? 'selected' : ''}`}>
                  <div className="transport-info">
                    <div className="transport-header">
                      <h4 className="transport-name">{transport.name}</h4>
                      <button
                        className={`add-transport-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleTransportSelect(transport)}
                      >
                        {isSelected ? '✓' : '+'}
                      </button>
                    </div>
                    
                    <div className="transport-location">
                      <MapPin size={16} />
                      <span>{transport.startPointName} → {transport.endPointName}</span>
                    </div>
                    
                    <div className="transport-details">
                      <div className="transport-price">
                        <DollarSign size={16} />
                        <span>
                          {selectedRoutes.length > 0 
                            ? `৳${calculatePerPersonCost(transport.id, selectedRoutes[0].startPointId, selectedRoutes[0].endPointId)} per person`
                            : `${transport.type.charAt(0).toUpperCase() + transport.type.slice(1)} • ${transport.transportClass.charAt(0).toUpperCase() + transport.transportClass.slice(1)}`
                          }
                        </span>
                      </div>
                      
                      <div className="transport-amenities">
                        <span className="amenity-tag">
                          {getTransportIcon(transport.type)}
                          {transport.type.charAt(0).toUpperCase() + transport.type.slice(1)}
                        </span>
                        <span className="amenity-tag">
                          {transport.transportClass.charAt(0).toUpperCase() + transport.transportClass.slice(1)}
                        </span>
                        <span className="amenity-tag">
                          Departure: {transport.departStart} - {transport.departEnd}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
        </div>
        
        {/* Selected Transports Summary */}
        {selectedTransports.length > 0 && (
          <div className="selected-summary card">
            <div className="card-header">
              <h2 className="card-title">
                <Calendar className="title-icon" />
                Selected Transportation ({selectedTransports.length})
              </h2>
            </div>
            <div className="card-content">
            <div className="selected-transports">
              {selectedTransports.map(transport => (
                <div key={transport.id} className="selected-transport">
                  <div className="selected-transport-info">
                    <h4>{transport.name}</h4>
                    <p>{transport.startPointName} → {transport.endPointName}</p>
                    <div className="date-input-group">
                      <label>Travel Date:</label>
                      <input
                        type="date"
                        value={transport.date || ''}
                        onChange={(e) => handleTransportDateChange(transport.id, e.target.value)}
                        min={tourData.startDate}
                        max={tourData.endDate}
                        className="transport-date-input"
                      />
                    </div>
                    <p className="transport-cost-info">
                      Cost: ৳{transport.cost} ({passengerCount} passenger{passengerCount > 1 ? 's' : ''})
                    </p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleTransportSelect(transport)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="total-cost">
              <strong>Total Transportation Cost: ৳{calculateTotalCost()}</strong>
            </div>
          </div>
        </div>
        )}
        
        {/* Navigation */}
        <div className="navigation">
          <button className="btn btn-secondary" onClick={handlePrevious}>
            <ArrowLeft size={20} />
            Previous
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={selectedTransports.length === 0}
          >
            Next
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectTransportPage; 