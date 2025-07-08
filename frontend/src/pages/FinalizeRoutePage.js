import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { RouteIcon, ArrowLeft } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import './FinalizeRoutePage.css';

const API_URL = process.env.REACT_APP_URL;

const FinalizeRoutePage = () => {
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
        stops
      }
    };

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
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate('/select-places');
  };

  const renderRoutePreview = () => (
    <div className="route-preview">
      {tourData.places && tourData.places.map((item, index) => (
        <div key={item.destination.id} className="route-stop">
          <div className="route-stop-indicator">
            <div className="route-stop-number">
              {index + 1}
            </div>
            {index < tourData.places.length - 1 && (
              <div className="route-connector"></div>
            )}
          </div>
          <div className="route-stop-content">
            <h4 className="route-stop-title">{item.destination.name}</h4>
            <p className="route-stop-type">Destination</p>
            {item.subplaces.length > 0 && (
              <div className="route-subplaces">
                {item.subplaces.map((subplace, subIndex) => (
                  <div key={subplace.id} className="route-subplace">
                    <div className="route-subplace-dot"></div>
                    <span className="route-subplace-name">{subplace.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTourSummary = () => (
    <div className="tour-summary">
      <h3 className="tour-summary-title">{tourData.title || "Untitled Tour"}</h3>
      <div className="tour-summary-details">
        <div className="tour-summary-item">
          <span className="tour-summary-label">Start Date:</span>
          <span className="tour-summary-value">{formatDateDisplay(tourData.startDate)}</span>
        </div>
        <div className="tour-summary-item">
          <span className="tour-summary-label">End Date:</span>
          <span className="tour-summary-value">{formatDateDisplay(tourData.endDate)}</span>
        </div>
        <div className="tour-summary-item">
          <span className="tour-summary-label">Places:</span>
          <span className="tour-summary-value">{tourData.places?.length || 0} destinations</span>
        </div>
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
        
        <StepIndicator currentStep={3} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <RouteIcon className="title-icon" />
              Route Preview
            </h2>
            <p className="card-description">
              Here's your planned route
            </p>
          </div>
          <div className="card-content">
            {renderTourSummary()}
            
            {tourData.places && tourData.places.length === 0 ? (
              <div className="empty-state">
                <p>No route selected.</p>
              </div>
            ) : (
              renderRoutePreview()
            )}
          </div>
        </div>
        
        {/* Status Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Tour created! Redirecting...</div>}
        
        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            className="btn btn-outline"
            onClick={handlePrevious}
          >
            <ArrowLeft className="btn-icon" />
            Previous
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirmTour}
            disabled={loading}
          >
            {loading ? "Creating Tour..." : "Confirm Tour"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalizeRoutePage; 