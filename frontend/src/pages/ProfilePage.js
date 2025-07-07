import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const API_URL = process.env.REACT_APP_URL;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('profile');

  // Sample interests - this should come from your backend
  const interests = ['Adventure Travel', 'Photography', 'Food & Culture', 'Backpacking'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/profile/${authUser.id}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (authUser && authUser.id) {
      fetchUser();
    }
  }, [authUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="profile-container">
      {/* Sidebar Navigation */}
      <div className="profile-sidebar">
        <div className="nav-header">Tourify</div>
        <nav>
          <div className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`} onClick={() => setActiveNav('profile')}>
            <span className="nav-item-icon">👤</span>
            Profile
          </div>
          <div className={`nav-item ${activeNav === 'trips' ? 'active' : ''}`} onClick={() => setActiveNav('trips')}>
            <span className="nav-item-icon">✈️</span>
            My Trips
          </div>
          <div className={`nav-item ${activeNav === 'my-blogs' ? 'active' : ''}`} onClick={() => navigate('/my-blogs')}>
            <span className="nav-item-icon">📝</span>
            My Blogs
          </div>
          <div className={`nav-item ${activeNav === 'create-tour' ? 'active' : ''}`} onClick={() => navigate('/create-tour-info')}>
            <span className="nav-item-icon">➕</span>
            Create Tour
          </div>
          <div className={`nav-item ${activeNav === 'write-blog' ? 'active' : ''}`} onClick={() => navigate('/create-blog')}>
            <span className="nav-item-icon">✍️</span>
            Write Blog
          </div>

          <div className="nav-section-title">Settings</div>
          <div className={`nav-item ${activeNav === 'edit' ? 'active' : ''}`} onClick={() => setActiveNav('edit')}>
            <span className="nav-item-icon">⚙️</span>
            Edit Profile
          </div>
          <div className="nav-item" onClick={handleLogout}>
            <span className="nav-item-icon">🚪</span>
            Logout
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="profile-main-content">
        {/* Cover Photo Section */}
        <div className="profile-cover-section">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
            alt="Cover"
            className="profile-cover-photo"
          />
        </div>

        {/* Profile Info Section */}
        <div className="profile-info-section">
          <div className="profile-avatar-container">
            <img
              src={user.profile_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'}
              alt="Profile"
              className="profile-avatar"
            />
          </div>

          <div className="profile-header">
            <h1 className="profile-name">{user.username}</h1>
            <p className="profile-bio">Digital nomad exploring the world one city at a time ✈️</p>
            <div className="profile-location">
              <span className="location-icon">📍</span>
              Based in Barcelona, Spain
            </div>

            <div className="interests-list">
              {interests.map((interest, index) => (
                <span key={index} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tours Section */}
        <div className="content-section">
          <h2 className="section-title">Recent Tours</h2>
          <div className="content-grid">
            {user.tours?.slice(0, 4).map(tour => (
              <div key={tour.id} className="content-card">
                <img
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828"
                  alt={tour.title}
                  className="card-image"
                />
                <div className="card-content">
                  <h3 className="card-title">{tour.title}</h3>
                  <p className="card-description">
                    Status: {tour.status} • {tour.startDate ? `From ${tour.startDate}` : 'No dates'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Blogs Section */}
        <div className="content-section">
          <h2 className="section-title">Recent Blogs</h2>
          <div className="content-grid">
            {user.blogSummaries?.slice(0, 4).map(blog => {
              // Combine all destinations for display
              const allDestinations = blog.destinations || [];
              const destinationText = allDestinations.length > 0 
                ? allDestinations.slice(0, 2).join(', ') + (allDestinations.length > 2 ? '...' : '')
                : 'No destination';
              
              return (
                <div key={blog.id} className="content-card" onClick={() => navigate(`/blogs/${blog.id}`)}>
                  <img
                    src={blog.thumbnailUrl || blog.firstMediaUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828"}
                    alt={blog.title || 'Blog post'}
                    className="card-image"
                  />
                  <div className="card-content">
                    <h3 className="card-title">{blog.title || 'Untitled Blog'}</h3>
                    <div className="card-description">
                      <p className="blog-destinations">📍 {destinationText}</p>
                      <p className="blog-stats">
                        👍 {blog.likes || 0} • 💬 {blog.commentsCount || 0} • 📷 {blog.mediaCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
