import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTourInfoPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Tour title is required.");
      return;
    }
    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    if (!endDate) {
      setError("End date is required.");
      return;
    }
    // Optionally: validate that endDate >= startDate
    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }
    // Navigate to place selection, passing info as state
    navigate("/select-places", {
      state: { title, startDate, endDate }
    });
  };

  return (
    <div className="create-tour-info-container">
      <h1>Create a New Tour</h1>
      <form className="create-tour-info-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Tour Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={100}
            placeholder="Enter tour title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date *</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date *</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
        </div>
        {error && <div className="form-error" style={{ color: 'red' }}>{error}</div>}
        <button type="submit" className="submit-btn">Next: Select Places</button>
      </form>
    </div>
  );
};

export default CreateTourInfoPage; 