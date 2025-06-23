import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('blogs');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/profile/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleCreateTour = () => {
    navigate('/create-tour');
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="profile-header">
            <div className="relative">
              <img
                src={user.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                alt={`${user.username}'s profile`}
                className="profile-image"
              />
              <div className="online-status"></div>
            </div>
            <div className="profile-info">
              <h1 className="username">{user.username}</h1>
              <p className="user-email">{user.email}</p>
              <div className="tags-container">
                <span className="tag">Traveler</span>
                <span className="tag">Explorer</span>
                <span className="tag">Adventurer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Create Tour CTA */}
        <div className="create-tour-cta">
          <button
            onClick={handleCreateTour}
            className="create-tour-button"
          >
            <span className="emoji">✈️</span>
            Create New Tour
          </button>
          <p className="cta-text">Share your travel experiences with the world</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            My Blogs
          </button>
          <button
            className={`tab-button ${activeTab === 'tours' ? 'active' : ''}`}
            onClick={() => setActiveTab('tours')}
          >
            My Tours
          </button>
          <button
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Items
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'blogs' && (
          <section className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📝</span>
                My Travel Blogs
              </h2>
              <span className="section-badge">
                {user.blogs?.length || 0} posts
              </span>
            </div>

            {(!user.blogs || user.blogs.length === 0) ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3 className="empty-title">No blogs yet</h3>
                <p className="empty-text">Start sharing your travel stories!</p>
              </div>
            ) : (
              <div className="blog-grid">
                {user.blogs.map((blog) => (
                  <article key={blog.id} className="blog-card">
                    <div className="relative">
                      <img
                        src={ "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop"}
                        alt={blog.title}
                        className="blog-image"
                      />
                      <div className="blog-badge">
                        {blog.destination || 'Travel'}
                      </div>
                    </div>
                    <div className="blog-content">
                      <h3 className="blog-title">{blog.title}</h3>
                      <p className="blog-excerpt">{blog.content}</p>
                      <button className="read-more">
                        Read More
                        <span className="read-more-arrow">→</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'tours' && (
          <section className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">🌟</span>
                My Tour Packages
              </h2>
              <span className="section-badge">
                {user.tours?.length || 0} tours
              </span>
            </div>

            {(!user.tours || user.tours.length === 0) ? (
              <div className="empty-state">
                <div className="empty-icon">✈️</div>
                <h3 className="empty-title">No tours created yet</h3>
                <p className="empty-text">Create your first tour package!</p>
              </div>
            ) : (
              <div className="tour-grid">
                {user.tours.map((tour) => (
                  <div key={tour.id} className="tour-card">
                    <div className="relative">
                      <img
                        src={tour.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop"}
                        alt={tour.title}
                        className="tour-image"
                      />
                      {tour.rating && (
                        <div className="tour-rating">
                          ⭐ {tour.rating}
                        </div>
                      )}
                    </div>
                    <div className="tour-details">
                      <h3 className="tour-title">{tour.title}</h3>
                      <div className="tour-meta">
                        {tour.price && <span className="tour-price">${tour.price}</span>}
                        {tour.duration && (
                          <span className="tour-duration">
                            {tour.duration} days
                          </span>
                        )}
                      </div>
                      <button className="tour-button">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'saved' && (
          <section className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">❤️</span>
                Saved Items
              </h2>
            </div>
            <div className="empty-state">
              <div className="empty-icon">📌</div>
              <h3 className="empty-title">No saved items yet</h3>
              <p className="empty-text">Save your favorite tours and blogs!</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
