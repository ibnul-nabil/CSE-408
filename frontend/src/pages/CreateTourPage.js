import React, { useState } from 'react';
import './CreateTourPage.css';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL =  process.env.REACT_APP_URL;

const CreateTourPage = () => {
  const location = useLocation();
  const { title, startDate, endDate } = location.state || {};
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Destinations
  const [selectedDestinations, setSelectedDestinations] = useState([]); // [{destination, subplaces: []}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subplaceLoading, setSubplaceLoading] = useState({}); // {destinationId: boolean}
  const [subplaceResults, setSubplaceResults] = useState({}); // {destinationId: [subplaces]}
  const [showSubplaces, setShowSubplaces] = useState({}); // {destinationId: boolean}
  const navigate = useNavigate();

  // Search for destinations
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);
    setError(null);
    if (query.length >= 3) {
      setLoading(true);
      try {
        // Replace with your actual endpoint for destinations
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

  // Add this function to go to finalize route page
  const handleFinalizeRoute = () => {
    navigate('/finalize-route', {
      state: {
        title,
        startDate,
        endDate,
        selectedDestinations
      }
    });
  };

  return (
    <div className="create-tour-container">
      <h1 className="page-title">Create a New Tour</h1>
      <div className="search-section">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search for a destination..."
          className="search-input"
        />
        {loading && <div className="loading-spinner">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Search Results: Destination Cards */}
      {searchResults.length > 0 && (
        <div className="destinations-results">
          <h2 className="results-title">Found {searchResults.length} destinations:</h2>
          <div className="destinations-grid">
            {searchResults.map(dest => (
              <div key={dest.id} className="destination-card">
                {dest.thumbnail_url && (
                  <div className="destination-image">
                    <img src={dest.thumbnail_url} alt={dest.name} />
                  </div>
                )}
                <div className="destination-info">
                  <h3>{dest.name}</h3>
                  <p className="destination-type">{dest.type}</p>
                  {dest.description && (
                    <p className="destination-description">
                      {dest.description.length > 100 ? dest.description.substring(0, 100) + '...' : dest.description}
                    </p>
                  )}
                  {!isDestinationAdded(dest.id) ? (
                    <button className="add-to-tour-btn" onClick={() => handleAddDestination(dest)}>
                      Add to Tour
                    </button>
                  ) : (
                    <button className="remove-from-tour-btn" onClick={() => handleRemoveDestination(dest.id)}>
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
          <h2 className="results-title">Your Tour</h2>
          <div className="destinations-grid">
            {selectedDestinations.map(({ destination, subplaces }) => (
              <div key={destination.id} className="destination-card selected">
                {destination.thumbnail_url && (
                  <div className="destination-image">
                    <img src={destination.thumbnail_url} alt={destination.name} />
                  </div>
                )}
                <div className="destination-info">
                  <h3>{destination.name}</h3>
                  <p className="destination-type">{destination.type}</p>
                  {destination.description && (
                    <p className="destination-description">
                      {destination.description.length > 100 ? destination.description.substring(0, 100) + '...' : destination.description}
                    </p>
                  )}
                  <button className="remove-from-tour-btn" onClick={() => handleRemoveDestination(destination.id)}>
                    Remove from Tour
                  </button>
                  <button className="add-subplaces-btn" onClick={() => handleShowSubplaces(destination.id)}>
                    {showSubplaces[destination.id] ? 'Hide Sub Places' : 'Add Sub Places'}
                  </button>
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
                                <h4>{sub.name}</h4>
                                <p className="subplace-type">{sub.type}</p>
                                {sub.description && (
                                  <p className="subplace-description">
                                    {sub.description.length > 80 ? sub.description.substring(0, 80) + '...' : sub.description}
                                  </p>
                                )}
                                {!subplaces.some(s => s.id === sub.id) ? (
                                  <button className="add-to-tour-btn" onClick={() => handleAddSubplace(destination.id, sub)}>
                                    Add to Sub Places
                                  </button>
                                ) : (
                                  <button className="remove-from-tour-btn" onClick={() => handleRemoveSubplace(destination.id, sub.id)}>
                                    Remove from Sub Places
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
                </div>
              </div>
            ))}
          </div>
          {/* Finalize Route Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <button
              className="finalize-route-btn"
              onClick={handleFinalizeRoute}
            >
              Next: Finalize Route
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTourPage;
