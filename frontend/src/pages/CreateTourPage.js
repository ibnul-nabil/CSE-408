import React, { useState } from 'react';
import './CreateTourPage.css';

const CreateTourPage = () => {
  const [search, setSearch] = useState('');
  const [subplaces, setSubplaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);
    setError(null);

    if (query.length >= 3) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/subplaces?destination=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error('Failed to fetch subplaces');
        const data = await response.json();
        setSubplaces(data);
      } catch (err) {
        console.error('Error fetching subplaces:', err);
        setError(err.message);
        setSubplaces([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSubplaces([]);
    }
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
        {isLoading && <div className="loading-spinner">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
      </div>

      {subplaces.length > 0 && (
        <div className="subplaces-results">
          <h2 className="results-title">Found {subplaces.length} places:</h2>
          <div className="subplaces-grid">
            {subplaces.map((place) => (
              <div key={place.id} className="subplace-card">
                {place.thumbnail_url && (
                  <div className="subplace-image">
                    <img src={place.thumbnail_url} alt={place.name} />
                  </div>
                )}
                <div className="subplace-info">
                  <h3>{place.name}</h3>
                  <p className="subplace-type">{place.type}</p>
                  {place.description && (
                    <p className="subplace-description">
                      {place.description.length > 100
                        ? `${place.description.substring(0, 100)}...`
                        : place.description}
                    </p>
                  )}
                  <button className="add-to-tour-btn">Add to Tour</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTourPage;
