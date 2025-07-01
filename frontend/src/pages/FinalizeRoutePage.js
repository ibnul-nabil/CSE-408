import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import './FinalizeRoutePage.css';

const API_URL = "http://localhost:8080"; // Adjust if needed

const FinalizeRoutePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedDestinations } = location.state || { selectedDestinations: [] };
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleConfirmTour = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    // Get userId from context or localStorage (as in CreateBlogPage)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId || storedUser?.userId;
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
    const reqBody = {
      userId,
      title: "New Tour", // Assuming a default title
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      estimatedCost: 0, // Assuming a default estimated cost
      route: {
        routeSource: "user",
        stops: selectedDestinations.map(({ destination, subplaces }, idx) => ({
          placeType: "Destination",
          placeId: destination.id,
          stopOrder: idx + 1
        }))
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
      <button onClick={handleConfirmTour} disabled={loading}>
        {loading ? "Confirming..." : "Confirm Tour"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>Tour created! Redirecting...</div>}
    </div>
  );
};

export default FinalizeRoutePage; 