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
        <div className="aesthetic-timeline">
          {selectedDestinations.map(({ destination, subplaces }, idx) => (
            <div key={destination.id} className="aesthetic-timeline-event">
              <div className="aesthetic-timeline-dot" />
              {idx !== selectedDestinations.length - 1 && <div className="aesthetic-timeline-connector" />}
              <div className="aesthetic-timeline-content">
                <div className="aesthetic-destination-name">{destination.name}</div>
                <div className="aesthetic-destination-type">{destination.type}</div>
                {subplaces.length > 0 && (
                  <div className="aesthetic-mini-timeline">
                    {subplaces.map((sub, subIdx) => (
                      <div key={sub.id} className="aesthetic-mini-timeline-item">
                        <div className="aesthetic-mini-timeline-dot" />
                        {subIdx !== subplaces.length - 1 && <div className="aesthetic-mini-timeline-connector" />}
                        <span className="aesthetic-mini-timeline-label">{sub.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinalizeRoutePage; 