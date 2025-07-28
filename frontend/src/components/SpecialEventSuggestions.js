import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import './SpecialEventSuggestions.css';

const API_URL = process.env.REACT_APP_URL;

const SpecialEventSuggestions = ({ destinationId, destinationName, tourStartDate, tourEndDate }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!destinationId || !tourStartDate || !tourEndDate) {
                return;
            }
            
            setLoading(true);
            setError(null);
            try {
                const url = `${API_URL}/api/tours/special-events/suggestions/${destinationId}?tourStartDate=${tourStartDate}&tourEndDate=${tourEndDate}`;
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch special event suggestions: ${response.status} ${errorText}`);
                }
                
                const data = await response.json();
                setEvents(data);
            } catch (err) {
                console.error('❌ Error fetching special events:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [destinationId, tourStartDate, tourEndDate]);

    if (loading) return <div className="special-events-loading">Loading events...</div>;
    if (error) return <div className="special-events-error">{error}</div>;
    if (!events.length) return null;

    return (
        <div className="special-events-suggestions">
                <h3>🎉 Special Events in {destinationName}</h3>
                <p className="events-subtitle">
                    Discover cultural events and festivals happening around your tour dates
                </p>
            <div className="special-events-grid">
                {events.map(event => (
                    <div key={event.id} className="special-event-card">
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
                            <div className="event-suggestion">
                                <span className="suggestion-badge">💡 Suggestion</span>
                                <p>{event.suggestionMessage}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpecialEventSuggestions; 