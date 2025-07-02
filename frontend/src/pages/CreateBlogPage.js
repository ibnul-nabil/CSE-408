import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreateBlogPage.css';

//const API_URL = 'http://20.40.57.81:8080'; // Add API URL configuration
const API_URL = 'http://localhost:8080'; 

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Debug log to see user data
    console.log('Current user data:', user);
    // Get stored user data as backup
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('Stored user data:', storedUser);

    // If no user data is available, redirect to login
    if (!user && !storedUser) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Get stored user data as backup
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || storedUser?.id;

    // Debug log
    console.log('Submitting with user:', user);
    console.log('Stored user:', storedUser);
    console.log('Using user ID:', userId);

    // Validate required fields
    if (!title.trim() || !content.trim() || !destination.trim()) {
      setError('Title, content, and destination are required fields');
      setLoading(false);
      return;
    }

    // Validate user ID
    if (!userId) {
      setError('User ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        destination: destination.trim(),
        thumbnail_url: thumbnailUrl.trim() || null,
        user: {
          id: userId
        }
      };

      console.log('Sending blog data:', blogData);

      const response = await fetch(`${API_URL}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        setSuccess(true);
        // Clear form
        setTitle('');
        setContent('');
        setDestination('');
        setThumbnailUrl('');
        // Redirect to profile after 2 seconds
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        const data = await response.json();
        console.error('Server error:', data);
        setError(data.message || 'Failed to create blog post');
      }
    } catch (err) {
      console.error('Error creating blog:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If no user data is available, show login message
  if (!user && !JSON.parse(localStorage.getItem('user'))) {
    return (
      <div className="create-blog-container">
        <div className="create-blog-card">
          <h2>Please log in to create a blog post</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="create-blog-container">
      <div className="create-blog-card">
        <h1>Create New Blog Post</h1>
        <p className="subtitle">Share your thoughts and experiences</p>

        <form onSubmit={handleSubmit} className="blog-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your blog title"
              required
              maxLength="255"
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination">Destination *</label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter the destination"
              required
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="thumbnailUrl">Thumbnail URL (optional)</label>
            <input
              type="url"
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="Enter an image URL for your blog thumbnail"
              maxLength="255"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here..."
              required
              rows="10"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              Blog post created successfully! Redirecting...
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogPage;