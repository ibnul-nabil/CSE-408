import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { RouteIcon, ArrowLeft, MapIcon } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import RouteOptimizer from '../components/RouteOptimizer';
import TourSpecialEvents from '../components/TourSpecialEvents';
import './FinalizeRoutePage.css';

const FinalizeRoutePage = ({ isEditMode = false, onPrevious, onNext }) => {
  const navigate = useNavigate();
  const { tourData } = useTour();
  const [showOptimizer, setShowOptimizer] = useState(true);
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

  const handleNext = () => {
    if (isEditMode && onNext) {
      onNext();
    } else {
      navigate('/confirm-tour');
    }
  };

  const handlePrevious = () => {
    if (isEditMode && onPrevious) {
      onPrevious();
    } else {
      navigate('/select-hotels');
    }
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
              {item.subplaces && item.subplaces.length > 0 && (
                <div className="route-subplaces">
                  <span className="subplaces-label">Sub-places:</span>
                  <div className="subplaces-list">
                    {item.subplaces.map((subplace, subIndex) => (
                      <span key={subIndex} className="subplace-tag">
                        {subplace.name}
                      </span>
                    ))}
                  </div>
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
      <div className="summary-header">
        <h3>Tour Summary</h3>
      </div>
      <div className="summary-content">
        <div className="summary-item">
          <span className="summary-label">Tour Title:</span>
          <span className="summary-value">{tourData.title || 'Untitled Tour'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Duration:</span>
          <span className="summary-value">
            {tourData.startDate && tourData.endDate 
              ? `${formatDateDisplay(tourData.startDate)} - ${formatDateDisplay(tourData.endDate)}`
              : 'Not set'
            }
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Destinations:</span>
          <span className="summary-value">{tourData.places?.length || 0} places</span>
        </div>
        {tourData.accommodations && tourData.accommodations.length > 0 && (
          <div className="summary-item">
            <span className="summary-label">Hotels:</span>
            <span className="summary-value">{tourData.accommodations.length} selected</span>
          </div>
        )}
        <div className="summary-item">
          <span className="summary-label">Special Events:</span>
          <span className="summary-value">
            {specialEventsCount > 0 ? `${specialEventsCount} found` : 'None found'}
          </span>
        </div>
      </div>
      
      {/* Special Events Section */}
      <TourSpecialEvents 
        tourData={tourData}
        onEventsLoaded={(events) => {
          console.log('🎉 Special events loaded for tour summary:', events);
          setSpecialEventsCount(events.length);
        }}
      />
    </div>
  );

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">{isEditMode ? 'Edit Tour' : 'Tour Planner'}</h1>
          <p className="tour-page-subtitle">{isEditMode ? 'Finalize your route changes' : 'Finalize your route'}</p>
        </div>
        
        <StepIndicator currentStep={4} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <RouteIcon className="title-icon" />
              {isEditMode ? 'Update Route' : 'Finalize Route'}
            </h2>
            <p className="card-description">
              {isEditMode ? 'Review and optimize your route changes' : 'Review and optimize your route'}
            </p>
          </div>
          <div className="card-content">
            {renderTourSummary()}
            {renderRoutePreview()}
            
            <div className="route-optimizer-section">
              <RouteOptimizer 
                places={tourData.places}
                onRouteChange={handleRouteChange}
                showOptimizer={showOptimizer}
                onToggleOptimizer={() => setShowOptimizer(!showOptimizer)}
              />
            </div>
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