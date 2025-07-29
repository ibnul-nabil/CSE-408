import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import './TourSpecialEvents.css';

const API_URL = process.env.REACT_APP_URL;

const TourSpecialEvents = ({ tourData, onEventsLoaded }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTourEvents = async () => {
            if (!tourData.places || !tourData.startDate || !tourData.endDate) {
                console.log('❌ TourSpecialEvents: Missing required data:', {
                    hasPlaces: !!tourData.places,
                    hasStartDate: !!tourData.startDate,
                    hasEndDate: !!tourData.endDate,
                    placesLength: tourData.places?.length
                });
                return;
            }
            
            console.log('🎉 TourSpecialEvents: Starting to fetch events for tour:', {
                placesCount: tourData.places.length,
                startDate: tourData.startDate,
                endDate: tourData.endDate,
                API_URL: API_URL
            });
            
            setLoading(true);
            setError(null);
            
            try {
                const allEvents = [];
                
                // Fetch events for each destination in the tour
                for (const place of tourData.places) {
                    console.log('🎯 TourSpecialEvents: Processing place:', place);
                    
                    // Handle different data structures
                    let destinationId = null;
                    let destinationName = null;
                    
                    if (place.destination && place.destination.id) {
                        // Structure from tour creation context
                        destinationId = place.destination.id;
                        destinationName = place.destination.name;
                    } else if (place.destinationId) {
                        // Structure from backend API (TourResponseDTO.PlaceInfo)
                        destinationId = place.destinationId;
                        destinationName = place.name;
                    } else if (place.id) {
                        // Fallback structure
                        destinationId = place.id;
                        destinationName = place.name;
                    }
                    
                    if (destinationId) {
                        console.log('🎯 TourSpecialEvents: Fetching events for destination:', destinationName, 'ID:', destinationId);
                        try {
                            const url = `${API_URL}/api/tours/special-events/suggestions/${destinationId}?tourStartDate=${tourData.startDate}&tourEndDate=${tourData.endDate}`;
                            console.log('🌐 TourSpecialEvents: Fetching from URL:', url);
                            
                            const response = await fetch(url);
                            
                            if (response.ok) {
                                const destinationEvents = await response.json();
                                console.log('✅ TourSpecialEvents: Received events for', destinationName, ':', destinationEvents);
                                // Add destination name to each event for context
                                const eventsWithDestination = destinationEvents.map(event => ({
                                    ...event,
                                    destinationName: destinationName
                                }));
                                allEvents.push(...eventsWithDestination);
                            } else {
                                console.log('❌ TourSpecialEvents: Failed to fetch events for', destinationName, 'Status:', response.status);
                            }
                        } catch (err) {
                            console.error(`Error fetching events for ${destinationName}:`, err);
                        }
                    } else {
                        console.log('❌ TourSpecialEvents: Place missing destination ID:', place);
                    }
                }
                
                // Remove duplicates based on event ID
                const uniqueEvents = allEvents.filter((event, index, self) => 
                    index === self.findIndex(e => e.id === event.id)
                );
                
                setEvents(uniqueEvents);
                
                // Notify parent component about loaded events
                if (onEventsLoaded) {
                    onEventsLoaded(uniqueEvents);
                }
                
                console.log('🎉 Loaded special events for tour:', uniqueEvents);
                
            } catch (err) {
                console.error('❌ Error fetching tour events:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTourEvents();
    }, [tourData.places, tourData.startDate, tourData.endDate, onEventsLoaded]);

    if (loading) return <div className="tour-events-loading">Loading special events...</div>;
    if (error) return <div className="tour-events-error">{error}</div>;
    if (!events.length) return null;

    return (
        <div className="tour-special-events">
            <h3>🎉 Special Events During Your Tour</h3>
            <p className="events-subtitle">
                Cultural events and festivals happening during your travel dates
            </p>
            <div className="tour-events-grid">
                {events.map(event => (
                    <div key={event.id} className="tour-event-card">
                        <div className="event-header">
                            <Calendar className="event-icon" />
                            <h4>{event.eventName}</h4>
                        </div>
                        <div className="event-details">
                            <div className="event-date">
                                <Clock className="detail-icon" />
                                <span>{event.dateRange}</span>
                            </div>
                            <div className="event-location">
                                <MapPin className="detail-icon" />
                                <span>{event.destinationName}</span>
                            </div>
                            <p className="event-description">
                                {event.description.length > 120 ? 
                                    event.description.substring(0, 120) + '...' : 
                                    event.description}
                            </p>
                            {event.suggestionMessage && (
                                <div className="event-suggestion">
                                    <span className="suggestion-badge">💡 Suggestion</span>
                                    <p>{event.suggestionMessage}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourSpecialEvents; 