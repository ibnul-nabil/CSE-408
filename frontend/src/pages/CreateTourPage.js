import React, { useState, useEffect } from 'react';
import './CreateTourPage.css';
import { useNavigate } from 'react-router-dom';
import { MapIcon, Plus, X, Search } from 'lucide-react';
import { useTour } from '../context/TourContext';
import BlogSuggestions from '../components/BlogSuggestions';
import StepIndicator from '../components/StepIndicator';

const API_URL = process.env.REACT_APP_URL;

const CreateTourPage = () => {
  const navigate = useNavigate();
  const { tourData, setPlaces } = useTour();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subplaceLoading, setSubplaceLoading] = useState({});
  const [subplaceResults, setSubplaceResults] = useState({});
  const [showSubplaces, setShowSubplaces] = useState({});

  // Initialize with existing tour data
  useEffect(() => {
    if (tourData.places && tourData.places.length > 0) {
      setSelectedDestinations(tourData.places);
    }
  }, [tourData.places]);

  // Update context whenever selectedDestinations changes
  useEffect(() => {
    setPlaces(selectedDestinations);
  }, [selectedDestinations, setPlaces]);

  // Search for destinations
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);
    setError(null);
    if (query.length >= 3) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/destinations?search=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch destinations');
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        setError(err.message);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Add destination to tour
  const handleAddDestination = (destination) => {
    if (!selectedDestinations.some(d => d.destination.id === destination.id)) {
      setSelectedDestinations([...selectedDestinations, { destination, subplaces: [] }]);
    }
  };

  // Remove destination from tour
  const handleRemoveDestination = (destinationId) => {
    setSelectedDestinations(selectedDestinations.filter(d => d.destination.id !== destinationId));
  };

  // Show subplaces for a destination
  const handleShowSubplaces = async (destinationId) => {
    setShowSubplaces({ ...showSubplaces, [destinationId]: !showSubplaces[destinationId] });
    if (!subplaceResults[destinationId]) {
      setSubplaceLoading({ ...subplaceLoading, [destinationId]: true });
      try {
        const response = await fetch(`${API_URL}/api/destinations/${destinationId}/subplaces`);
        if (!response.ok) throw new Error('Failed to fetch subplaces');
        const data = await response.json();
        setSubplaceResults(prev => ({ ...prev, [destinationId]: data }));
      } catch (err) {
        setError(err.message);
      } finally {
        setSubplaceLoading(prev => ({ ...prev, [destinationId]: false }));
      }
    }
  };

  // Add subplace to a destination in the tour
  const handleAddSubplace = (destinationId, subplace) => {
    setSelectedDestinations(selectedDestinations.map(d => {
      if (d.destination.id === destinationId) {
        if (!d.subplaces.some(s => s.id === subplace.id)) {
          return { ...d, subplaces: [...d.subplaces, subplace] };
        }
      }
      return d;
    }));
  };

  // Remove subplace from a destination in the tour
  const handleRemoveSubplace = (destinationId, subplaceId) => {
    setSelectedDestinations(selectedDestinations.map(d => {
      if (d.destination.id === destinationId) {
        return { ...d, subplaces: d.subplaces.filter(s => s.id !== subplaceId) };
      }
      return d;
    }));
  };

  // Check if destination is already added
  const isDestinationAdded = (destinationId) => selectedDestinations.some(d => d.destination.id === destinationId);

  // Go to finalize route page
  const handleFinalizeRoute = () => {
    navigate('/finalize-route');
  };

  // Go back to previous page
  const handlePrevious = () => {
    navigate('/create-tour-info');
  };

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">Tour Planner</h1>
          <p className="tour-page-subtitle">Plan your perfect adventure</p>
        </div>
        
        <StepIndicator currentStep={2} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <MapIcon className="title-icon" />
              Add Places
            </h2>
            <p className="card-description">
              Add all the places you want to visit during your tour
            </p>
          </div>
          <div className="card-content">
            <div className="search-section">
              <div className="search-input-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search for a destination..."
                  className="input search-input"
                />
                {loading && <div className="loading-spinner">Loading...</div>}
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>

            {/* Search Results: Destination Cards */}
            {searchResults.length > 0 && (
              <div className="destinations-results">
                <h3 className="results-title">Found {searchResults.length} destinations:</h3>
                <div className="destinations-grid">
                  {searchResults.map(dest => (
                    <div key={dest.id} className="destination-card">
                      {dest.thumbnail_url && (
                        <div className="destination-image">
                          <img src={dest.thumbnail_url} alt={dest.name} />
                        </div>
                      )}
                      <div className="destination-info">
                        <h4>{dest.name}</h4>
                        <p className="destination-type">{dest.type}</p>
                        {dest.description && (
                          <p className="destination-description">
                            {dest.description.length > 100 ? dest.description.substring(0, 100) + '...' : dest.description}
                          </p>
                        )}
                        {!isDestinationAdded(dest.id) ? (
                          <button className="btn btn-primary" onClick={() => handleAddDestination(dest)}>
                            <Plus className="btn-icon" />
                            Add to Tour
                          </button>
                        ) : (
                          <button className="btn btn-destructive" onClick={() => handleRemoveDestination(dest.id)}>
                            <X className="btn-icon" />
                            Remove from Tour
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Destinations (Your Tour) */}
            {selectedDestinations.length > 0 && (
              <div className="your-tour-section">
                <h3 className="results-title">Your Tour ({selectedDestinations.length} places)</h3>
                <div className="destinations-grid">
                  {selectedDestinations.map(({ destination, subplaces }) => (
                    <div key={destination.id} className="destination-card selected">
                      {destination.thumbnail_url && (
                        <div className="destination-image">
                          <img src={destination.thumbnail_url} alt={destination.name} />
                        </div>
                      )}
                      <div className="destination-info">
                        <h4>{destination.name}</h4>
                        <p className="destination-type">{destination.type}</p>
                        {destination.description && (
                          <p className="destination-description">
                            {destination.description.length > 100 ? destination.description.substring(0, 100) + '...' : destination.description}
                          </p>
                        )}
                        <div className="button-group">
                          <button className="btn btn-destructive btn-sm" onClick={() => handleRemoveDestination(destination.id)}>
                            <X className="btn-icon" />
                            Remove
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleShowSubplaces(destination.id)}>
                            {showSubplaces[destination.id] ? 'Hide Sub Places' : 'Add Sub Places'}
                          </button>
                        </div>
                        
                        {/* Subplaces Section */}
                        {showSubplaces[destination.id] && (
                          <div className="subplaces-section">
                            {subplaceLoading[destination.id] ? (
                              <div className="loading-spinner">Loading subplaces...</div>
                            ) : subplaceResults[destination.id] ? (
                              <div className="subplaces-grid">
                                {subplaceResults[destination.id].map(sub => (
                                  <div key={sub.id} className={`subplace-card${subplaces.some(s => s.id === sub.id) ? ' selected' : ''}`}>
                                    {sub.thumbnail_url && (
                                      <div className="subplace-image">
                                        <img src={sub.thumbnail_url} alt={sub.name} />
                                      </div>
                                    )}
                                    <div className="subplace-info">
                                      <h5>{sub.name}</h5>
                                      <p className="subplace-type">{sub.type}</p>
                                      {sub.description && (
                                        <p className="subplace-description">
                                          {sub.description.length > 80 ? sub.description.substring(0, 80) + '...' : sub.description}
                                        </p>
                                      )}
                                      {!subplaces.some(s => s.id === sub.id) ? (
                                        <button className="btn btn-primary btn-sm" onClick={() => handleAddSubplace(destination.id, sub)}>
                                          <Plus className="btn-icon" />
                                          Add
                                        </button>
                                      ) : (
                                        <button className="btn btn-destructive btn-sm" onClick={() => handleRemoveSubplace(destination.id, sub.id)}>
                                          <X className="btn-icon" />
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="error-message">No subplaces found.</div>
                            )}
                            {/* Show selected subplaces */}
                            {subplaces.length > 0 && (
                              <div className="selected-subplaces-list">
                                <h5>Selected Sub Places:</h5>
                                <ul>
                                  {subplaces.map(s => (
                                    <li key={s.id}>{s.name}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Add BlogSuggestions component */}
                        <BlogSuggestions 
                          destinationId={destination.id} 
                          destinationName={destination.name} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            className="btn btn-outline"
            onClick={handlePrevious}
          >
            Previous
          </button>
          {selectedDestinations.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={handleFinalizeRoute}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTourPage;
