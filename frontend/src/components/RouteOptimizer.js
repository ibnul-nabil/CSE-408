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
      places.forEach(({ destination, subplaces }) => {
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
        body: JSON.stringify({ places: routePlaces })
      });

      if (!response.ok) throw new Error('Failed to calculate distance');
      
      const data = await response.json();
      setTotalDistance(data.totalDistance);
    } catch (err) {
      console.error('Distance calculation failed:', err);
      setTotalDistance(null);
    }
  }, []);

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
        body: JSON.stringify({ places: optimizedPlaces })
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
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPlaces = [...optimizedPlaces];
    const draggedPlace = newPlaces[draggedIndex];
    
    // Remove dragged item
    newPlaces.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newPlaces.splice(insertIndex, 0, draggedPlace);
    
    setOptimizedPlaces(newPlaces);
    setDraggedIndex(null);
    
    // Recalculate distance for new order
    calculateCurrentDistance(newPlaces);
    
    // Update tour context
    setOptimizedRoute(newPlaces, null); // Distance will be calculated async
    
    if (onRouteChange) {
      onRouteChange(newPlaces, null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Remove place from route
  const removePlace = (index) => {
    const newPlaces = optimizedPlaces.filter((_, i) => i !== index);
    setOptimizedPlaces(newPlaces);
    calculateCurrentDistance(newPlaces);
    
    setOptimizedRoute(newPlaces, null);
    if (onRouteChange) {
      onRouteChange(newPlaces, null);
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
        
        {optimizedPlaces.map((place, index) => (
          <div
            key={`${place.type}-${place.id}`}
            className={`route-place-item ${place.type.toLowerCase()}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="route-place-drag-handle">
              <GripVertical className="drag-icon" />
            </div>
            <div className="route-place-info">
              <div className="route-place-number">{index + 1}</div>
              <div className="route-place-details">
                <h4 className="route-place-name">{place.name}</h4>
                <span className="route-place-type">{place.type}</span>
              </div>
            </div>
            <button
              className="route-place-remove"
              onClick={() => removePlace(index)}
              title="Remove from route"
            >
              <X className="remove-icon" />
            </button>
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
            places={places}
            optimizedRoute={optimizedPlaces}
            totalDistance={totalDistance}
          />
        </div>
      )}
    </div>
  );
};

export default RouteOptimizer; 