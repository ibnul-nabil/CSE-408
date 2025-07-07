import React from 'react';
import './DestinationTags.css';

const DestinationTags = ({ destinations, onRemove, maxDisplay = 10 }) => {
  if (!destinations || destinations.length === 0) {
    return null;
  }

  const displayDestinations = destinations.slice(0, maxDisplay);
  const remainingCount = destinations.length - maxDisplay;

  return (
    <div className="destination-tags-container">
      <div className="destination-tags">
        {displayDestinations.map((destination, index) => (
          <div key={`${destination}-${index}`} className="destination-tag">
            <span className="destination-icon">📍</span>
            <span className="destination-name">{destination}</span>
            <button
              type="button"
              className="remove-destination"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${destination}`}
            >
              ×
            </button>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="destination-tag remaining-count">
            +{remainingCount} more
          </div>
        )}
      </div>
      
      {destinations.length > 0 && (
        <div className="destinations-summary">
          {destinations.length} destination{destinations.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default DestinationTags; 