import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { CheckCircle, ArrowLeft, Calendar, MapPin, Clock, Navigation } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import './ConfirmTourPage.css';

const API_URL = process.env.REACT_APP_URL;

const ConfirmTourPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tourData, resetTour } = useTour();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    const stops = [];
    tourData.places.forEach(({ destination, subplaces }) => {
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
    const reqBody = {
      userId,
      title: tourData.title || "New Tour",
      startDate: tourData.startDate,
      endDate: tourData.endDate,
      estimatedCost: 0, // You can update this if you collect cost
      route: {
        routeSource: "user",
        stops,
        totalDistance: tourData.totalDistance || 0 // Include the calculated distance
      }
    };

    console.log("📏 Tour data distance:", tourData.totalDistance);
    console.log("🚀 Sending tour creation request with distance:", reqBody.route.totalDistance);

    try {
      const res = await fetch(`${API_URL}/api/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to create tour.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Reset tour data after successful creation
      resetTour();
      setTimeout(() => navigate("/my-trips", { replace: true, state: { skipLoading: true } }), 1500);
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate('/finalize-route');
  };

  const renderTourSummary = () => (
    <div className="tour-confirmation-summary">
      <div className="confirmation-header">
        <CheckCircle className="confirmation-icon" />
        <h3 className="confirmation-title">Ready to Create Your Tour?</h3>
        <p className="confirmation-subtitle">Please review your tour details before confirming</p>
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
      </div>
      
      <div className="tour-title-display">
        <h2 className="tour-final-title">"{tourData.title || "Untitled Tour"}"</h2>
      </div>
    </div>
  );

  const renderPlacesList = () => (
    <div className="places-confirmation-list">
      <h4 className="places-list-title">Your Selected Places:</h4>
      <div className="places-grid">
        {tourData.places && tourData.places.map((item, index) => (
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
        ))}
      </div>
    </div>
  );

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">Tour Planner</h1>
          <p className="tour-page-subtitle">Plan your perfect adventure</p>
        </div>
        
        <StepIndicator currentStep={4} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <CheckCircle className="title-icon" />
              Confirm Tour
            </h2>
            <p className="card-description">
              Review and confirm your tour details
            </p>
          </div>
          <div className="card-content">
            {renderTourSummary()}
            {renderPlacesList()}
          </div>
        </div>
        
        {/* Status Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Tour created successfully! Redirecting to your trips...</div>}
        
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
            <span>{loading ? "Creating Tour..." : "Confirm Tour"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTourPage; 