import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { RouteIcon, ArrowLeft, MapIcon } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import RouteOptimizer from '../components/RouteOptimizer';
import './FinalizeRoutePage.css';

const FinalizeRoutePage = () => {
  const navigate = useNavigate();
  const { tourData } = useTour();
  const [showOptimizer, setShowOptimizer] = useState(true);

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

  const handleRouteChange = (optimizedRoute, totalDistance) => {
    // This will be called when the route is optimized or reordered
    console.log('Route updated:', optimizedRoute, 'Distance:', totalDistance);
  };

  const renderRoutePreview = () => {
    // If we have an optimized route, show that instead
    const routeToShow = tourData.isRouteOptimized && tourData.optimizedRoute 
      ? tourData.optimizedRoute 
      : tourData.places;

    if (tourData.isRouteOptimized && tourData.optimizedRoute) {
      return (
        <div className="route-preview optimized">
          <div className="route-preview-header">
            <h4>Optimized Route</h4>
            {tourData.totalDistance && (
              <span className="route-distance">
                Total Distance: {tourData.totalDistance} km
              </span>
            )}
          </div>
          {tourData.optimizedRoute.map((place, index) => (
            <div key={`${place.type}-${place.id}`} className="route-stop optimized-stop">
              <div className="route-stop-indicator">
                <div className="route-stop-number">
                  {index + 1}
                </div>
                {index < tourData.optimizedRoute.length - 1 && (
                  <div className="route-connector"></div>
                )}
              </div>
              <div className="route-stop-content">
                <h4 className="route-stop-title">{place.name}</h4>
                <p className="route-stop-type">{place.type}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Original route preview
    return (
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
  };

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
        {tourData.totalDistance && (
          <div className="tour-summary-item">
            <span className="tour-summary-label">Total Distance:</span>
            <span className="tour-summary-value">{tourData.totalDistance} km</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">Tour Planner</h1>
          <p className="tour-page-subtitle">Optimize your route and finalize your tour</p>
        </div>
        
        <StepIndicator currentStep={3} />
        
        {/* Route Optimizer Component */}
        {showOptimizer && tourData.places && tourData.places.length > 0 && (
          <RouteOptimizer 
            places={tourData.places} 
            onRouteChange={handleRouteChange}
          />
        )}
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <RouteIcon className="title-icon" />
              Route Preview
            </h2>
            <p className="card-description">
              {tourData.isRouteOptimized 
                ? "Your optimized route is ready" 
                : "Here's your planned route"
              }
            </p>
            {tourData.places && tourData.places.length > 1 && (
              <button
                className="toggle-optimizer-btn"
                onClick={() => setShowOptimizer(!showOptimizer)}
              >
                <MapIcon className="btn-icon" />
                {showOptimizer ? 'Hide Optimizer' : 'Show Route Optimizer'}
              </button>
            )}
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