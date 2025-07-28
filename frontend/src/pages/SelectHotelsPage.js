import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Calendar, DollarSign, MapPin, Star, Wifi, Car, Utensils, ExternalLink } from 'lucide-react';
import { useTour } from '../context/TourContext';
import StepIndicator from '../components/StepIndicator';
import './SelectHotelsPage.css';

const API_URL = process.env.REACT_APP_URL;

const SelectHotelsPage = ({ isEditMode = false, onPrevious, onNext }) => {
  const navigate = useNavigate();
  const { tourData, setAccommodations } = useTour();
  
  // Hotel data state
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Selected accommodations state
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [expandedAmenities, setExpandedAmenities] = useState(new Set());
  
  // Date input refs
  const checkInRefs = useRef({});
  const checkOutRefs = useRef({});
  
  // Available amenities for filtering
  const availableAmenities = [
    'WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Parking', 
    'Beach Access', 'Mountain View', 'Lake View', 'Ocean View',
    'Conference Room', 'Butler Service', 'Guided Tours', 'Boat Tours',
    'Fishing', 'Hiking Tours', 'Stone Collection', 'Bird Watching',
    'Eco Tours', 'Nature Tours', 'Heritage Tours', 'Cultural Shows',
    'Prayer Room', 'Temple Tours', 'Religious Tours'
  ];

  // Initialize with existing tour data
  useEffect(() => {
    if (tourData.accommodations && tourData.accommodations.length > 0) {
      setSelectedAccommodations(tourData.accommodations);
    }
  }, [tourData.accommodations]);

  // Load hotels based on selected places
  useEffect(() => {
    if (tourData.places && tourData.places.length > 0) {
      loadHotelsForPlaces();
    }
  }, [tourData.places]);

  const loadHotelsForPlaces = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allHotels = [];
      
      // Extract destination IDs and sub-place IDs
      const destinationIds = [];
      const subPlaceIds = [];
      
      tourData.places.forEach(place => {
        if (place.destination) {
          destinationIds.push(place.destination.id);
        }
        if (place.subplaces && place.subplaces.length > 0) {
          place.subplaces.forEach(subplace => {
            subPlaceIds.push(subplace.id);
          });
        }
      });
      
      // Fetch hotels for all destinations at once
      if (destinationIds.length > 0) {
        try {
          const response = await fetch(`${API_URL}/api/hotels/destinations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(destinationIds)
          });
          if (response.ok) {
            const destinationHotels = await response.json();
            allHotels.push(...destinationHotels);
          }
        } catch (err) {
          console.error('Error fetching hotels for destinations:', err);
        }
      }
      
      // Fetch hotels for all sub-places at once
      if (subPlaceIds.length > 0) {
        try {
          const response = await fetch(`${API_URL}/api/hotels/subplaces`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subPlaceIds)
          });
          if (response.ok) {
            const subplaceHotels = await response.json();
            allHotels.push(...subplaceHotels);
          }
        } catch (err) {
          console.error('Error fetching hotels for sub-places:', err);
        }
      }
      
      // Remove duplicates based on hotel ID
      const uniqueHotels = allHotels.filter((hotel, index, self) => 
        index === self.findIndex(h => h.id === hotel.id)
      );
      
      setHotels(uniqueHotels);
      console.log(`Loaded ${uniqueHotels.length} unique hotels for selected places`);
      
    } catch (err) {
      console.error('Error loading hotels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter hotels based on search and filters
  const filteredHotels = hotels.filter(hotel => {
    // Search term filter
    if (searchTerm && !hotel.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Price range filter
    if (hotel.pricePerNight < priceRange.min || hotel.pricePerNight > priceRange.max) {
      return false;
    }
    
    // Destination filter - show hotels from selected destinations only
    if (selectedDestinations.length > 0) {
      const hotelDestinationId = hotel.destinationId;
      const isFromSelectedDestination = selectedDestinations.some(dest => 
        dest.id === hotelDestinationId
      );
      if (!isFromSelectedDestination) {
        return false;
      }
    }
    
    // Amenities filter - show hotels that have ALL selected amenities
    if (selectedAmenities.length > 0) {
      const hotelAmenities = hotel.amenities || [];
      const hasAllSelectedAmenities = selectedAmenities.every(amenity => 
        hotelAmenities.includes(amenity)
      );
      if (!hasAllSelectedAmenities) {
        return false;
      }
    }
    
    return true;
  });

  // Handle hotel selection
  const handleHotelSelect = (hotel) => {
    const existingIndex = selectedAccommodations.findIndex(
      acc => acc.hotelId === hotel.id
    );
    
    console.log('🏨 Hotel selection:', hotel.name, 'existingIndex:', existingIndex);
    
    if (existingIndex >= 0) {
      // Remove hotel if already selected
      console.log('🗑️ Removing hotel:', hotel.name);
      setSelectedAccommodations(prev => 
        prev.filter((_, index) => index !== existingIndex)
      );
    } else {
      // Add hotel with default dates
      console.log('➕ Adding hotel:', hotel.name);
      const newAccommodation = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelLocation: hotel.location,
        hotelPrice: hotel.pricePerNight,
        checkIn: tourData.startDate || '',
        checkOut: tourData.endDate || '',
        totalCost: hotel.pricePerNight,
        amenities: hotel.amenities || []
      };
      
      setSelectedAccommodations(prev => [...prev, newAccommodation]);
    }
  };

  // Handle date changes for accommodations
  const handleDateChange = (hotelId, field, value) => {
    setSelectedAccommodations(prev => 
      prev.map(acc => {
        if (acc.hotelId === hotelId) {
          const updated = { ...acc, [field]: value };
          
          // Recalculate total cost if both dates are set
          if (updated.checkIn && updated.checkOut) {
            const checkIn = new Date(updated.checkIn);
            const checkOut = new Date(updated.checkOut);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            updated.totalCost = updated.hotelPrice * nights;
          }
          
          return updated;
        }
        return acc;
      })
    );
  };

  // Remove accommodation
  const handleRemoveAccommodation = (hotelId) => {
    setSelectedAccommodations(prev => 
      prev.filter(acc => acc.hotelId !== hotelId)
    );
  };

  // Toggle amenities expansion for a hotel
  const toggleAmenitiesExpansion = (hotelId) => {
    setExpandedAmenities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hotelId)) {
        newSet.delete(hotelId);
      } else {
        newSet.add(hotelId);
      }
      return newSet;
    });
  };

  // Check if hotel is selected
  const isHotelSelected = (hotelId) => {
    return selectedAccommodations.some(acc => acc.hotelId === hotelId);
  };

  // Get selected accommodation for a hotel
  const getSelectedAccommodation = (hotelId) => {
    return selectedAccommodations.find(acc => acc.hotelId === hotelId);
  };

  // Calculate total accommodation cost
  const totalAccommodationCost = selectedAccommodations.reduce(
    (total, acc) => total + (acc.totalCost || 0), 0
  );

  // Navigation handlers
  const handlePrevious = () => {
    if (isEditMode && onPrevious) {
      onPrevious();
    } else {
      navigate('/select-places');
    }
  };

  const handleNext = () => {
    // Check if no hotels are selected and show confirmation popup
    if (selectedAccommodations.length === 0) {
      const confirmed = window.confirm(
        'You haven\'t selected any hotels for this tour. Are you sure you want to continue without accommodations?'
      );
      if (!confirmed) {
        return; // User cancelled, stay on current page
      }
    }
    
    // Save accommodations to context (can be empty array)
    console.log('💾 Saving accommodations to context:', selectedAccommodations);
    setAccommodations(selectedAccommodations);
    
    if (isEditMode && onNext) {
      onNext();
    } else {
      navigate('/finalize-route');
    }
  };

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

  const handleDateContainerClick = useCallback((inputRef) => {
    if (inputRef.current) {
      // Try to use showPicker if available
      if (inputRef.current.showPicker) {
        try {
          inputRef.current.showPicker();
        } catch (error) {
          // Fallback: focus and click
          inputRef.current.focus();
          inputRef.current.click();
        }
      } else {
        // Fallback: focus and click
        inputRef.current.focus();
        inputRef.current.click();
      }
    }
  }, []);

  // Render amenity icon
  const renderAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi size={16} />;
      case 'pool': return <Car size={16} />;
      case 'restaurant': return <Utensils size={16} />;
      default: return <Star size={16} />;
    }
  };

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">{isEditMode ? 'Edit Tour' : 'Tour Planner'}</h1>
          <p className="tour-page-subtitle">{isEditMode ? 'Update your accommodation choices' : 'Choose your perfect accommodations (optional)'}</p>
        </div>
        
        <StepIndicator currentStep={3} />
        
        <div className="hotels-page-content">


          {/* Compact Filters Section */}
          <div className="filters-section card">
            <div className="card-header">
              <h2 className="card-title">
                <Bed className="title-icon" />
                Quick Filters
              </h2>
            </div>
            <div className="card-content">
              <div className="compact-filters">
                {/* Search and Price in one row */}
                <div className="filter-row">
                  <div className="search-filter">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search hotels..."
                      className="compact-input"
                    />
                  </div>
                  
                  <div className="price-filter">
                    <span className="filter-label">Price Range:</span>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      placeholder="Min $"
                      className="compact-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      placeholder="Max $"
                      className="compact-input"
                    />
                  </div>
                </div>
                
                {/* Amenities and Destinations in one row */}
                <div className="filter-row">
                  <div className="amenities-filter">
                    <span className="filter-label">Amenities:</span>
                    {availableAmenities.slice(0, 4).map(amenity => (
                      <label key={amenity} className="compact-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAmenities(prev => [...prev, amenity]);
                            } else {
                              setSelectedAmenities(prev => prev.filter(a => a !== amenity));
                            }
                          }}
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="destinations-filter">
                    <span className="filter-label">Destinations:</span>
                    {tourData.places && tourData.places.map(place => {
                      const destination = place.destination;
                      return (
                        <label key={destination.id} className="compact-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedDestinations.some(d => d.id === destination.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDestinations(prev => [...prev, destination]);
                              } else {
                                setSelectedDestinations(prev => prev.filter(d => d.id !== destination.id));
                              }
                            }}
                          />
                          <span>{destination.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="hotels-section">
            <div className="section-header">
              <h2>Available Hotels ({filteredHotels.length})</h2>
              {loading && <div className="loading-spinner">Loading hotels...</div>}
              {error && <div className="error-message">{error}</div>}
            </div>
            
            <div className="hotels-grid">
              {filteredHotels.map(hotel => (
                <div 
                  key={hotel.id} 
                  className={`hotel-card ${isHotelSelected(hotel.id) ? 'selected' : ''}`}
                >
                  <div className="hotel-info">
                    <div className="hotel-header">
                      <h3 className="hotel-name">{hotel.name}</h3>
                      <button
                        className={`add-hotel-btn ${isHotelSelected(hotel.id) ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHotelSelect(hotel);
                        }}
                        title={isHotelSelected(hotel.id) ? 'Remove Hotel' : 'Add Hotel'}
                      >
                        {isHotelSelected(hotel.id) ? '✓' : '+'}
                      </button>
                    </div>
                    
                    <p className="hotel-location">
                      <MapPin size={16} />
                      {hotel.location}
                    </p>
                    
                    <div className="hotel-details">
                      <div className="hotel-price">
                        <DollarSign size={16} />
                        {hotel.pricePerNight} per night
                      </div>
                      
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="hotel-amenities">
                          {hotel.amenities.slice(0, expandedAmenities.has(hotel.id) ? hotel.amenities.length : 3).map(amenity => (
                            <span key={amenity} className="amenity-tag">
                              {renderAmenityIcon(amenity)}
                              {amenity}
                            </span>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <button
                              className="amenity-toggle-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAmenitiesExpansion(hotel.id);
                              }}
                            >
                              {expandedAmenities.has(hotel.id) 
                                ? 'Show less' 
                                : `+${hotel.amenities.length - 3} more`
                              }
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Booking.com Button */}
                    <div className="hotel-actions">
                      <button
                        className="booking-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('https://booking.com', '_blank');
                        }}
                        title="Book on Booking.com"
                      >
                        <ExternalLink size={16} />
                        Book on Booking.com
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Accommodations */}
          {selectedAccommodations.length > 0 && (
            <div className="selected-accommodations-section card">
              <div className="card-header">
                <h2 className="card-title">
                  <Calendar className="title-icon" />
                  Selected Accommodations ({selectedAccommodations.length})
                </h2>
              </div>
              <div className="card-content">
                <div className="accommodations-list">
                  {selectedAccommodations.map(accommodation => (
                    <div key={accommodation.hotelId} className="accommodation-item">
                      <div className="accommodation-header">
                        <h4>{accommodation.hotelName}</h4>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveAccommodation(accommodation.hotelId)}
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="accommodation-details">
                        <div className="detail-group">
                          <label>Check-in Date</label>
                          <div 
                            className="date-input-container"
                            onClick={() => handleDateContainerClick(checkInRefs.current[accommodation.hotelId])}
                          >
                            <Calendar className="date-icon" />
                            <input
                              ref={el => checkInRefs.current[accommodation.hotelId] = el}
                              type="date"
                              value={accommodation.checkIn}
                              onChange={(e) => handleDateChange(accommodation.hotelId, 'checkIn', e.target.value)}
                              min={tourData.startDate}
                              max={tourData.endDate}
                              className="date-input"
                            />
                            <div className="date-display">
                              {accommodation.checkIn ? formatDateDisplay(accommodation.checkIn) : "Pick check-in date"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-group">
                          <label>Check-out Date</label>
                          <div 
                            className="date-input-container"
                            onClick={() => handleDateContainerClick(checkOutRefs.current[accommodation.hotelId])}
                          >
                            <Calendar className="date-icon" />
                            <input
                              ref={el => checkOutRefs.current[accommodation.hotelId] = el}
                              type="date"
                              value={accommodation.checkOut}
                              onChange={(e) => handleDateChange(accommodation.hotelId, 'checkOut', e.target.value)}
                              min={accommodation.checkIn || tourData.startDate}
                              max={tourData.endDate}
                              className="date-input"
                            />
                            <div className="date-display">
                              {accommodation.checkOut ? formatDateDisplay(accommodation.checkOut) : "Pick check-out date"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-group">
                          <label>Total Cost</label>
                          <div className="total-cost">
                            <DollarSign size={16} />
                            {accommodation.totalCost || accommodation.hotelPrice}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="accommodation-summary">
                  <div className="total-cost-display">
                    <span>Total Accommodation Cost:</span>
                    <span className="total-amount">
                      <DollarSign size={20} />
                      {totalAccommodationCost}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        


        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            className="btn btn-outline"
            onClick={handlePrevious}
          >
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

export default SelectHotelsPage; 