import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AutocompleteInput from '../components/AutocompleteInput';
import DestinationTags from '../components/DestinationTags';
import { filterDestinations } from '../data/destinations';
import './CreateBlogPage.css';

const API_URL = process.env.REACT_APP_URL;

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({
    title: false,
    content: false,
    destination: false
  });
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

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

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    setMediaLoading(true);
    setError('');
    
    const newMediaFiles = [];
    
    files.forEach(file => {
      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 50MB.`);
        return;
      }
      
      const mediaFile = {
        file,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        preview: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };
      newMediaFiles.push(mediaFile);
    });
    
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
    setMediaLoading(false);
  };

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    setThumbnailLoading(true);
    setError('');
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setError('Thumbnail must be an image file.');
      setThumbnailLoading(false);
      return;
    }
    
    // Check file size (limit to 10MB for thumbnails)
    if (file.size > 10 * 1024 * 1024) {
      setError(`Thumbnail ${file.name} is too large. Maximum size is 10MB.`);
      setThumbnailLoading(false);
      return;
    }
    
    const thumbnailData = {
      file,
      preview: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    };
    
    setThumbnailFile(thumbnailData);
    setThumbnailLoading(false);
  };

  const removeMedia = (index) => {
    const newMediaFiles = [...mediaFiles];
    URL.revokeObjectURL(newMediaFiles[index].preview);
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);
  };

  const removeThumbnail = () => {
    if (thumbnailFile && thumbnailFile.preview) {
      URL.revokeObjectURL(thumbnailFile.preview);
    }
    setThumbnailFile(null);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const errors = {
      title: !title.trim() ? 'Title is required' : '',
      content: !content.trim() ? 'Content is required' : '',
      destination: destinations.length === 0 ? 'At least one destination is required' : ''
    };

    // Set all fields as touched when validating
    setTouched({
      title: true,
      content: true,
      destination: true
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.values(validationErrors).some(error => error)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || storedUser?.id;

    if (!userId) {
      setError('User ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      // First, upload thumbnail if provided
      let thumbnailUrl = null;
      
      if (thumbnailFile) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('file', thumbnailFile.file);
        thumbnailFormData.append('userId', userId);

        const thumbnailResponse = await fetch(`${API_URL}/api/upload/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: thumbnailFormData,
        });

        if (thumbnailResponse.ok) {
          const thumbnailResult = await thumbnailResponse.json();
          thumbnailUrl = thumbnailResult.url;
        } else {
          throw new Error('Failed to upload thumbnail');
        }
      }

      // Upload media files if any
      let uploadedMediaUrls = [];
      
      if (mediaFiles.length > 0) {
        for (let i = 0; i < mediaFiles.length; i++) {
          const mediaFile = mediaFiles[i];
          const formData = new FormData();
          formData.append('file', mediaFile.file);
          formData.append('userId', userId);

          const uploadResponse = await fetch(`${API_URL}/api/upload/media`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            uploadedMediaUrls.push({
              mediaUrl: uploadResult.url,
              mediaType: mediaFile.type,
              fileName: mediaFile.fileName,
              fileSize: mediaFile.fileSize,
              mimeType: mediaFile.mimeType,
              mediaOrder: i,
              isThumbnail: false // No longer auto-set as thumbnail
            });
          } else {
            throw new Error(`Failed to upload ${mediaFile.fileName}`);
          }
        }
      }

      // Create blog with uploaded media URLs
      const blogData = {
        userId: userId,
        title: title.trim(),
        content: content.trim(),
        customDestinations: destinations,
        thumbnailUrl: thumbnailUrl,
        media: uploadedMediaUrls,
        status: "published"
      };

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
        setTitle('');
        setContent('');
        setDestinations([]);
        setMediaFiles([]);
        setThumbnailFile(null);
        // Reset touched state to prevent red error styling on cleared fields
        setTouched({
          title: false,
          content: false,
          destination: false
        });
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        const data = await response.json();
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

  const showError = (field) => {
    if (field === 'destination') {
      return touched[field] && destinations.length === 0;
    }
    return touched[field] && !eval(field).trim();
  };

  // Handle destination input changes and generate suggestions
  const handleDestinationChange = (value) => {
    setDestination(value);
    const suggestions = filterDestinations(value, 8);
    setDestinationSuggestions(suggestions);
    
    // Clear destination error when user starts typing
    if (touched.destination) {
      setTouched(prev => ({ ...prev, destination: false }));
    }
  };

  // Handle destination selection from suggestions
  const handleDestinationSelect = (selectedDestination) => {
    // Check if destination already exists
    if (destinations.includes(selectedDestination)) {
      setDestination('');
      setDestinationSuggestions([]);
      return;
    }
    
    // Add to destinations array
    setDestinations(prev => [...prev, selectedDestination]);
    setDestination('');
    setDestinationSuggestions([]);
    
    // Clear destination error when destination is added
    if (touched.destination) {
      setTouched(prev => ({ ...prev, destination: false }));
    }
  };

  // Handle adding destination when Enter is pressed or Add button clicked
  const handleAddDestination = () => {
    const trimmedDestination = destination.trim();
    if (trimmedDestination && !destinations.includes(trimmedDestination)) {
      setDestinations(prev => [...prev, trimmedDestination]);
      setDestination('');
      setDestinationSuggestions([]);
      
      // Clear destination error when destination is added
      if (touched.destination) {
        setTouched(prev => ({ ...prev, destination: false }));
      }
    }
  };

  // Handle removing a destination
  const handleRemoveDestination = (indexToRemove) => {
    setDestinations(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle Enter key in destination input
  const handleDestinationKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDestination();
    }
  };

  return (
    <div className="create-blog-container">
      <div className="create-blog-card">
        <div className="post-header">
          <img 
            src={user?.profile_image || 'https://via.placeholder.com/40'} 
            alt="Profile" 
            className="profile-pic"
          />
          <div className="user-info">
            <h3>{user?.username || 'User'}</h3>
            <div className={`destination-input ${showError('destination') ? 'error' : ''}`}>
              <span className="location-icon">📍</span>
              <AutocompleteInput
                value={destination}
                onChange={handleDestinationChange}
                onSelect={handleDestinationSelect}
                suggestions={destinationSuggestions}
                placeholder="Type destination and press Enter to add..."
                className="destination-field"
                onKeyDown={handleDestinationKeyDown}
              />
              {destination.trim() && (
                <button
                  type="button"
                  className="add-destination-btn"
                  onClick={handleAddDestination}
                >
                  Add
                </button>
              )}
            </div>
            
            {destinations.length === 0 && (
              <div className="destination-helper-text">
                💡 You can add multiple destinations (e.g., Dhaka, Cox's Bazar, Sylhet)
              </div>
            )}
            
            <DestinationTags
              destinations={destinations}
              onRemove={handleRemoveDestination}
            />
            
            {showError('destination') && destinations.length === 0 && (
              <div className="error-message">At least one destination is required</div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className={`title-input-container ${showError('title') ? 'error' : ''}`}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              placeholder="Give your post a title *"
              className="title-input"
            />
            {showError('title') && (
              <span className="field-error">Title is required</span>
            )}
          </div>
          
          <div className={`content-input-container ${showError('content') ? 'error' : ''}`}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => handleBlur('content')}
              placeholder="What's on your mind? *"
              className="content-input"
            />
            {showError('content') && (
              <span className="field-error">Content is required</span>
            )}
          </div>

          {/* Thumbnail Upload Section */}
          <div className="thumbnail-section">
            <h4>Blog Thumbnail</h4>
            <p className="thumbnail-description">Upload a cover image for your blog post</p>
            
            {thumbnailFile ? (
              <div className="thumbnail-preview">
                <img src={thumbnailFile.preview} alt="Thumbnail preview" className="thumbnail-image" />
                <button 
                  type="button" 
                  className="remove-thumbnail-btn"
                  onClick={removeThumbnail}
                >
                  ×
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="thumbnail-upload-btn"
                onClick={() => thumbnailInputRef.current.click()}
                disabled={thumbnailLoading}
              >
                <span className="upload-icon">🖼️</span>
                {thumbnailLoading ? 'Uploading...' : 'Choose Thumbnail'}
              </button>
            )}
            
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              style={{ display: 'none' }}
            />
          </div>

          {mediaFiles.length > 0 && (
            <div className="media-preview-grid">
              {mediaFiles.map((media, index) => (
                <div key={index} className="media-preview-container">
                  {media.type === 'image' ? (
                    <img src={media.preview} alt={`Preview ${index}`} className="media-preview" />
                  ) : (
                    <video src={media.preview} className="media-preview" controls />
                  )}
                  <button 
                    type="button" 
                    className="remove-media-btn"
                    onClick={() => removeMedia(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="post-actions">
            <div className="media-buttons">
              <button 
                type="button" 
                className="media-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={mediaLoading}
              >
                <span className="media-icon">🖼️</span>
                {mediaLoading ? 'Processing...' : 'Photo/Video'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaUpload}
                style={{ display: 'none' }}
              />
              {mediaFiles.length > 0 && (
                <span className="media-count">
                  {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                Post created successfully! Redirecting...
              </div>
            )}

            <button 
              type="submit" 
              className="post-button"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogPage;