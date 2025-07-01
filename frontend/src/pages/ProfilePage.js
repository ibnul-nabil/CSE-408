import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

//const API_URL = 'http://20.40.57.81:8080'; // Add API URL configuration
const API_URL = 'http://localhost:8080'; // Add API URL configuration

const TABS = [
  { key: 'blogs', label: 'My Blogs', icon: '📝' },
  { key: 'tours', label: 'My Tours', icon: '✈️' },
  { key: 'saved', label: 'Saved Items', icon: '📌' },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('blogs');
  const [selectedBlog, setSelectedBlog] = useState(null); // For modal

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Use the authenticated user's ID from context
        const res = await fetch(`${API_URL}/api/profile/${authUser.userId}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    console.log('authUser:', authUser);
    if (authUser && (authUser.userId)) {
      fetchUser();
    }
  }, [authUser]);

  const handleCreateTour = () => navigate('/create-tour-info');
  const handleCreateBlog = () => navigate('/create-blog');

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

  // Quick stats
  const stats = [
    { label: 'Tours', value: user.tours?.length || 0, icon: '✈️' },
    { label: 'Blogs', value: user.blogs?.length || 0, icon: '📝' },
    { label: 'Saved', value: user.saved?.length || 0, icon: '📌' },
  ];

  // Recent activity
  const latestBlog = user.blogs?.[0];
  const latestTour = user.tours?.[0];

  return (
    <div className="profile-main-container">
      {/* User Info Card */}
      <section className="profile-user-card">
        <img
          src={user.profile_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
          alt="Profile"
          className="profile-avatar"
        />
        <div className="profile-user-details">
          <h2>{user.username}</h2>
          <p className="profile-email">{user.email}</p>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="profile-stats-bar">
        {stats.map((stat) => (
          <div key={stat.label} className="profile-stat">
            <span className="profile-stat-icon">{stat.icon}</span>
            <span className="profile-stat-value">{stat.value}</span>
            <span className="profile-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Create Buttons */}
      <section className="profile-create-buttons">
        <button className="profile-create-btn tour" onClick={handleCreateTour}>
          <span role="img" aria-label="plane">✈️</span> Create New Tour
        </button>
        <button className="profile-create-btn blog" onClick={handleCreateBlog}>
          <span role="img" aria-label="pencil">📝</span> Create New Blog
        </button>
      </section>

      {/* Recent Activity */}
      <section className="profile-recent-activity">
        <h3>Recent Activity</h3>
        <div className="profile-recent-cards">
          {latestTour ? (
            <div className="profile-recent-card">
              <div className="profile-recent-img-wrap">
                <img
                  src={latestTour.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'}
                  alt={latestTour.title}
                />
              </div>
              <div>
                <h4>{latestTour.title}</h4>
                <p>{latestTour.description?.substring(0, 60) || 'No description.'}</p>
              </div>
            </div>
          ) : <div className="profile-recent-empty">No recent tours</div>}
          {latestBlog ? (
            <div className="profile-recent-card">
              <div className="profile-recent-img-wrap">
                <img
                  src={'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'}
                  alt={latestBlog.title}
                />
              </div>
              <div>
                <h4>{latestBlog.title}</h4>
                <p>{latestBlog.content?.substring(0, 60) || 'No content.'}</p>
              </div>
            </div>
          ) : <div className="profile-recent-empty">No recent blogs</div>}
        </div>
      </section>

      {/* Tab Navigation */}
      <nav className="profile-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`profile-tab-btn${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <section className="profile-tab-content">
        {activeTab === 'blogs' && (
          <div className="profile-blog-card-grid">
            {user.blogs?.length ? (
              user.blogs.map(blog => (
                <div key={blog.id} className="profile-blog-card" onClick={() => navigate(`/blogs/${blog.id}`)}>
                  <img className="profile-blog-card-img" src={blog.thumbnail_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'} alt={blog.title} />
                  <div className="profile-blog-card-content">
                    <h4>{blog.title}</h4>
                    <p>{blog.content?.length > 100 ? blog.content.substring(0, 100) + '...' : blog.content}</p>
                    <span className="profile-blog-card-destination">{blog.destination}</span>
                  </div>
                </div>
              ))
            ) : <div className="profile-empty">No blogs yet.</div>}
          </div>
        )}
        {activeTab === 'tours' && (
          <div className="profile-tour-card-vertical-list">
            {user.tours?.length ? (
              user.tours.map(tour => (
                <div key={tour.id} className="profile-tour-card-vertical hoverable">
                  <div className="profile-tour-card-content">
                    <h4>{tour.title}</h4>
                    <div>Status: <span className="profile-tour-status">{tour.status}</span></div>
                    {tour.startDate && <div>Start: {tour.startDate}</div>}
                    {tour.endDate && <div>End: {tour.endDate}</div>}
                    {tour.destinations && tour.destinations.length > 0 && (
                      <div><strong>Destinations:</strong> {tour.destinations.join(', ')}</div>
                    )}
                    {tour.subplaces && tour.subplaces.length > 0 && (
                      <div><strong>Sub-places:</strong> {tour.subplaces.join(', ')}</div>
                    )}
                  </div>
                </div>
              ))
            ) : <div className="profile-empty">No tours yet.</div>}
          </div>
        )}
        {activeTab === 'saved' && (
          <div>
            {user.saved?.length ? (
              <ul className="profile-list">
                {user.saved.map(item => (
                  <li key={item.id} className="profile-list-item">
                    <h4>{item.title || item.name}</h4>
                  </li>
                ))}
              </ul>
            ) : <div className="profile-empty">No saved items yet.</div>}
          </div>
        )}
      </section>

      {/* Blog Modal */}
      {/* Removed modal, now using navigation to detail page */}
    </div>
  );
};

export default ProfilePage;
