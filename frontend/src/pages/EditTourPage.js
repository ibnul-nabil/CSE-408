import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTour } from '../context/TourContext';
import CreateTourInfoPage from './CreateTourInfoPage';
import CreateTourPage from './CreateTourPage';
import './EditTourPage.css';

const EditTourPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTourInfo, setPlaces, setEditMode, resetTour } = useTour();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Tour Info, 2: Destinations

  useEffect(() => {
    const loadTourForEditing = async () => {
      try {
        console.log('🔄 Starting to load tour for editing, ID:', id);
        setLoading(true);
        
        // Check if required functions are available
        if (!setTourInfo || !setPlaces || !setEditMode || !resetTour) {
          console.error('❌ Required context functions not available');
          setError('Context functions not available');
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('❌ No token found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('🌐 Making API call to:', `http://localhost:8080/api/tours/${id}`);
        const response = await fetch(`http://localhost:8080/api/tours/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 API response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('❌ Unauthorized, redirecting to login');
            navigate('/login');
            return;
          }
          throw new Error('Failed to load tour for editing');
        }

        const tourData = await response.json();
        console.log('📦 Received tour data:', tourData);
        console.log('📦 Places structure:', tourData.places);
        
        // Reset the tour context first
        resetTour();
        
        // Set tour info
        setTourInfo(
          tourData.title || '',
          tourData.startDate || '',
          tourData.endDate || '',
          tourData.estimatedCost || null
        );
        
        // Set edit mode
        setEditMode(true, id);
        
        // Group places by destination
        const destinationMap = new Map();
        const missingDestinations = new Set();
        
        // First pass: collect all destinations
        tourData.places?.forEach(place => {
          console.log('🔄 Processing place:', place);
          
          if (place.type === 'Destination') {
            destinationMap.set(place.destinationId, {
              destination: {
                id: place.destinationId,
                name: place.name,
                type: place.type
              },
              subplaces: []
            });
          }
        });
        
        // Second pass: add sub-places to their parent destinations
        tourData.places?.forEach(place => {
          if (place.type === 'SubPlace' && place.parentDestinationId) {
            const parentDestination = destinationMap.get(place.parentDestinationId);
            if (parentDestination) {
              parentDestination.subplaces.push({
                id: place.destinationId, // This is the sub-place ID
                name: place.name,
                type: place.type
              });
            } else {
              // Track missing destinations
              missingDestinations.add(place.parentDestinationId);
              
              // Create or update destination entry
              if (!destinationMap.has(place.parentDestinationId)) {
                destinationMap.set(place.parentDestinationId, {
                  destination: {
                    id: place.parentDestinationId,
                    name: `Loading...`, // Will be updated
                    type: 'Destination'
                  },
                  subplaces: []
                });
              }
              
              destinationMap.get(place.parentDestinationId).subplaces.push({
                id: place.destinationId,
                name: place.name,
                type: place.type
              });
            }
          }
        });
        
        // Fetch missing destination information
        if (missingDestinations.size > 0) {
          console.log('🔍 Fetching missing destinations:', Array.from(missingDestinations));
          
          // Fetch destination names for missing destinations
          for (const destId of missingDestinations) {
            try {
              const destResponse = await fetch(`http://localhost:8080/api/destinations/${destId}`);
              if (destResponse.ok) {
                const destData = await destResponse.json();
                const destEntry = destinationMap.get(destId);
                if (destEntry) {
                  destEntry.destination.name = destData.name;
                  destEntry.destination.type = destData.type;
                }
              }
            } catch (err) {
              console.error(`Failed to fetch destination ${destId}:`, err);
            }
          }
        }
        
        // Convert map to array
        const formattedPlaces = Array.from(destinationMap.values());
        
        console.log('✅ Formatted places for context:', formattedPlaces);
        setPlaces(formattedPlaces);
        
        console.log('✅ Tour data loaded for editing:', { 
          title: tourData.title, 
          places: formattedPlaces 
        });
        console.log('✅ Setting loading to false');
      } catch (err) {
        console.error('❌ Error loading tour for editing:', err);
        setError(err.message);
      } finally {
        console.log('🔄 Finally block: Setting loading to false');
        setLoading(false);
      }
    };

    loadTourForEditing();
  }, [id]);

  if (loading) {
    return (
      <div className="edit-tour-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading tour for editing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-tour-container">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn" onClick={() => navigate('/my-trips')}>
            <span>Back to My Trips</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle step navigation
  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  // Render the appropriate component based on current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <CreateTourInfoPage isEditMode={true} onNext={() => handleStepChange(2)} />;
      case 2:
        return <CreateTourPage isEditMode={true} onPrevious={() => handleStepChange(1)} />;
      default:
        return <CreateTourInfoPage isEditMode={true} onNext={() => handleStepChange(2)} />;
    }
  };

  return renderCurrentStep();
};

export default EditTourPage; 