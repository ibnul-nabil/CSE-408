import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { CheckCircle, ArrowLeft, Calendar, MapPin, Clock, Navigation, Bed, DollarSign } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import TourSpecialEvents from '../components/TourSpecialEvents';
import './ConfirmTourPage.css';

const API_URL = process.env.REACT_APP_URL;

const ConfirmTourPage = ({ isEditMode = false, onPrevious, onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tourData, resetTour } = useTour();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [specialEventsCount, setSpecialEventsCount] = useState(0);

  // Format date to readable format (July 7th, 2025)
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "Not set";
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

  // Calculate tour duration
  const calculateDuration = () => {
    if (!tourData.startDate || !tourData.endDate) return "Not set";
    const start = new Date(tourData.startDate);
    const end = new Date(tourData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  // Calculate total accommodation cost
  const calculateAccommodationCost = () => {
    if (!tourData.accommodations || tourData.accommodations.length === 0) return 0;
    return tourData.accommodations.reduce((total, acc) => total + (acc.totalCost || 0), 0);
  };

  // Get hotel names for display
  const getHotelNames = () => {
    if (!tourData.accommodations || tourData.accommodations.length === 0) return [];
    return tourData.accommodations.map(acc => acc.hotelName).filter(name => name);
  };

  const handleConfirmTour = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    // Get userId from context or localStorage (as in CreateBlogPage)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id || storedUser?.id;
    const token = localStorage.getItem("token");

    if (!userId) {
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }
    if (!tourData.places || tourData.places.length === 0) {
      setError("No route selected.");
      setLoading(false);
      return;
    }

    // Prepare request body for backend
    let stopOrder = 1;

    // Add starting point as the first stop if it exists
    const stops = [];
    if (tourData.startingPoint) {
      // Find the starting point destination
      const startingPointDestination = tourData.places.find(place => 
        place.destination.name === tourData.startingPoint
      );
      
      if (startingPointDestination) {
        stops.push({
          placeType: "Destination",
          placeId: startingPointDestination.destination.id,
          stopOrder: stopOrder++
        });
      }
    }
    
    // Use optimized route if available, otherwise use original places
    const placesToUse = tourData.isRouteOptimized && tourData.optimizedRoute 
      ? tourData.optimizedRoute 
      : tourData.places;
    
    if (tourData.isRouteOptimized && tourData.optimizedRoute) {
      // Use optimized route order
      tourData.optimizedRoute.forEach((place) => {
        stops.push({
          placeType: place.type,
          placeId: place.id,
          stopOrder: stopOrder++
        });
      });
    } else {
      // Use original places order
      tourData.places.forEach(({ destination, subplaces }) => {
        // Skip if this destination is the starting point (already added)
        if (tourData.startingPoint && destination.name === tourData.startingPoint) {
          return;
        }
        
        stops.push({
          placeType: "Destination",
          placeId: destination.id,
          stopOrder: stopOrder++
        });
        subplaces.forEach(sub => {
          stops.push({
            placeType: "SubPlace",
            placeId: sub.id,
            stopOrder: stopOrder++
          });
        });
      });
    }
    // Calculate total estimated cost from accommodations
    const totalAccommodationCost = calculateAccommodationCost();
    
    const reqBody = {
      userId,
      title: tourData.title || "New Tour",
      startDate: tourData.startDate,
      endDate: tourData.endDate,
      startingPoint: tourData.startingPoint,
      estimatedCost: totalAccommodationCost, // Use calculated accommodation cost
      route: {
        routeSource: "user",
        stops,
        totalDistance: tourData.totalDistance || 0 // Include the calculated distance
      },
      accommodations: tourData.accommodations || []
    };

    console.log("📏 Tour data distance:", tourData.totalDistance);
    console.log("🚀 Sending tour creation request with distance:", reqBody.route.totalDistance);

    try {
      const url = isEditMode 
        ? `${API_URL}/api/tours/${tourData.editingTourId}` 
        : `${API_URL}/api/tours`;
      
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || `Failed to ${isEditMode ? 'update' : 'create'} tour.`);
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Reset tour data after successful creation/update
      resetTour();
      
      if (isEditMode && onComplete) {
        // For edit mode, call the completion callback
        setTimeout(() => onComplete(), 1500);
      } else {
        // For create mode, navigate to my trips
        setTimeout(() => navigate("/my-trips", { replace: true, state: { skipLoading: true } }), 1500);
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (isEditMode && onPrevious) {
      onPrevious();
    } else {
      navigate('/finalize-route');
    }
  };

  const renderTourSummary = () => {
    const accommodationCost = calculateAccommodationCost();
    const hotelNames = getHotelNames();
    
    return (
      <div className="tour-confirmation-summary">
        <div className="confirmation-header">
          <CheckCircle className="confirmation-icon" />
          <h3 className="confirmation-title">
            {isEditMode ? 'Ready to Update Your Tour?' : 'Ready to Create Your Tour?'}
          </h3>
          <p className="confirmation-subtitle">
            {isEditMode ? 'Please review your tour changes before confirming' : 'Please review your tour details before confirming'}
          </p>
        </div>
        
        <div className="tour-details-grid">
          <div className="tour-detail-card">
            <Calendar className="detail-icon" />
            <div className="detail-content">
              <h4 className="detail-title">Tour Dates</h4>
              <p className="detail-value">{formatDateDisplay(tourData.startDate)} - {formatDateDisplay(tourData.endDate)}</p>
              <p className="detail-subtitle">Duration: {calculateDuration()}</p>
            </div>
          </div>
          
          <div className="tour-detail-card">
            <MapPin className="detail-icon" />
            <div className="detail-content">
              <h4 className="detail-title">Destinations</h4>
              <p className="detail-value">{tourData.places?.length || 0} places selected</p>
              <p className="detail-subtitle">
                {tourData.places?.reduce((total, place) => total + place.subplaces.length, 0) || 0} sub-places included
              </p>
            </div>
          </div>
          
          {tourData.totalDistance && (
            <div className="tour-detail-card">
              <Navigation className="detail-icon" />
              <div className="detail-content">
                <h4 className="detail-title">Route Distance</h4>
                <p className="detail-value">{tourData.totalDistance} km</p>
                <p className="detail-subtitle">
                  {tourData.isRouteOptimized ? 'Optimized route' : 'Direct route'}
                </p>
              </div>
            </div>
          )}

          {/* Hotel Information */}
          {tourData.accommodations && tourData.accommodations.length > 0 && (
            <div className="tour-detail-card">
              <Bed className="detail-icon" />
              <div className="detail-content">
                <h4 className="detail-title">Accommodations</h4>
                <p className="detail-value">{tourData.accommodations.length} hotel{tourData.accommodations.length !== 1 ? 's' : ''} selected</p>
                <p className="detail-subtitle">
                  {hotelNames.slice(0, 2).join(', ')}
                  {hotelNames.length > 2 && ` +${hotelNames.length - 2} more`}
                </p>
              </div>
            </div>
          )}

          {accommodationCost > 0 && (
            <div className="tour-detail-card">
              <DollarSign className="detail-icon" />
              <div className="detail-content">
                <h4 className="detail-title">Accommodation Cost</h4>
                <p className="detail-value">${accommodationCost}</p>
                <p className="detail-subtitle">Total for all hotels</p>
              </div>
            </div>
          )}

          {/* Special Events Information */}
          <div className="tour-detail-card">
            <Calendar className="detail-icon" />
            <div className="detail-content">
              <h4 className="detail-title">Special Events</h4>
              <p className="detail-value">
                {specialEventsCount > 0 ? `${specialEventsCount} events found` : 'No events found'}
              </p>
              <p className="detail-subtitle">
                Cultural events during your tour dates
              </p>
            </div>
          </div>
        </div>
        
        <div className="tour-title-display">
          <h2 className="tour-final-title">"{tourData.title || "Untitled Tour"}"</h2>
        </div>
        
        {/* Special Events Section */}
        <TourSpecialEvents 
          tourData={tourData}
          onEventsLoaded={(events) => {
            console.log('🎉 Special events loaded for tour confirmation:', events);
            setSpecialEventsCount(events.length);
          }}
        />
      </div>
    );
  };

  const renderPlacesList = () => {
    // Use optimized route if available, otherwise use original places
    const placesToShow = tourData.isRouteOptimized && tourData.optimizedRoute 
      ? tourData.optimizedRoute 
      : tourData.places;
    
    return (
      <div className="places-confirmation-list">
        <h4 className="places-list-title">
          {tourData.isRouteOptimized ? "Your Optimized Route:" : "Your Selected Places:"}
        </h4>
        <div className="places-grid">
          {placesToShow && placesToShow.map((item, index) => {
            if (tourData.isRouteOptimized && tourData.optimizedRoute) {
              // Display optimized route items
              return (
                <div key={item.id} className="place-confirmation-card">
                  <div className="place-number">{index + 1}</div>
                  <div className="place-info">
                    <h5 className="place-name">{item.name}</h5>
                    <p className="place-type">{item.type}</p>
                  </div>
                </div>
              );
            } else {
              // Display original places structure
              return (
                <div key={item.destination.id} className="place-confirmation-card">
                  <div className="place-number">{index + 1}</div>
                  <div className="place-info">
                    <h5 className="place-name">{item.destination.name}</h5>
                    <p className="place-type">Destination</p>
                    {item.subplaces.length > 0 && (
                      <div className="subplaces-list">
                        {item.subplaces.map((subplace) => (
                          <span key={subplace.id} className="subplace-tag">
                            {subplace.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  // Render hotel information if available
  const renderHotelsList = () => {
    if (!tourData.accommodations || tourData.accommodations.length === 0) return null;
    
    return (
      <div className="hotels-confirmation-list">
        <h4 className="hotels-list-title">Your Selected Hotels:</h4>
        <div className="hotels-grid">
          {tourData.accommodations.map((accommodation, index) => (
            <div key={accommodation.hotelId} className="hotel-confirmation-card">
              <div className="hotel-number">{index + 1}</div>
              <div className="hotel-info">
                <h5 className="hotel-name">{accommodation.hotelName}</h5>
                <p className="hotel-location">{accommodation.hotelLocation}</p>
                <div className="hotel-details">
                  <span className="hotel-price">${accommodation.hotelPrice} per night</span>
                  {accommodation.checkIn && accommodation.checkOut && (
                    <span className="hotel-dates">
                      {formatDateDisplay(accommodation.checkIn)} - {formatDateDisplay(accommodation.checkOut)}
                    </span>
                  )}
                  <span className="hotel-total">Total: ${accommodation.totalCost || accommodation.hotelPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">{isEditMode ? 'Edit Tour' : 'Tour Planner'}</h1>
          <p className="tour-page-subtitle">{isEditMode ? 'Update your tour details' : 'Plan your perfect adventure'}</p>
        </div>
        
        <StepIndicator currentStep={5} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <CheckCircle className="title-icon" />
              {isEditMode ? 'Update Tour' : 'Confirm Tour'}
            </h2>
            <p className="card-description">
              {isEditMode ? 'Review and update your tour details' : 'Review and confirm your tour details'}
            </p>
          </div>
          <div className="card-content">
            {renderTourSummary()}
            {renderPlacesList()}
            {renderHotelsList()}
          </div>
        </div>
        
        {/* Status Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            {isEditMode ? 'Tour updated successfully! Redirecting...' : 'Tour created successfully! Redirecting to your trips...'}
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            className="btn btn-outline"
            onClick={handlePrevious}
            disabled={loading}
          >
            <ArrowLeft className="btn-icon" />
            <span>Previous</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirmTour}
            disabled={loading}
          >
            <span>
              {loading 
                ? (isEditMode ? "Updating Tour..." : "Creating Tour...") 
                : (isEditMode ? "Update Tour" : "Confirm Tour")
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTourPage; 