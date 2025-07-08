import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon } from "lucide-react";
import { useTour } from '../context/TourContext';
import StepIndicator from '../components/StepIndicator';
import './CreateTourInfoPage.css';

const CreateTourInfoPage = () => {
  const navigate = useNavigate();
  const { tourData, setTourInfo, updateField } = useTour();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // Initialize form with existing tour data
  useEffect(() => {
    if (tourData.title) setTitle(tourData.title);
    if (tourData.startDate) setStartDate(tourData.startDate);
    if (tourData.endDate) setEndDate(tourData.endDate);
  }, [tourData]);

  // Format date to readable format (July 7th, 2025)
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

  const handleDateContainerClick = (inputRef) => {
    if (inputRef.current) {
      // Try to use showPicker if available
      if (inputRef.current.showPicker) {
        try {
          inputRef.current.showPicker();
        } catch (error) {
          // Fallback: focus and click
          inputRef.current.focus();
          inputRef.current.click();
        }
      } else {
        // Fallback: focus and click
        inputRef.current.focus();
        inputRef.current.click();
      }
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    updateField('title', newTitle);
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    updateField('startDate', newStartDate);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    updateField('endDate', newEndDate);
  };

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
    
    // Save to context
    setTourInfo(title, startDate, endDate);
    
    // Navigate to place selection
    navigate("/select-places");
  };

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">Tour Planner</h1>
          <p className="tour-page-subtitle">Plan your perfect adventure</p>
        </div>
        
        <StepIndicator currentStep={1} />
        
        <div className="tour-form-card card">
          <div className="card-header">
            <h2 className="card-title">
              <CalendarIcon className="title-icon" />
              Tour Details
            </h2>
            <p className="card-description">
              Let's start by setting up your tour basic information
            </p>
          </div>
          <div className="card-content">
            <form className="tour-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label" htmlFor="title">Tour Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  maxLength={100}
                  placeholder="My Amazing Tour"
                  className="input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="label" htmlFor="startDate">Start Date</label>
                  <div 
                    className="date-input-container"
                    onClick={() => handleDateContainerClick(startDateRef)}
                  >
                    <CalendarIcon className="date-icon" />
                    <input
                      ref={startDateRef}
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      required
                      className="date-input"
                    />
                    <div className="date-display">
                      {startDate ? formatDateDisplay(startDate) : "Pick start date"}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="endDate">End Date</label>
                  <div 
                    className="date-input-container"
                    onClick={() => handleDateContainerClick(endDateRef)}
                  >
                    <CalendarIcon className="date-icon" />
                    <input
                      ref={endDateRef}
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      required
                      className="date-input"
                    />
                    <div className="date-display">
                      {endDate ? formatDateDisplay(endDate) : "Pick end date"}
                    </div>
                  </div>
                </div>
              </div>
              
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-navigation">
                <button type="button" className="btn btn-outline" disabled>
                  Previous
                </button>
                <button type="submit" className="btn btn-primary">
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTourInfoPage; 