import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import './FinalizeRoutePage.css';

const API_URL =  process.env.REACT_APP_URL;


const FinalizeRoutePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { title, startDate, endDate, selectedDestinations } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleConfirmTour = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    // Get userId from context or localStorage (as in CreateBlogPage)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id || storedUser?.id;
    const token = localStorage.getItem("token");

    if (!userId) {
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }
    if (!selectedDestinations || selectedDestinations.length === 0) {
      setError("No route selected.");
      setLoading(false);
      return;
    }

    // Prepare request body for backend
    let stopOrder = 1;
    const stops = [];
    selectedDestinations.forEach(({ destination, subplaces }) => {
      stops.push({
        placeType: "Destination",
        placeId: destination.id,
        stopOrder: stopOrder++
      });
      subplaces.forEach(sub => {
        stops.push({
          placeType: "SubPlace",
          placeId: sub.id,
          stopOrder: stopOrder++
        });
      });
    });
    const reqBody = {
      userId,
      title: title || "New Tour",
      startDate,
      endDate,
      estimatedCost: 0, // You can update this if you collect cost
      route: {
        routeSource: "user",
        stops
      }
    };

    try {
      const res = await fetch(`${API_URL}/api/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to create tour.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finalize-route-container">
      <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
      <h1 className="finalize-route-title">Your Finalized Route</h1>
      <div className="finalize-route-summary">
        <div><strong>Title:</strong> {title}</div>
        <div><strong>Start Date:</strong> {startDate}</div>
        <div><strong>End Date:</strong> {endDate}</div>
      </div>
      {selectedDestinations && selectedDestinations.length === 0 ? (
        <div className="finalize-route-empty">No route selected.</div>
      ) : (
        <div className="aesthetic-timeline">
          {selectedDestinations && selectedDestinations.map(({ destination, subplaces }, idx) => (
            <div key={destination.id} className="aesthetic-timeline-event">
              <div className="aesthetic-timeline-dot" />
              {idx !== selectedDestinations.length - 1 && <div className="aesthetic-timeline-connector" />}
              <div className="aesthetic-timeline-content">
                <div className="aesthetic-destination-name">{destination.name}</div>
                <div className="aesthetic-destination-type">Destination</div>
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
      <button onClick={handleConfirmTour} disabled={loading} className="confirm-tour-btn">
        {loading ? "Confirming..." : "Confirm Tour"}
      </button>
      {error && <div style={{ color: "red", marginTop: '1rem' }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: '1rem' }}>Tour created! Redirecting...</div>}
    </div>
  );
};

export default FinalizeRoutePage; 