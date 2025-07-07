import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BlogListPage.css'; // We'll reuse the BlogListPage styles

const API_URL = process.env.REACT_APP_URL;

const MyBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserBlogs = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || storedUser?.id;

        if (!userId) {
          throw new Error('User not found. Please log in again.');
        }

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        const res = await fetch(`${API_URL}/api/blogs/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, [user]);

  if (loading) {
    return (
      <div className="blog-list-container">
        <div className="blog-list-loading">
          <div className="loading-spinner"></div>
          <p>Loading your blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-list-container">
        <div className="blog-list-error">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      <div className="blog-list-header">
        <h1 className="blog-list-title">My Blogs</h1>
        <button 
          className="create-blog-button"
          onClick={() => navigate('/create-blog')}
        >
          ✍️ Write New Blog
        </button>
      </div>

      {blogs.length === 0 ? (
        <div className="no-blogs-message">
          <p>You haven't written any blogs yet.</p>
          <button 
            onClick={() => navigate('/create-blog')}
            className="create-first-blog-button"
          >
            Write Your First Blog
          </button>
        </div>
      ) : (
        <div className="blog-card-grid">
          {blogs.map(blog => {
            // Combine all destinations for display
            const allDestinations = [
              ...(blog.destinations || []),
              ...(blog.customDestinations || [])
            ];
            const destinationText = allDestinations.length > 0 
              ? allDestinations.slice(0, 2).join(', ') + (allDestinations.length > 2 ? '...' : '')
              : 'No destination';

            return (
              <div key={blog.id} className="blog-card" onClick={() => navigate(`/blogs/${blog.id}`)}>
                <img 
                  className="blog-card-img" 
                  src={blog.thumbnailUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'} 
                  alt={blog.title || 'Blog post'} 
                />
                <div className="blog-card-content">
                  <h2>{blog.title || 'Untitled Blog'}</h2>
                  <p>{blog.content?.length > 100 ? blog.content.substring(0, 100) + '...' : blog.content}</p>
                  
                  <div className="blog-card-destinations">
                    <span className="blog-card-destination">📍 {destinationText}</span>
                  </div>
                  
                  <div className="blog-card-meta">
                    <div className="blog-card-author">
                      {blog.authorProfileImage && (
                        <img 
                          src={blog.authorProfileImage} 
                          alt={blog.authorUsername} 
                          className="blog-card-author-avatar"
                        />
                      )}
                      <span>By {blog.authorUsername}</span>
                    </div>
                    <span className="blog-card-date">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="blog-card-stats">
                    <span className="blog-card-likes">❤️ {blog.likes || 0}</span>
                    <span className="blog-card-comments">💬 {blog.commentsCount || 0}</span>
                    <span className="blog-card-media">📷 {blog.mediaCount || 0}</span>
                    <span className="blog-card-status">{blog.status || 'published'}</span>
                  </div>
                  
                  <button 
                    className="read-more-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/blogs/${blog.id}`);
                    }}
                  >
                    Read More
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBlogsPage; 