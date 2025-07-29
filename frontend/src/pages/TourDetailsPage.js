import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, User, Navigation, Bed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TourSpecialEvents from '../components/TourSpecialEvents';
import './TourDetailsPage.css';

const API_URL = process.env.REACT_APP_URL;

const TourDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get return state from navigation
  const returnTo = location.state?.returnTo || '/my-trips';
  const returnState = location.state?.returnState;

  useEffect(() => {
    if (user) {
      fetchTourDetails();
    } else {
      console.log('⏳ Waiting for user authentication...');
    }
  }, [id, user]);

  const fetchTourDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching tour details for ID:', id);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/tours/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        if (response.status === 401) {
          console.log('❌ Authentication failed, redirecting to login');
          navigate('/login');
          return;
        } else if (response.status === 403) {
          throw new Error('Access denied. This tour does not belong to you.');
        } else if (response.status === 404) {
          throw new Error('Tour not found.');
        } else {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Tour data received:', data);
      console.log('📊 Tour places:', data.places);
      console.log('💰 Tour estimated cost:', data.estimatedCost);
      console.log('🏨 Tour accommodations:', data.accommodations);
      console.log('🏨 Accommodations length:', data.accommodations?.length);
      console.log('🏨 Accommodations structure:', JSON.stringify(data.accommodations, null, 2));
      setTour(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const getTourStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'current';
  };

  // Calculate total accommodation cost
  const calculateAccommodationCost = (accommodations) => {
    if (!accommodations || accommodations.length === 0) return 0;
    return accommodations.reduce((total, acc) => total + (acc.totalCost || 0), 0);
  };

  const handleBackNavigation = () => {
    if (returnState) {
      console.log('🔙 Navigating back with saved state:', returnState);
      // Navigate back with the saved state
      navigate(returnTo, {
        state: { returnState }
      });
    } else {
      console.log('🔙 Navigating back without saved state');
      // Default navigation
      navigate('/my-trips');
    }
  };

  if (loading) {
    return (
      <div className="tour-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-details-container">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn" onClick={fetchTourDetails}>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="tour-details-container">
        <div className="error-state">
          <p className="error-message">Tour not found</p>
          <button className="btn" onClick={handleBackNavigation}>
            <span>Back to My Trips</span>
          </button>
        </div>
      </div>
    );
  }

  const status = getTourStatus(tour.startDate, tour.endDate);
  const accommodationCost = calculateAccommodationCost(tour.accommodations);

  console.log('🎯 Rendering tour details with:', {
    tourId: tour.id,
    accommodations: tour.accommodations,
    accommodationCost,
    hasAccommodations: tour.accommodations && tour.accommodations.length > 0
  });

  return (
    <div className="tour-details-container">
      <div className="tour-details-wrapper">
        <div className="tour-details-header">
          <button className="back-btn" onClick={handleBackNavigation}>
            <ArrowLeft size={20} />
            <span>Back to My Trips</span>
          </button>
          
          <div className="tour-header-content">
            <div className="tour-header-main">
              <h1 className="tour-title">{tour.title || 'Untitled Tour'}</h1>
              <span className={`tour-status ${status}`}>
                {status === 'current' ? 'Ongoing' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
              </span>
            </div>
            <p className="tour-subtitle">Your adventure details</p>
          </div>
        </div>

        <div className="tour-details-content">
          <div className="tour-info-section">
            <div className="info-card">
              <h3 className="info-title">Tour Information</h3>
              <div className="info-grid">
                {tour.startDate && tour.endDate && (
                  <div className="info-item">
                    <Calendar className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Duration</span>
                      <span className="info-value">
                        {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
                      </span>
                    </div>
                  </div>
                )}
                
                {tour.startDate && tour.endDate && (
                  <div className="info-item">
                    <Clock className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Length</span>
                      <span className="info-value">{getDuration(tour.startDate, tour.endDate)}</span>
                    </div>
                  </div>
                )}
                
                <div className="info-item">
                  <MapPin className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Destinations</span>
                    <span className="info-value">
                      {tour.places?.length || 0} destination{(tour.places?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="info-item">
                  <DollarSign className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Estimated Cost</span>
                    <span className="info-value">${tour.estimatedCost || 0}</span>
                  </div>
                </div>

                {/* Hotel Information */}
                {tour.accommodations && tour.accommodations.length > 0 && (
                  <div className="info-item">
                    <Bed className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Accommodations</span>
                      <span className="info-value">
                        {tour.accommodations.length} hotel{tour.accommodations.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                  </div>
                )}

                {accommodationCost > 0 && (
                  <div className="info-item">
                    <DollarSign className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Accommodation Cost</span>
                      <span className="info-value">${accommodationCost}</span>
                    </div>
                  </div>
                )}
                
                <div className="info-item">
                  <User className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Created</span>
                    <span className="info-value">
                      {tour.createdAt ? formatDate(tour.createdAt) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {tour.places && tour.places.length > 0 ? (
            <div className="destinations-section">
              <div className="destinations-card">
                <h3 className="destinations-title">
                  <Navigation className="destinations-icon" />
                  Tour Route & Destinations
                </h3>
                <div className="destinations-list">
                  {tour.places.map((place, index) => (
                    <div key={index} className="destination-item">
                      <div className="destination-marker">
                        <span className="marker-number">{index + 1}</span>
                      </div>
                      <div className="destination-content">
                        <h4 className="destination-name">
                          {place.destination?.name || place.name || `Destination ${place.destinationId || place.id}`}
                        </h4>
                        {place.subPlaces && place.subPlaces.length > 0 ? (
                          <div className="sub-places">
                            <span className="sub-places-label">Sub-places:</span>
                            <div className="sub-places-list">
                              {place.subPlaces.map((subPlace, subIndex) => (
                                <span key={subIndex} className="sub-place-tag">
                                  {subPlace.name || `Sub-place ${subPlace.id}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Hotel Information Section */}
          {tour.accommodations && tour.accommodations.length > 0 && (
            <div className="hotels-section">
              <div className="hotels-card">
                <h3 className="hotels-title">
                  <Bed className="hotels-icon" />
                  Accommodations & Hotels
                </h3>
                <div className="hotels-list">
                  {tour.accommodations.map((accommodation, index) => (
                    <div key={accommodation.hotelId} className="hotel-item">
                      <div className="hotel-marker">
                        <span className="marker-number">{index + 1}</span>
                      </div>
                      <div className="hotel-content">
                        <h4 className="hotel-name">{accommodation.hotelName}</h4>
                        <p className="hotel-location">{accommodation.hotelLocation}</p>
                        <div className="hotel-details">
                          <span className="hotel-price">${accommodation.hotelPrice} per night</span>
                          {accommodation.checkIn && accommodation.checkOut && (
                            <span className="hotel-dates">
                              {formatDate(accommodation.checkIn)} - {formatDate(accommodation.checkOut)}
                            </span>
                          )}
                          <span className="hotel-total">Total: ${accommodation.totalCost || accommodation.hotelPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Special Events Section */}
          {console.log('🔍 Tour data for special events:', {
            places: tour.places,
            startDate: tour.startDate,
            endDate: tour.endDate,
            hasPlaces: !!tour.places,
            placesLength: tour.places?.length,
            hasDates: !!(tour.startDate && tour.endDate)
          })}
          <TourSpecialEvents 
            tourData={{
              places: tour.places,
              startDate: tour.startDate,
              endDate: tour.endDate
            }}
            onEventsLoaded={(events) => {
              console.log('🎉 Special events loaded for tour details:', events);
            }}
          />

          <div className="tour-actions">
            {/* Actions removed - edit functionality moved to My Trips page */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailsPage; 