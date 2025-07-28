import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CreateTourPage.css';
import { useNavigate } from 'react-router-dom';
import { MapIcon, X, Search } from 'lucide-react';
import { useTour } from '../context/TourContext';
import StepIndicator from '../components/StepIndicator';
import BlogSuggestions from '../components/BlogSuggestions';

const API_URL = process.env.REACT_APP_URL;

const CreateTourPage = ({ isEditMode = false, onPrevious, onNext }) => {
  const navigate = useNavigate();
  const { tourData, setPlaces } = useTour();
  
  // Use context's isEditing flag if available, otherwise use prop
  const isEditing = tourData.isEditing || isEditMode;
  
  // District search and selection
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtResults, setDistrictResults] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sub-places for each district
  const [subplacesData, setSubplacesData] = useState({});
  const [subplaceSearches, setSubplaceSearches] = useState({});
  const [subplaceLoading, setSubplaceLoading] = useState({});
  const [initialized, setInitialized] = useState(false);
  
  // Use ref to track loading requests to prevent duplicate API calls
  const loadingRefs = useRef({});

  // Memoize the loadSubplacesForDistrict function to prevent unnecessary re-renders
  const loadSubplacesForDistrict = useCallback(async (districtId) => {
    // Check if already loaded or currently loading
    if (subplacesData[districtId] || loadingRefs.current[districtId]) {
      return;
    }
    
    // Mark as loading
    loadingRefs.current[districtId] = true;
    setSubplaceLoading(prev => ({ ...prev, [districtId]: true }));
    
    try {
      const response = await fetch(`${API_URL}/api/destinations/${districtId}/subplaces`);
      if (!response.ok) throw new Error('Failed to fetch subplaces');
      const data = await response.json();
      setSubplacesData(prev => ({ ...prev, [districtId]: data }));
    } catch (err) {
      setError(`Failed to load subplaces for district: ${err.message}`);
    } finally {
      // Clear loading state
      loadingRefs.current[districtId] = false;
      setSubplaceLoading(prev => ({ ...prev, [districtId]: false }));
    }
  }, [subplacesData]);

  // Initialize with existing tour data - only run once
  useEffect(() => {
    if (!initialized && tourData.places && tourData.places.length > 0) {
      // Convert existing places back to district format
      const districts = tourData.places.map(place => ({
        district: place.destination,
        selectedSubplaces: place.subplaces
      }));
      setSelectedDistricts(districts);
      
      // Load subplaces for existing districts
      districts.forEach(({ district }) => {
        loadSubplacesForDistrict(district.id);
      });
      
      setInitialized(true);
    } else if (!initialized) {
      setInitialized(true);
    }
  }, [tourData.places, loadSubplacesForDistrict, initialized]);

  // Search for districts (Bangladesh districts)
  const handleDistrictSearchChange = async (e) => {
    const query = e.target.value;
    setDistrictSearch(query);
    setError(null);
    
    if (query.length >= 2) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/destinations?search=${encodeURIComponent(query)}&type=district`);
        if (!response.ok) throw new Error('Failed to fetch districts');
        const data = await response.json();
        setDistrictResults(data);
      } catch (err) {
        setError(err.message);
        setDistrictResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setDistrictResults([]);
    }
  };

  // Add district to selection
  const handleSelectDistrict = useCallback(async (district) => {
    setSelectedDistricts(prev => {
      // Check if district already exists
      if (prev.some(d => d.district.id === district.id)) {
        return prev;
      }
      
      const newDistrict = {
        district,
        selectedSubplaces: []
      };
      return [...prev, newDistrict];
    });
    
    // Load subplaces for this district
    await loadSubplacesForDistrict(district.id);
    
    // Clear search
    setDistrictSearch('');
    setDistrictResults([]);
  }, [loadSubplacesForDistrict]);

  // Remove district from selection
  const handleRemoveDistrict = useCallback((districtId) => {
    setSelectedDistricts(prev => prev.filter(d => d.district.id !== districtId));
    
    // Clean up subplaces data
    setSubplacesData(prev => {
      const newData = { ...prev };
      delete newData[districtId];
      return newData;
    });
    setSubplaceSearches(prev => {
      const newSearches = { ...prev };
      delete newSearches[districtId];
      return newSearches;
    });
    
    // Clean up loading refs
    if (loadingRefs.current[districtId]) {
      delete loadingRefs.current[districtId];
    }
  }, []);

  // Handle subplace search within a district
  const handleSubplaceSearch = useCallback((districtId, query) => {
    setSubplaceSearches(prev => ({ ...prev, [districtId]: query }));
  }, []);

  // Filter subplaces based on search
  const getFilteredSubplaces = useCallback((districtId) => {
    const subplaces = subplacesData[districtId] || [];
    const searchQuery = subplaceSearches[districtId] || '';
    
    if (!searchQuery) return subplaces;
    
    return subplaces.filter(subplace =>
      subplace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subplace.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subplacesData, subplaceSearches]);

  // Toggle subplace selection
  const handleToggleSubplace = useCallback((districtId, subplace) => {
    setSelectedDistricts(prev => prev.map(d => {
      if (d.district.id === districtId) {
        const isSelected = d.selectedSubplaces.some(s => s.id === subplace.id);
        if (isSelected) {
          return {
            ...d,
            selectedSubplaces: d.selectedSubplaces.filter(s => s.id !== subplace.id)
          };
        } else {
          return {
            ...d,
            selectedSubplaces: [...d.selectedSubplaces, subplace]
          };
        }
      }
      return d;
    }));
  }, []);

  // Check if subplace is selected
  const isSubplaceSelected = useCallback((districtId, subplaceId) => {
    const district = selectedDistricts.find(d => d.district.id === districtId);
    return district?.selectedSubplaces.some(s => s.id === subplaceId) || false;
  }, [selectedDistricts]);

  // Update context whenever selection changes - with proper memoization
  useEffect(() => {
    if (initialized) {
      const places = selectedDistricts.map(({ district, selectedSubplaces }) => ({
        destination: district,
        subplaces: selectedSubplaces
      }));
      
      // Only update if places actually changed
      const currentPlaces = tourData.places || [];
      const hasChanged = places.length !== currentPlaces.length ||
        places.some((place, index) => {
          const currentPlace = currentPlaces[index];
          return !currentPlace || 
            place.destination.id !== currentPlace.destination.id ||
            place.subplaces.length !== currentPlace.subplaces.length ||
            place.subplaces.some((sub, subIndex) => {
              const currentSub = currentPlace.subplaces[subIndex];
              return !currentSub || sub.id !== currentSub.id;
            });
        });
      
      if (hasChanged) {
        setPlaces(places);
      }
    }
  }, [selectedDistricts, setPlaces, initialized, tourData.places]);

  // Navigation handlers
  const handleNext = async () => {
    if (selectedDistricts.length === 0) {
      setError('Please select at least one district to continue.');
      return;
    }
    
    if (isEditing && onNext) {
      // In edit mode, call the onNext callback
      onNext();
    } else if (isEditing) {
      // Fallback for edit mode without onNext
      await handleUpdateTour();
    } else {
      // Handle normal tour creation flow
      navigate('/select-hotels');
    }
  };

  const handleUpdateTour = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get userId from localStorage (same as ConfirmTourPage)
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id;
      
      if (!userId) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Prepare the tour data
      const updateData = {
        userId,
        title: tourData.title,
        startDate: tourData.startDate,
        endDate: tourData.endDate,
        estimatedCost: tourData.estimatedCost,
        route: {
          routeSource: 'user',
          stops: []
        }
      };

      // Convert selected districts to route stops
      let stopOrder = 1;
      
      // Use optimized route if available in edit mode, otherwise use selected districts
      if (isEditing && tourData.isRouteOptimized && tourData.optimizedRoute) {
        // Use optimized route order
        tourData.optimizedRoute.forEach((place) => {
          updateData.route.stops.push({
            placeType: place.type,
            placeId: place.id,
            stopOrder: stopOrder++
          });
        });
      } else {
        // Use selected districts order
        selectedDistricts.forEach(({ district, selectedSubplaces }) => {
          // Add the district as a stop
          updateData.route.stops.push({
            placeType: 'Destination',
            placeId: district.id,
            stopOrder: stopOrder++
          });

          // Add selected sub-places as stops
          selectedSubplaces.forEach(subplace => {
            updateData.route.stops.push({
              placeType: 'SubPlace',
              placeId: subplace.id,
              stopOrder: stopOrder++
            });
          });
        });
      }

      console.log('🔄 Updating tour with data:', updateData);
      
      const response = await fetch(`http://localhost:8080/api/tours/${tourData.editingTourId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update tour: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Tour updated successfully:', result);
      
      // Navigate back to my trips
      navigate('/my-trips');
    } catch (err) {
      console.error('❌ Error updating tour:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (isEditing && onPrevious) {
      onPrevious(); // Use callback for edit mode
    } else if (isEditing) {
      navigate('/my-trips');
    } else {
      navigate('/create-tour-info');
    }
  };

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">{isEditing ? 'Edit Tour' : 'Tour Planner'}</h1>
          <p className="tour-page-subtitle">{isEditing ? 'Update your destinations' : 'Plan your perfect adventure'}</p>
        </div>
        
        <StepIndicator currentStep={isEditMode ? 2 : 2} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <MapIcon className="title-icon" />
              Add Places
            </h2>
            <p className="card-description">
              First select districts in Bangladesh, then choose specific places within each district
            </p>
          </div>
          <div className="card-content">
            {/* District Search Section */}
            <div className="search-section">
              <div className="search-input-container">
                <input
                  type="text"
                  value={districtSearch}
                  onChange={handleDistrictSearchChange}
                  placeholder="Search for a district in Bangladesh..."
                  className="search-input"
                />
                <Search className="search-icon" />
                {loading && <div className="loading-spinner">Loading...</div>}
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>

            {/* District Search Results */}
            {districtResults.length > 0 && (
              <div className="district-selection-section">
                <h3 className="section-title">Found {districtResults.length} districts:</h3>
                <div className="district-grid">
                  {districtResults.map(district => (
                    <div 
                      key={district.id} 
                      className={`district-card ${selectedDistricts.some(d => d.district.id === district.id) ? 'selected' : ''}`}
                      onClick={() => handleSelectDistrict(district)}
                    >
                      {district.thumbnail_url && (
                        <div className="district-image">
                          <img src={district.thumbnail_url} alt={district.name} />
                        </div>
                      )}
                      <div className="district-info">
                        <h4>{district.name}</h4>
                        <p className="district-type">{district.type}</p>
                        {district.description && (
                          <p className="district-description">
                            {district.description.length > 100 ? 
                              district.description.substring(0, 100) + '...' : 
                              district.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Districts with Sub-places */}
            {selectedDistricts.length > 0 && (
              <div className="selected-districts-section">
                <h3 className="section-title">
                  Selected Districts ({selectedDistricts.length}) - Choose Sub-places:
                </h3>
                <div className="selected-districts-grid">
                  {selectedDistricts.map(({ district, selectedSubplaces }) => (
                    <div key={district.id} className="selected-district-card">
                      <div className="district-header">
                        <h4 className="district-name">{district.name}</h4>
                        <button
                          className="remove-district-btn"
                          onClick={() => handleRemoveDistrict(district.id)}
                          title="Remove district"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="subplaces-section">
                        {/* Sub-place search */}
                        <div className="subplaces-search">
                          <div className="search-input-container">
                            <input
                              type="text"
                              value={subplaceSearches[district.id] || ''}
                              onChange={(e) => handleSubplaceSearch(district.id, e.target.value)}
                              placeholder={`Search places in ${district.name}...`}
                              className="search-input"
                            />
                            <Search className="search-icon" />
                          </div>
                        </div>

                        {/* Sub-places grid */}
                        {subplaceLoading[district.id] ? (
                          <div className="loading-spinner">Loading places...</div>
                        ) : (
                          <>
                            <div className="subplaces-grid">
                              {getFilteredSubplaces(district.id).map(subplace => (
                                <div
                                  key={subplace.id}
                                  className={`subplace-card ${isSubplaceSelected(district.id, subplace.id) ? 'selected' : ''}`}
                                  onClick={() => handleToggleSubplace(district.id, subplace)}
                                >
                                  {subplace.thumbnail_url && (
                                    <div className="subplace-image">
                                      <img src={subplace.thumbnail_url} alt={subplace.name} />
                                    </div>
                                  )}
                                  <div className="subplace-info">
                                    <h5>{subplace.name}</h5>
                                    <p className="subplace-type">{subplace.type}</p>
                                    {subplace.description && (
                                      <p className="subplace-description">
                                        {subplace.description.length > 80 ? 
                                          subplace.description.substring(0, 80) + '...' : 
                                          subplace.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Selected sub-places summary */}
                            {selectedSubplaces.length > 0 && (
                              <div className="selected-subplaces-summary">
                                <h5>Selected Places ({selectedSubplaces.length}):</h5>
                                <div className="subplace-tags">
                                  {selectedSubplaces.map(subplace => (
                                    <span key={subplace.id} className="subplace-tag">
                                      {subplace.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Blog suggestions for this destination */}
                            <BlogSuggestions 
                              destinationId={district.id}
                              destinationName={district.name}
                            />
                          </>
                        )}
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
            <span>{isEditing ? 'Back to My Trips' : 'Previous'}</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={selectedDistricts.length === 0}
          >
            <span>Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTourPage;
