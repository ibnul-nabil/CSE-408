import React, { createContext, useContext, useReducer } from 'react';

// Initial state for tour data
const initialState = {
  title: '',
  startDate: '',
  endDate: '',
  places: [],
  route: [],
  // Add more fields as needed
};

// Action types
const TOUR_ACTIONS = {
  SET_TOUR_INFO: 'SET_TOUR_INFO',
  SET_PLACES: 'SET_PLACES',
  SET_ROUTE: 'SET_ROUTE',
  RESET_TOUR: 'RESET_TOUR',
  UPDATE_FIELD: 'UPDATE_FIELD'
};

// Reducer function
const tourReducer = (state, action) => {
  switch (action.type) {
    case TOUR_ACTIONS.SET_TOUR_INFO:
      return {
        ...state,
        title: action.payload.title,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate
      };
    case TOUR_ACTIONS.SET_PLACES:
      return {
        ...state,
        places: action.payload
      };
    case TOUR_ACTIONS.SET_ROUTE:
      return {
        ...state,
        route: action.payload
      };
    case TOUR_ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        [action.payload.field]: action.payload.value
      };
    case TOUR_ACTIONS.RESET_TOUR:
      return initialState;
    default:
      return state;
  }
};

// Create context
const TourContext = createContext();

// Provider component
export const TourProvider = ({ children }) => {
  const [tourData, dispatch] = useReducer(tourReducer, initialState);

  // Action creators
  const setTourInfo = (title, startDate, endDate) => {
    dispatch({
      type: TOUR_ACTIONS.SET_TOUR_INFO,
      payload: { title, startDate, endDate }
    });
  };

  const setPlaces = (places) => {
    dispatch({
      type: TOUR_ACTIONS.SET_PLACES,
      payload: places
    });
  };

  const setRoute = (route) => {
    dispatch({
      type: TOUR_ACTIONS.SET_ROUTE,
      payload: route
    });
  };

  const updateField = (field, value) => {
    dispatch({
      type: TOUR_ACTIONS.UPDATE_FIELD,
      payload: { field, value }
    });
  };

  const resetTour = () => {
    dispatch({
      type: TOUR_ACTIONS.RESET_TOUR
    });
  };

  const value = {
    tourData,
    setTourInfo,
    setPlaces,
    setRoute,
    updateField,
    resetTour
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};

// Custom hook to use tour context
export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

export default TourContext; 