import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon } from "lucide-react";
import { useTour } from '../context/TourContext';
import StepIndicator from '../components/StepIndicator';
import './CreateTourInfoPage.css';

const CreateTourInfoPage = ({ isEditMode = false, onNext }) => {
  const navigate = useNavigate();
  const { tourData, setTourInfo, updateField, resetTour } = useTour();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

    // Initialize form with existing tour data or reset for new tour
  useEffect(() => {
    // Always restore existing tour data from context if it exists
    if (tourData.title || tourData.startDate || tourData.endDate) {
      if (tourData.title) setTitle(tourData.title);
      if (tourData.startDate) setStartDate(tourData.startDate);
      if (tourData.endDate) setEndDate(tourData.endDate);
    } else if (!isEditMode) {
      // Only reset if no existing data and not in edit mode
      resetTour();
    }
  }, [isEditMode, tourData.title, tourData.startDate, tourData.endDate, resetTour]);

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

  const handleDateContainerClick = useCallback((inputRef) => {
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
  }, []);

  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    updateField('title', newTitle);
  }, [updateField]);

  const handleStartDateChange = useCallback((e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    updateField('startDate', newStartDate);
  }, [updateField]);

  const handleEndDateChange = useCallback((e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    updateField('endDate', newEndDate);
  }, [updateField]);

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Check if a date is in the past
  const isDateInPast = (dateString) => {
    if (!dateString) return false;
    return dateString < getTodayDate();
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
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Validate that start date is not in the past
    if (startDate < today) {
      setError("Start date cannot be in the past. Please select a future date.");
      return;
    }
    
    // Validate that end date is not before start date
    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }
    
    // Save to context
    setTourInfo(title, startDate, endDate);
    
    // Navigate to place selection
    if (isEditMode && onNext) {
      onNext(); // Use callback for edit mode
    } else {
      navigate("/select-places"); // Use navigation for normal mode
    }
  };

  return (
    <div className="tour-page-container">
      <div className="tour-page-wrapper">
        <div className="tour-page-header">
          <h1 className="tour-page-title">{isEditMode ? 'Edit Tour' : 'Tour Planner'}</h1>
          <p className="tour-page-subtitle">{isEditMode ? 'Update your adventure details' : 'Plan your perfect adventure'}</p>
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
                    className={`date-input-container ${isDateInPast(startDate) ? 'invalid-date' : ''}`}
                    onClick={() => handleDateContainerClick(startDateRef)}
                  >
                    <CalendarIcon className="date-icon" />
                    <input
                      ref={startDateRef}
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      min={getTodayDate()}
                      required
                      className="date-input"
                    />
                    <div className="date-display">
                      {startDate ? formatDateDisplay(startDate) : "Pick start date"}
                    </div>
                  </div>
                  {isDateInPast(startDate) && (
                    <div className="date-hint error">
                      Start date cannot be in the past
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="endDate">End Date</label>
                  <div 
                    className={`date-input-container ${isDateInPast(endDate) || (endDate && startDate && endDate < startDate) ? 'invalid-date' : ''}`}
                    onClick={() => handleDateContainerClick(endDateRef)}
                  >
                    <CalendarIcon className="date-icon" />
                    <input
                      ref={endDateRef}
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      min={startDate || getTodayDate()}
                      required
                      className="date-input"
                    />
                    <div className="date-display">
                      {endDate ? formatDateDisplay(endDate) : "Pick end date"}
                    </div>
                  </div>
                  {isDateInPast(endDate) && (
                    <div className="date-hint error">
                      End date cannot be in the past
                    </div>
                  )}
                  {endDate && startDate && endDate < startDate && (
                    <div className="date-hint error">
                      End date cannot be before start date
                    </div>
                  )}
                </div>
              </div>
              
              <div className="date-info-hint">
                <span className="hint-icon">💡</span>
                <span>Tours can only be scheduled for future dates. Past dates are not selectable.</span>
              </div>
              
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-navigation">
                <button type="button" className="btn btn-outline" disabled>
                  <span>Previous</span>
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Next</span>
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