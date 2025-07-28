import React, { createContext, useContext, useReducer } from 'react';

// Initial state for tour data
const initialState = {
  title: '',
  startDate: '',
  endDate: '',
  places: [],
  accommodations: [],
  transportation: [],
  route: [],
  optimizedRoute: null,
  totalDistance: null,
  isRouteOptimized: false,
  isEditing: false,
  editingTourId: null,
  estimatedCost: null,
  // Add more fields as needed
};

// Action types
const TOUR_ACTIONS = {
  SET_TOUR_INFO: 'SET_TOUR_INFO',
  SET_PLACES: 'SET_PLACES',
  SET_ACCOMMODATIONS: 'SET_ACCOMMODATIONS',
  SET_TRANSPORTATION: 'SET_TRANSPORTATION',
  SET_ROUTE: 'SET_ROUTE',
  SET_OPTIMIZED_ROUTE: 'SET_OPTIMIZED_ROUTE',
  RESET_TOUR: 'RESET_TOUR',
  UPDATE_FIELD: 'UPDATE_FIELD',
  SET_EDIT_MODE: 'SET_EDIT_MODE'
};

// Reducer function
const tourReducer = (state, action) => {
  switch (action.type) {
    case TOUR_ACTIONS.SET_TOUR_INFO:
      return {
        ...state,
        title: action.payload.title,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate,
        estimatedCost: action.payload.estimatedCost
      };
    case TOUR_ACTIONS.SET_PLACES:
      return {
        ...state,
        places: action.payload,
        optimizedRoute: null,
        totalDistance: null,
        isRouteOptimized: false
      };
    case TOUR_ACTIONS.SET_ACCOMMODATIONS:
      return {
        ...state,
        accommodations: action.payload
      };
    case TOUR_ACTIONS.SET_TRANSPORTATION:
      return {
        ...state,
        transportation: action.payload
      };
    case TOUR_ACTIONS.SET_ROUTE:
      return {
        ...state,
        route: action.payload
      };
    case TOUR_ACTIONS.SET_OPTIMIZED_ROUTE:
      return {
        ...state,
        optimizedRoute: action.payload.optimizedRoute,
        totalDistance: action.payload.totalDistance,
        isRouteOptimized: true
      };
    case TOUR_ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        [action.payload.field]: action.payload.value
      };
    case TOUR_ACTIONS.SET_EDIT_MODE:
      return {
        ...state,
        isEditing: action.payload.isEditing,
        editingTourId: action.payload.editingTourId
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
  const setTourInfo = (title, startDate, endDate, estimatedCost = null) => {
    dispatch({
      type: TOUR_ACTIONS.SET_TOUR_INFO,
      payload: { title, startDate, endDate, estimatedCost }
    });
  };

  const setPlaces = (places) => {
    dispatch({
      type: TOUR_ACTIONS.SET_PLACES,
      payload: places
    });
  };

  const setAccommodations = (accommodations) => {
    dispatch({
      type: TOUR_ACTIONS.SET_ACCOMMODATIONS,
      payload: accommodations
    });
  };

  const setTransportation = (transportation) => {
    dispatch({
      type: TOUR_ACTIONS.SET_TRANSPORTATION,
      payload: transportation
    });
  };

  const setRoute = (route) => {
    dispatch({
      type: TOUR_ACTIONS.SET_ROUTE,
      payload: route
    });
  };

  const setOptimizedRoute = (optimizedRoute, totalDistance) => {
    dispatch({
      type: TOUR_ACTIONS.SET_OPTIMIZED_ROUTE,
      payload: { optimizedRoute, totalDistance }
    });
  };

  const updateField = (field, value) => {
    console.log('🔄 TourContext updateField called:', field, '=', value);
    dispatch({
      type: TOUR_ACTIONS.UPDATE_FIELD,
      payload: { field, value }
    });
  };

  const setEditMode = (isEditing, editingTourId = null) => {
    dispatch({
      type: TOUR_ACTIONS.SET_EDIT_MODE,
      payload: { isEditing, editingTourId }
    });
  };

  const resetTour = () => {
    console.log('🔄 TourContext resetTour called');
    dispatch({
      type: TOUR_ACTIONS.RESET_TOUR
    });
  };

  const value = {
    tourData,
    setTourInfo,
    setPlaces,
    setAccommodations,
    setTransportation,
    setRoute,
    setOptimizedRoute,
    updateField,
    setEditMode,
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