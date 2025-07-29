import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapIcon } from 'lucide-react';
import './RouteMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for destinations and subplaces
const createCustomIcon = (number, type, isStartingPoint = false) => {
  const color = isStartingPoint ? '#ef4444' : (type === 'Destination' ? '#3b82f6' : '#10b981');
  const size = type === 'Destination' ? 35 : 30;
  const borderColor = isStartingPoint ? '#dc2626' : 'white';
  const borderWidth = isStartingPoint ? 4 : 3;
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-weight: 600;
        color: white;
        font-size: ${type === 'Destination' ? '12px' : '10px'};
      ">${isStartingPoint ? '🚀' : number}</div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Component to fit map bounds
const FitBounds = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points.length > 0) {
      const latLngs = points.map(point => [point.coordinates[1], point.coordinates[0]]);
      if (latLngs.length === 1) {
        map.setView(latLngs[0], 12);
      } else if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, points]);
  
  return null;
};

const RouteMap = ({ places = [], optimizedRoute = [], totalDistance }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [snappingWarnings, setSnappingWarnings] = useState([]);

  const routeToShow = optimizedRoute.length > 0 ? optimizedRoute : places;

  // Convert places to coordinates for mapping
  const [mapPoints, setMapPoints] = useState([]);
  
  // Effect to geocode places and update map points
  useEffect(() => {
    const geocodePlaces = async () => {
      const points = [];
      
      if (optimizedRoute.length > 0) {
        // Use optimized route order
        for (let i = 0; i < optimizedRoute.length; i++) {
          const place = optimizedRoute[i];
          const coords = await getCoordinatesForPlace(place);
          if (coords) {
            points.push({
              ...place,
              coordinates: coords,
              order: i + 1,
              isStartingPoint: place.isStartingPoint || false
            });
          }
        }
      } else if (places.length > 0) {
        // Use original places order
        let order = 1;
        for (const { destination, subplaces, isStartingPoint } of places) {
          const coords = await getCoordinatesForPlace(destination);
          if (coords) {
            points.push({
              ...destination,
              coordinates: coords,
              order: order++,
              type: 'Destination',
              isStartingPoint: isStartingPoint || false
            });
          }
          
          for (const subplace of subplaces) {
            const subCoords = await getCoordinatesForPlace(subplace);
            if (subCoords) {
              points.push({
                ...subplace,
                coordinates: subCoords,
                order: order++,
                type: 'SubPlace'
              });
            }
          }
        }
      }
      
      setMapPoints(points);
    };
    
    geocodePlaces();
  }, [places, optimizedRoute]);

  // Function to get coordinates for a place using database only
  async function getCoordinatesForPlace(place) {
    try {
      // Call our new coordinate lookup endpoint
      const response = await fetch(`${process.env.REACT_APP_URL || 'http://localhost:8080'}/api/tours/get-place-coordinates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: place.id,
          name: place.name,
          type: place.type || 'Destination'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.coordinates) {
          console.log(`📍 Found ${place.name} at [${data.coordinates[0]}, ${data.coordinates[1]}]`);
          return data.coordinates;
        } else {
          console.log(`⚠️ No coordinates found for ${place.name}: ${data.message}`);
        }
      }
    } catch (error) {
      console.error('Coordinate lookup failed for', place.name, ':', error);
    }
    
    // Ultimate fallback - use Dhaka coordinates
    return [90.4125, 23.8103];
  }

  // Enhanced route fetching with coordinate snapping
  const fetchRoute = async (coordinates) => {
    if (coordinates.length < 2) {
      setRouteCoordinates([]);
      return;
    }

    setIsLoadingRoute(true);
    setRouteError(null);
    setSnappingWarnings([]);
    
    try {
      // Convert coordinates to the format expected by backend [lng, lat]
      const backendCoordinates = coordinates.map(coord => [coord[0], coord[1]]);
      
      console.log('🔄 Calling enhanced route endpoint with coordinate snapping...');
      
      // Call our enhanced backend endpoint with coordinate snapping
      const response = await fetch(`${process.env.REACT_APP_URL || 'http://localhost:8080'}/api/tours/fetch-route-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: backendCoordinates
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.coordinates) {
        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
        const routeCoords = data.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(routeCoords);
        
        // Handle snapping warnings
        if (data.snappingWarnings && data.snappingWarnings.length > 0) {
          setSnappingWarnings(data.snappingWarnings);
          console.log('📍 Coordinate snapping warnings:', data.snappingWarnings);
        }
        
        if (data.distance) {
          console.log(`📏 Route distance: ${data.distance} km`);
        }
        
        if (data.success && data.method === 'road_route') {
          console.log('✅ Actual road route displayed successfully');
          setRouteError(null);
        } else {
          console.log('⚠️ Using fallback route with snapped coordinates');
          setRouteError(data.message || 'Using direct lines between snapped points');
        }
      } else {
        // Ultimate fallback to straight lines between original points
        const fallbackRoute = coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(fallbackRoute);
        setRouteError('Route service unavailable - using direct lines');
      }
    } catch (error) {
      console.error('Error fetching enhanced route:', error);
      setRouteError('Route service unavailable');
      
      // Fallback to straight lines between points
      const fallbackRoute = coordinates.map(coord => [coord[1], coord[0]]);
      setRouteCoordinates(fallbackRoute);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Fetch route when map points change
  useEffect(() => {
    if (mapPoints.length > 1) {
      const coordinates = mapPoints.map(point => point.coordinates);
      fetchRoute(coordinates);
    } else {
      setRouteCoordinates([]);
    }
  }, [mapPoints]);

  if (mapPoints.length === 0) {
    return (
      <div className="route-map">
        <div className="route-map-header">
          <h4>Route Visualization</h4>
          {totalDistance && (
            <span className="map-distance">Total: {totalDistance} km</span>
          )}
        </div>
        
        <div className="route-map-error">
          <MapIcon className="map-icon" />
          <h5>No Route to Display</h5>
          <p>Select some destinations and subplaces to see the route on the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-map">
      <div className="route-map-header">
        <h4>Route Visualization</h4>
        <div className="map-header-info">
          {totalDistance && (
            <span className="map-distance">Total: {totalDistance} km</span>
          )}
          {isLoadingRoute && (
            <span className="loading-indicator">Loading route...</span>
          )}
        </div>
      </div>
      
      <div className="map-container">
        <MapContainer 
          center={[23.8103, 90.4125]} 
          zoom={6} 
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Fit bounds to show all points */}
          <FitBounds points={mapPoints} />
          
          {/* Route line */}
          {routeCoordinates.length > 1 && (
            <Polyline 
              positions={routeCoordinates}
              color="#6366f1"
              weight={4}
              opacity={0.8}
            />
          )}
          
          {/* Place markers */}
          {mapPoints.map((point, index) => (
            <Marker
              key={`${point.type}-${point.id}`}
              position={[point.coordinates[1], point.coordinates[0]]}
              icon={createCustomIcon(point.order, point.type, point.isStartingPoint)}
            >
              <Popup>
                <div className="marker-popup">
                  <strong>{point.name}</strong><br />
                  <small>{point.type}</small><br />
                  <small>Stop #{point.order}</small>
                  {point.isStartingPoint && (
                    <><br /><small style={{color: '#ef4444', fontWeight: 'bold'}}>🚀 Starting Point</small></>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {routeError && (
          <div className="map-error-overlay">
            <p>Route Error: {routeError}</p>
            <small>Showing direct lines due to routing service limitations</small>
          </div>
        )}
      </div>
      
      {/* Snapping warnings */}
      {snappingWarnings.length > 0 && (
        <div className="snapping-warnings">
          <h6>Coordinate Adjustments:</h6>
          <ul>
            {snappingWarnings.map((warning, index) => (
              <li key={index} className="snapping-warning">
                {warning}
              </li>
            ))}
          </ul>
          <small>Places were moved to nearest accessible roads for routing.</small>
        </div>
      )}
      
      <div className="route-info">
        <p>
          <strong>{mapPoints.length} stops</strong> • 
          Powered by <a href="https://openrouteservice.org/" target="_blank" rel="noopener noreferrer">OpenRouteService</a> & 
          <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
        </p>
        {routeError && (
          <p className="route-warning">
            Note: Using direct lines due to routing service limitations
          </p>
        )}
      </div>
    </div>
  );
};

export default RouteMap; 