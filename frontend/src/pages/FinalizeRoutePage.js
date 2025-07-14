import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { RouteIcon, ArrowLeft } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import './FinalizeRoutePage.css';

const FinalizeRoutePage = () => {
  const navigate = useNavigate();
  const { tourData } = useTour();

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

  const handleNext = () => {
    navigate('/confirm-tour');
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
        
        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            className="btn btn-outline"
            onClick={handlePrevious}
          >
            <ArrowLeft className="btn-icon" />
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

export default FinalizeRoutePage; 