import React, { useState, useEffect } from 'react';
import './MyTripsPage.css';
import { Calendar, MapPin, Clock, Users, ArrowRight, Plus, ArrowLeft, Edit, ChevronDown, ChevronUp, Plane, Archive } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_URL;

const MyTripsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [tours, setTours] = useState([]);
  const [currentTours, setCurrentTours] = useState([]);
  const [upcomingTours, setUpcomingTours] = useState([]);
  const [pastTours, setPastTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // New state for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    current: false,
    upcoming: false,
    past: false
  });

  // State for highlighting specific tour
  const [highlightedTour, setHighlightedTour] = useState(null);
  
  // New state for visible tour counts
  const [visibleCounts, setVisibleCounts] = useState({
    current: 6,
    upcoming: 6,
    past: 6
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState({
    current: 1,
    upcoming: 1,
    past: 1
  });
  
  const [hasMore, setHasMore] = useState({
    current: false,
    upcoming: false,
    past: false
  });
  
  const [loadingMore, setLoadingMore] = useState({
    current: false,
    upcoming: false,
    past: false
  });

  const TOURS_PER_PAGE = 6;

  useEffect(() => {
    const shouldSkipLoading = location.state?.skipLoading;
    const returnState = location.state?.returnState;
    
    fetchTours(shouldSkipLoading);
    
    // Show success message if redirected from tour creation
    if (shouldSkipLoading) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }

    // Restore navigation state if returning from tour details
    if (returnState) {
      console.log('🔄 Restoring navigation state:', returnState);
      setExpandedSections(returnState.expandedSections);
      setHighlightedTour(returnState.highlightedTour);
      
      // Scroll to the highlighted tour card after state is restored
      setTimeout(() => {
        const tourElement = document.querySelector(`[data-tour-id="${returnState.highlightedTour}"]`);
        if (tourElement) {
          console.log('📍 Scrolling to tour card:', returnState.highlightedTour);
          tourElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100); // Small delay to ensure DOM is updated
      
      // Clear highlight after animation
      setTimeout(() => {
        console.log('✨ Clearing highlight for tour:', returnState.highlightedTour);
        setHighlightedTour(null);
      }, 3000);
    }
  }, [location.state]);

  const fetchTours = async (skipLoadingState = false) => {
    try {
      if (!skipLoadingState) {
        setLoading(true);
      }
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Fetching tours with token:', token?.substring(0, 8) + '...');
      
      const response = await fetch(`${API_URL}/api/tours/my-tours`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch tours: ${response.status} ${errorText}`);
      }

      const tours = await response.json();
      console.log('Fetched tours:', tours);
      console.log('Sample tour structure:', tours[0]);
      if (tours[0] && tours[0].places) {
        console.log('Sample places:', tours[0].places);
      }
      categorizeTours(tours);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError(err.message);
    } finally {
      if (!skipLoadingState) {
        setLoading(false);
      }
    }
  };

  const categorizeTours = (tours) => {
    if (!tours || !Array.isArray(tours)) {
      console.error('Tours data is not an array:', tours);
      return;
    }

    // Get current date at start of day for proper comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    console.log('🗓️ Categorizing tours. Current date:', today.toDateString());
    
    const current = [];
    const upcoming = [];
    const past = [];

    tours.forEach(tour => {
      if (!tour) return;
      
      const startDate = tour.startDate ? new Date(tour.startDate) : null;
      const endDate = tour.endDate ? new Date(tour.endDate) : null;

      if (startDate && endDate) {
        // Convert to date-only for comparison (ignore time)
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        console.log(`📅 Tour: ${tour.title}`);
        console.log(`   Start: ${startDateOnly.toDateString()}`);
        console.log(`   End: ${endDateOnly.toDateString()}`);
        console.log(`   Today: ${today.toDateString()}`);
        
        if (startDateOnly <= today && endDateOnly >= today) {
          console.log('   → CURRENT');
          current.push(tour);
        } else if (startDateOnly > today) {
          console.log('   → UPCOMING');
          upcoming.push(tour);
        } else {
          console.log('   → PAST');
          past.push(tour);
        }
      } else {
        // If no dates, put in upcoming by default
        console.log(`📅 Tour: ${tour.title} → UPCOMING (no dates)`);
        upcoming.push(tour);
      }
    });

    // Sort tours by date
    current.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    past.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

    // Store all tours for load more/less functionality
    setTours({ current, upcoming, past });
    
    setCurrentTours(current);
    setUpcomingTours(upcoming);
    setPastTours(past);
    
    setHasMore({ current: current.length > TOURS_PER_PAGE, upcoming: upcoming.length > TOURS_PER_PAGE, past: past.length > TOURS_PER_PAGE });
  };

  const loadMoreToursFromAPI = async (type) => {
    if (loadingMore[type]) return;

    setLoadingMore(prev => ({ ...prev, [type]: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      // For now, let's fetch all tours again and handle pagination on frontend
      // Later you can implement proper backend pagination
      const response = await fetch(`${API_URL}/api/tours/my-tours`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load more tours');
      }

      const allTours = await response.json();
      
      // Re-categorize and get more tours
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const current = [];
      const upcoming = [];
      const past = [];

      allTours.forEach(tour => {
        const startDate = new Date(tour.startDate);
        const endDate = new Date(tour.endDate);
        
        // Convert to date-only for comparison (ignore time)
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        if (startDateOnly <= today && endDateOnly >= today) {
          current.push(tour);
        } else if (startDateOnly > today) {
          upcoming.push(tour);
        } else {
          past.push(tour);
        }
      });

      // Sort tours by date
      current.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      past.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

      if (type === 'upcoming') {
        const currentCount = upcomingTours.length;
        const nextBatch = upcoming.slice(currentCount, currentCount + TOURS_PER_PAGE);
        setUpcomingTours(prev => [...prev, ...nextBatch]);
        setCurrentPage(prev => ({ ...prev, upcoming: prev.upcoming + 1 }));
        setHasMore(prev => ({ ...prev, upcoming: currentCount + TOURS_PER_PAGE < upcoming.length }));
      } else {
        const currentCount = pastTours.length;
        const nextBatch = past.slice(currentCount, currentCount + TOURS_PER_PAGE);
        setPastTours(prev => [...prev, ...nextBatch]);
        setCurrentPage(prev => ({ ...prev, past: prev.past + 1 }));
        setHasMore(prev => ({ ...prev, past: currentCount + TOURS_PER_PAGE < past.length }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(prev => ({ ...prev, [type]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const TourCard = ({ tour, type }) => {
    if (!tour) return null;
    
    // Check if tour is actually upcoming (not started yet)
    const isUpcoming = () => {
      if (!tour.startDate) return false;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startDate = new Date(tour.startDate);
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      return startDateOnly > today;
    };

    const handleViewDetails = () => {
      // Save current state for when user returns
      const currentState = {
        expandedSections,
        highlightedTour: tour.id
      };
      
      console.log('💾 Saving navigation state before going to tour details:', currentState);
      
      navigate(`/tour-details/${tour.id}`, {
        state: { 
          returnTo: '/my-trips',
          returnState: currentState
        }
      });
    };
    
    const isHighlighted = highlightedTour === tour.id;
    
    return (
      <div 
        className={`tour-card ${type} ${isHighlighted ? 'highlighted' : ''}`}
        data-tour-id={tour.id}
      >
        <div className="tour-card-header">
          <h3 className="tour-title">{tour.title || 'Untitled Tour'}</h3>
          <span className={`tour-status ${type}`}>
            {type === 'current' ? 'Ongoing' : type === 'upcoming' ? 'Upcoming' : 'Completed'}
          </span>
        </div>
        
        <div className="tour-details">
          {tour.startDate && tour.endDate && (
            <div className="tour-detail-item">
              <Calendar className="detail-icon" />
              <span>{formatDate(tour.startDate)} - {formatDate(tour.endDate)}</span>
            </div>
          )}
          
          {tour.startDate && tour.endDate && (
            <div className="tour-detail-item">
              <Clock className="detail-icon" />
              <span>{getDuration(tour.startDate, tour.endDate)}</span>
            </div>
          )}
          
          <div className="tour-detail-item">
            <MapPin className="detail-icon" />
            <span>{tour.places?.length || 0} destination{(tour.places?.length || 0) !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {tour.places && tour.places.length > 0 && (
          <div className="tour-destinations">
            <h4>Destinations:</h4>
            <div className="destination-tags">
              {tour.places.slice(0, 3).map((place, index) => (
                <span key={index} className="destination-tag">
                  {place.destination?.name || place.name || `Place ${place.destinationId || place.id}`}
                </span>
              ))}
              {tour.places.length > 3 && (
                <span className="destination-tag more">
                  +{tour.places.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="tour-card-actions">
          <button 
            className="btn"
            onClick={handleViewDetails}
          >
            <span>View Details</span>
            <ArrowRight size={16} />
          </button>
          
          {isUpcoming() && (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/edit-tour/${tour.id}`)}
              title="Edit Tour"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const toggleSection = (sectionType) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionType]: !prev[sectionType]
    }));
  };

  const loadMoreTours = (type) => {
    setVisibleCounts(prev => ({
      ...prev,
      [type]: prev[type] + 6
    }));
  };

  const loadLessTours = (type) => {
    setVisibleCounts(prev => ({
      ...prev,
      [type]: Math.max(6, prev[type] - 6)
    }));
  };

  const StatCard = ({ title, count, icon: Icon, type }) => (
    <div className={`stat-card ${type}`} onClick={() => toggleSection(type)}>
      <div className="stat-icon">
        <Icon size={32} />
      </div>
      <div className="stat-content">
        <div className="stat-number">{count}</div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  );

  const TourSection = ({ title, tours, type, hasMore, onLoadMore, loadingMore }) => {
    const isExpanded = expandedSections[type];
    const visibleCount = visibleCounts[type];
    const allTours = tours || [];
    const visibleTours = allTours.slice(0, visibleCount);
    const canLoadMore = allTours.length > visibleCount;
    const canLoadLess = visibleCount > 6;

    return (
      <div className="tour-section">
        <div className="section-header" onClick={() => toggleSection(type)}>
          <div className="section-header-content">
            <div className="section-title-group">
              <h2 className="section-title">{title}</h2>
              <span className="tour-count">{allTours.length} tour{allTours.length !== 1 ? 's' : ''}</span>
            </div>
            <button className="expand-btn">
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="section-content">
            {allTours.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <MapPin size={48} />
                </div>
                <p className="empty-message">
                  {type === 'current' ? 'No ongoing tours' : 
                   type === 'upcoming' ? 'No upcoming tours' : 'No past tours'}
                </p>
              </div>
            ) : (
              <>
                <div className="tours-grid">
                  {visibleTours.map(tour => (
                    <TourCard key={tour.id} tour={tour} type={type} />
                  ))}
                </div>
                
                {(canLoadMore || canLoadLess) && (
                  <div className="load-more-container">
                    {canLoadMore && (
                      <button
                        className="load-more-btn"
                        onClick={() => loadMoreTours(type)}
                        disabled={loadingMore}
                      >
                        <span>Load More</span>
                      </button>
                    )}
                    {canLoadLess && (
                      <button
                        className="load-less-btn"
                        onClick={() => loadLessTours(type)}
                      >
                        <span>Load Less</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="my-trips-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your tours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-trips-container">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn" onClick={() => fetchTours(false)}>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-trips-container">
      <div className="my-trips-wrapper">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          <div className="header-content">
            <h1 className="page-title">My Travel Journey</h1>
            <p className="page-subtitle">Discover, explore, and cherish every moment of your adventures around the world</p>
          </div>
        </div>

        {showSuccessMessage && (
          <div className="success-message">
            🎉 Tour created successfully! Your new adventure has been added to your trips.
          </div>
        )}

        <div className="stats-dashboard">
          <StatCard 
            title="Current Adventures" 
            count={currentTours.length} 
            icon={Plane} 
            type="current"
          />
          <StatCard 
            title="Upcoming Journey" 
            count={upcomingTours.length} 
            icon={Calendar} 
            type="upcoming"
          />
          <StatCard 
            title="Memories Made" 
            count={pastTours.length} 
            icon={Archive} 
            type="past"
          />
        </div>

        <div className="trips-content">
          <TourSection
            title="Current Adventures"
            tours={currentTours}
            type="current"
            hasMore={hasMore.current}
            onLoadMore={loadMoreToursFromAPI}
            loadingMore={loadingMore.current}
          />

          <TourSection
            title="Upcoming Journey"
            tours={upcomingTours}
            type="upcoming"
            hasMore={hasMore.upcoming}
            onLoadMore={loadMoreToursFromAPI}
            loadingMore={loadingMore.upcoming}
          />

          <TourSection
            title="Memories Made"
            tours={pastTours}
            type="past"
            hasMore={hasMore.past}
            onLoadMore={loadMoreToursFromAPI}
            loadingMore={loadingMore.past}
          />
        </div>
      </div>
    </div>
  );
};

export default MyTripsPage; 