import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FinalizeRoutePage.css';

const FinalizeRoutePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedDestinations } = location.state || { selectedDestinations: [] };

  return (
    <div className="finalize-route-container">
      <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
      <h1 className="finalize-route-title">Your Finalized Route</h1>
      {selectedDestinations.length === 0 ? (
        <div className="finalize-route-empty">No route selected.</div>
      ) : (
        <div className="minimal-timeline-container">
          {selectedDestinations.map(({ destination, subplaces }, idx) => (
            <div key={destination.id} className="minimal-timeline-event">
              <div className="minimal-timeline-dot" />
              <div className="minimal-timeline-label">{destination.name}</div>
              {subplaces.length > 0 && (
                <div className="minimal-subplace-list">
                  {subplaces.map(sub => (
                    <div key={sub.id} className="minimal-subplace-item">
                      <div className="minimal-subplace-dot" />
                      <div className="minimal-subplace-label">{sub.name}</div>
                    </div>
                  ))}
                </div>
              )}
              {idx !== selectedDestinations.length - 1 && <div className="minimal-timeline-connector" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinalizeRoutePage; 