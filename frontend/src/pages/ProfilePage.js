import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhotoUploadModal from '../components/PhotoUploadModal';
import { getImageUrl } from '../utils/imageUtils';
import './ProfilePage.css';

const API_URL = process.env.REACT_APP_URL;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('profile');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhotoType, setModalPhotoType] = useState('profile'); // 'profile' or 'cover'

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

  const handlePhotoClick = (photoType) => {
    setModalPhotoType(photoType);
    setModalOpen(true);
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    if (modalPhotoType === 'profile') {
      setUser(prev => ({ ...prev, profileImage: newPhotoUrl }));
    } else {
      setUser(prev => ({ ...prev, coverPhoto: newPhotoUrl }));
    }
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
    <div className="facebook-profile-container">
      {/* Sidebar Navigation */}
      <div className="profile-sidebar">
        <div className="nav-header">Tourify</div>
        <nav>
          <div className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`} onClick={() => setActiveNav('profile')}>
            <span className="nav-item-icon">👤</span>
            Profile
          </div>
          <div className={`nav-item ${activeNav === 'trips' ? 'active' : ''}`} onClick={() => navigate('/my-trips')}>
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
          <div className="nav-item" onClick={handleLogout}>
            <span className="nav-item-icon">🚪</span>
            Logout
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="facebook-main-content">
        {/* Cover Photo Section */}
        <div className="facebook-cover-section">
          <div className="facebook-cover-photo-container">
            <img
              src={getImageUrl(user.coverPhoto) || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"}
              alt="Cover"
              className="facebook-cover-photo"
              onClick={() => handlePhotoClick('cover')}
            />
            <button 
              className="facebook-photo-edit-btn facebook-cover-edit-btn"
              onClick={() => handlePhotoClick('cover')}
              title="Edit cover photo"
            >
              📷 Edit cover photo
            </button>
          </div>
        </div>

        {/* Profile Content Container */}
        <div className="facebook-profile-content">
          {/* Profile Info Section */}
          <div className="facebook-profile-info">
            <div className="facebook-profile-avatar-container">
              <img
                src={getImageUrl(user.profileImage || user.profile_image) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'}
                alt="Profile"
                className="facebook-profile-avatar"
                onClick={() => handlePhotoClick('profile')}
              />
              <button 
                className="facebook-photo-edit-btn facebook-profile-edit-btn"
                onClick={() => handlePhotoClick('profile')}
                title="Update profile picture"
              >
                📷
              </button>
            </div>
            
            <div className="facebook-profile-details">
              <h1 className="facebook-profile-name">{user.username}</h1>
              <p className="facebook-friends-count">{user.tours?.length || 0} tours created</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="facebook-content-container">
          {/* Recent Blogs Section */}
          <div className="facebook-content-section">
            <h2 className="facebook-section-title">Recent Blogs</h2>
            <div className="facebook-content-grid">
              {user.blogSummaries?.slice(0, 6).map(blog => {
                const allDestinations = blog.destinations || [];
                const destinationText = allDestinations.length > 0 
                  ? allDestinations.slice(0, 2).join(', ') + (allDestinations.length > 2 ? '...' : '')
                  : 'No destination';
                
                return (
                  <div key={blog.id} className="facebook-content-card" onClick={() => navigate(`/blogs/${blog.id}`)}>
                    <img
                      src={getImageUrl(blog.thumbnailUrl || blog.firstMediaUrl) || "https://images.unsplash.com/photo-1488646953014-85cb44e25828"}
                      alt={blog.title || 'Blog post'}
                      className="facebook-card-image"
                    />
                    <div className="facebook-card-content">
                      <h3 className="facebook-card-title">{blog.title}</h3>
                      <p className="facebook-card-description">{destinationText}</p>
                      <div className="facebook-card-stats">
                        <span>❤️ {blog.likeCount || 0}</span>
                        <span>💬 {blog.commentCount || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {(!user.blogSummaries || user.blogSummaries.length === 0) && (
              <div className="facebook-empty-state">
                <p>No blogs yet. Start writing your travel stories!</p>
                <button className="facebook-create-btn" onClick={() => navigate('/create-blog')}>
                  Write Your First Blog
                </button>
              </div>
            )}
          </div>

          {/* Recent Tours Section */}
          <div className="facebook-content-section">
            <h2 className="facebook-section-title">Tours Created</h2>
            <div className="facebook-content-grid">
              {user.tours?.slice(0, 6).map(tour => (
                <div key={tour.id} className="facebook-content-card">
                  <img
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828"
                    alt={tour.title}
                    className="facebook-card-image"
                  />
                  <div className="facebook-card-content">
                    <h3 className="facebook-card-title">{tour.title}</h3>
                    <p className="facebook-card-description">
                      Status: {tour.status}
                    </p>
                    <p className="facebook-card-date">
                      {tour.startDate ? `From ${tour.startDate}` : 'No dates set'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {(!user.tours || user.tours.length === 0) && (
              <div className="facebook-empty-state">
                <p>No tours created yet. Plan your first adventure!</p>
                <button className="facebook-create-btn" onClick={() => navigate('/create-tour-info')}>
                  Create Your First Tour
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {modalOpen && (
        <PhotoUploadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          photoType={modalPhotoType}
          currentPhoto={modalPhotoType === 'profile' ? user.profileImage || user.profile_image : user.coverPhoto}
          userId={authUser.id}
          onPhotoUpdate={handlePhotoUpdate}
        />
      )}
    </div>
  );
};

export default ProfilePage;
