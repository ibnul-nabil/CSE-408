import React, { useState, useEffect, useCallback } from 'react';
import { useTour } from '../context/TourContext';
import { MapIcon, Navigation, Shuffle, GripVertical, X, CheckCircle } from 'lucide-react';
import RouteMap from './RouteMap';
import './RouteOptimizer.css';

const API_URL = process.env.REACT_APP_URL;

const RouteOptimizer = ({ places = [], onRouteChange }) => {
  const { tourData, setOptimizedRoute } = useTour();
  const [optimizedPlaces, setOptimizedPlaces] = useState([]);
  const [totalDistance, setTotalDistance] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Initialize with current places
  useEffect(() => {
    if (tourData.isRouteOptimized && tourData.optimizedRoute) {
      setOptimizedPlaces(tourData.optimizedRoute);
      setTotalDistance(tourData.totalDistance);
    } else if (places.length > 0) {
      // Convert places to format expected by optimizer
      const formattedPlaces = [];
      
      // Add starting point first if it exists
      const startingPointPlace = places.find(place => place.isStartingPoint);
      if (startingPointPlace) {
        formattedPlaces.push({
          id: startingPointPlace.destination.id,
          name: startingPointPlace.destination.name,
          type: 'Destination',
          isStartingPoint: true
        });
        startingPointPlace.subplaces.forEach(sub => {
          formattedPlaces.push({
            id: sub.id,
            name: sub.name,
            type: 'SubPlace',
            parentDestinationId: startingPointPlace.destination.id
          });
        });
      }
      
      // Add other places
      places.forEach(({ destination, subplaces, isStartingPoint }) => {
        // Skip if this is the starting point (already added)
        if (isStartingPoint) {
          return;
        }
        
        formattedPlaces.push({
          id: destination.id,
          name: destination.name,
          type: 'Destination'
        });
        subplaces.forEach(sub => {
          formattedPlaces.push({
            id: sub.id,
            name: sub.name,
            type: 'SubPlace',
            parentDestinationId: destination.id
          });
        });
      });
      setOptimizedPlaces(formattedPlaces);
    }
  }, [places, tourData.isRouteOptimized, tourData.optimizedRoute, tourData.totalDistance]);

  // Calculate route distance for current order
  const calculateCurrentDistance = useCallback(async (routePlaces) => {
    if (routePlaces.length < 2) {
      setTotalDistance(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/tours/optimize-route-ors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          places: routePlaces,
          startingPoint: tourData.startingPoint 
        })
      });

      if (!response.ok) throw new Error('Failed to calculate distance');
      
      const data = await response.json();
      setTotalDistance(data.totalDistance);
    } catch (err) {
      console.error('Distance calculation failed:', err);
      setTotalDistance(null);
    }
  }, [tourData.startingPoint]);

  // Calculate initial distance when places are loaded
  useEffect(() => {
    if (optimizedPlaces.length >= 2) {
      calculateCurrentDistance(optimizedPlaces);
    }
  }, [optimizedPlaces, calculateCurrentDistance]);

  // Optimize route using backend API
  const optimizeRoute = async () => {
    if (optimizedPlaces.length < 2) {
      setError('Need at least 2 places to optimize route');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/tours/optimize-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          places: optimizedPlaces,
          startingPoint: tourData.startingPoint 
        })
      });

      if (!response.ok) throw new Error('Route optimization failed');
      
      const data = await response.json();
      
      setOptimizedPlaces(data.optimizedRoute);
      setTotalDistance(data.totalDistance);
      
      // Update tour context
      setOptimizedRoute(data.optimizedRoute, data.totalDistance);
      
      // Notify parent component
      if (onRouteChange) {
        onRouteChange(data.optimizedRoute, data.totalDistance);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle drag and drop reordering
  const handleDragStart = (e, index) => {
    const place = optimizedPlaces[index];
    
    // Prevent dragging starting point if disabled
    if (place.isStartingPoint) {
      e.preventDefault();
      return;
    }
    
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    
    // Check if trying to drop on the starting point position
    const startingPointIndex = optimizedPlaces.findIndex(place => place.isStartingPoint);
    if (startingPointIndex !== -1) {
      // Get the drop target index
      const targetElement = e.currentTarget;
      const placeItems = targetElement.querySelectorAll('.route-place-item');
      let dropIndex = -1;
      
      for (let i = 0; i < placeItems.length; i++) {
        if (placeItems[i] === e.target.closest('.route-place-item')) {
          dropIndex = i;
          break;
        }
      }
      
      // If trying to drop on the starting point position, show invalid cursor
      if (dropIndex === startingPointIndex) {
        e.dataTransfer.dropEffect = 'none';
        return;
      }
    }
    
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Prevent moving the starting point itself
    const draggedPlace = optimizedPlaces[draggedIndex];
    if (draggedPlace.isStartingPoint) {
      setDraggedIndex(null);
      return;
    }

    // Prevent dropping on the starting point position (but allow dropping after it)
    const startingPointIndex = optimizedPlaces.findIndex(place => place.isStartingPoint);
    if (startingPointIndex !== -1 && dropIndex === startingPointIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPlaces = [...optimizedPlaces];
    const draggedPlaceItem = newPlaces[draggedIndex];
    
    // Remove dragged item
    newPlaces.splice(draggedIndex, 1);
    
    // Insert at new position
    newPlaces.splice(dropIndex, 0, draggedPlaceItem);
    
    setOptimizedPlaces(newPlaces);
    setDraggedIndex(null);
    
    // Update tour context
    setOptimizedRoute(newPlaces, totalDistance);
    
    // Notify parent component
    if (onRouteChange) {
      onRouteChange(newPlaces, totalDistance);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Remove place from route
  const removePlace = (index) => {
    const placeToRemove = optimizedPlaces[index];
    
    // Prevent removing the starting point
    if (placeToRemove.isStartingPoint) {
      return;
    }
    
    const newPlaces = optimizedPlaces.filter((_, i) => i !== index);
    setOptimizedPlaces(newPlaces);
    
    // Update tour context
    setOptimizedRoute(newPlaces, totalDistance);
    
    // Notify parent component
    if (onRouteChange) {
      onRouteChange(newPlaces, totalDistance);
    }
  };

  // Group places by destination for better visualization
  const groupedPlaces = optimizedPlaces.reduce((groups, place, index) => {
    if (place.type === 'Destination') {
      groups.push({
        destination: place,
        subplaces: [],
        startIndex: index
      });
    } else if (place.type === 'SubPlace' && groups.length > 0) {
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup.destination || 
          (place.parentDestinationId && place.parentDestinationId === lastGroup.destination.id)) {
        lastGroup.subplaces.push({ place, originalIndex: index });
      } else {
        // SubPlace doesn't belong to last destination, create separate group
        groups.push({
          destination: null,
          subplaces: [{ place, originalIndex: index }],
          startIndex: index
        });
      }
    }
    return groups;
  }, []);

  return (
    <div className="route-optimizer">
      <div className="route-optimizer-header">
        <h3 className="route-optimizer-title">
          <Navigation className="route-icon" />
          Route Optimization
        </h3>
        <div className="route-optimizer-actions">
          <button
            className="btn btn-secondary"
            onClick={optimizeRoute}
            disabled={isOptimizing || optimizedPlaces.length < 2}
          >
            {isOptimizing ? (
              <>
                <div className="spinner" />
                Optimizing...
              </>
            ) : (
              <>
                <Shuffle className="btn-icon" />
                Optimize Route
              </>
            )}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowMap(!showMap)}
          >
            <MapIcon className="btn-icon" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>

      {error && (
        <div className="route-optimizer-error">
          <X className="error-icon" />
          {error}
        </div>
      )}

      {totalDistance !== null && (
        <div className="route-distance-info">
          <CheckCircle className="distance-icon" />
          <span>Total Distance: <strong>{totalDistance} km</strong></span>
          {tourData.isRouteOptimized && (
            <span className="optimized-badge">Optimized</span>
          )}
        </div>
      )}

      <div className="route-places-list">
        <p className="route-places-instruction">
          Drag and drop to reorder places, or click optimize for the shortest route
        </p>
        
        {/* Starting point protection notice */}
        {optimizedPlaces.some(place => place.isStartingPoint) && (
          <div className="starting-point-notice">
            <span className="notice-icon">🚀</span>
            <span className="notice-text">Starting point is fixed and cannot be moved</span>
          </div>
        )}
        
        {optimizedPlaces.map((place, index) => (
          <div
            key={`${place.type}-${place.id}`}
            className={`route-place-item ${place.type.toLowerCase()} ${place.isStartingPoint ? 'starting-point' : ''}`}
            draggable={!place.isStartingPoint}
            onDragStart={(e) => {
              if (!place.isStartingPoint) {
                handleDragStart(e, index);
              }
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="route-place-drag-handle">
              {place.isStartingPoint ? (
                <span className="starting-point-icon">🚀</span>
              ) : (
                <GripVertical className="drag-icon" />
              )}
            </div>
            <div className="route-place-info">
              <div className="route-place-number">{index + 1}</div>
              <div className="route-place-details">
                <h4 className="route-place-name">{place.name}</h4>
                <span className="route-place-type">
                  {place.isStartingPoint ? 'Starting Point' : place.type}
                </span>
              </div>
            </div>
            {!place.isStartingPoint && (
              <button
                className="route-place-remove"
                onClick={() => removePlace(index)}
                title="Remove from route"
              >
                <X className="remove-icon" />
              </button>
            )}
          </div>
        ))}

        {optimizedPlaces.length === 0 && (
          <div className="route-places-empty">
            <MapIcon className="empty-icon" />
            <p>No places selected for route optimization</p>
          </div>
        )}
      </div>

      {showMap && (
        <div className="route-map-container">
          <RouteMap 
            places={optimizedPlaces}
            optimizedRoute={optimizedPlaces}
            totalDistance={totalDistance}
          />
        </div>
      )}
    </div>
  );
};

export default RouteOptimizer; 