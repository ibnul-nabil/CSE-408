import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AutocompleteInput from '../components/AutocompleteInput';
import DestinationTags from '../components/DestinationTags';
import { filterDestinations } from '../data/destinations';
import { getImageUrl } from '../utils/imageUtils';
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

      // Upload media files
      const mediaUploadPromises = mediaFiles.map(async (media, index) => {
        const formData = new FormData();
        formData.append('file', media.file);
        formData.append('userId', userId);

        const response = await fetch(`${API_URL}/api/upload/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          return {
            mediaUrl: result.url,
            mediaType: media.type,
            fileName: media.fileName,
            fileSize: Math.min(media.fileSize, 2147483647),
            mimeType: media.mimeType,
            mediaOrder: index
          };
        } else {
          throw new Error(`Failed to upload ${media.fileName}`);
        }
      });

      const uploadedMedia = await Promise.all(mediaUploadPromises);

      // Create blog request
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        customDestinations: destinations,
        userId: userId,
        thumbnailUrl: thumbnailUrl,
        media: uploadedMedia,
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
        // Reset form state
        setTitle('');
        setContent('');
        setDestination('');
        setDestinations([]);
        setMediaFiles([]);
        setThumbnailFile(null);
        setTouched({
          title: false,
          content: false,
          destination: false
        });
        
        setTimeout(() => {
          navigate('/my-blogs');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      setError(error.message || 'Failed to create blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showError = (field) => {
    const errors = {
      title: !title.trim() ? 'Title is required' : '',
      content: !content.trim() ? 'Content is required' : '',
      destination: destinations.length === 0 ? 'At least one destination is required' : ''
    };
    return touched[field] && errors[field];
  };

  const handleDestinationChange = (value) => {
    setDestination(value);
    if (value.length > 0) {
      const suggestions = filterDestinations(value);
      setDestinationSuggestions(suggestions);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleDestinationSelect = (selectedDestination) => {
    if (!destinations.some(dest => 
      dest.toLowerCase() === selectedDestination.toLowerCase()
    )) {
      setDestinations(prev => [...prev, selectedDestination]);
    }
    setDestination('');
    setDestinationSuggestions([]);
    setTouched(prev => ({ ...prev, destination: false }));
  };

  const handleAddDestination = () => {
    const trimmedDestination = destination.trim();
    
    if (trimmedDestination && !destinations.some(dest => 
      dest.toLowerCase() === trimmedDestination.toLowerCase()
    )) {
      setDestinations(prev => [...prev, trimmedDestination]);
      setDestination('');
      setDestinationSuggestions([]);
      setTouched(prev => ({ ...prev, destination: false }));
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
    <div className="modern-blog-container">
      <div className="blog-header">
        <h1 className="page-title">Create New Blog Post</h1>
        <p className="page-subtitle">Share your travel experiences with the world</p>
      </div>

      <div className="blog-content">
        <div className="blog-form-card">
          {/* Author Section */}
          <div className="author-section">
            <div className="author-info">
              <h3 className="author-name">{user?.username || 'User'}</h3>
              <p className="author-subtitle">Writing a new blog post</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="blog-form">
            {/* Title Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Title</h3>
                <span className="required-indicator">*</span>
              </div>
              <div className={`input-wrapper ${showError('title') ? 'error' : ''}`}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  placeholder="Give your blog post an engaging title..."
                  className="title-input"
                />
                {showError('title') && (
                  <div className="error-text">{showError('title')}</div>
                )}
              </div>
            </div>

            {/* Destinations Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Destinations</h3>
                <span className="required-indicator">*</span>
              </div>
              <div className={`input-wrapper ${showError('destination') ? 'error' : ''}`}>
                <div className="destination-input-wrapper">
                  <span className="input-icon">📍</span>
                  <AutocompleteInput
                    value={destination}
                    onChange={handleDestinationChange}
                    onSelect={handleDestinationSelect}
                    suggestions={destinationSuggestions}
                    placeholder="Type destination and press Enter to add..."
                    className="destination-input"
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
                  <div className="helper-text">
                    💡 Add destinations you visited (e.g., Dhaka, Cox's Bazar, Sylhet)
                  </div>
                )}
                
                <DestinationTags
                  destinations={destinations}
                  onRemove={handleRemoveDestination}
                />
                
                {showError('destination') && destinations.length === 0 && (
                  <div className="error-text">{showError('destination')}</div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Content</h3>
                <span className="required-indicator">*</span>
              </div>
              <div className={`input-wrapper ${showError('content') ? 'error' : ''}`}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={() => handleBlur('content')}
                  placeholder="Tell your story... What made this trip special? Share your experiences, tips, and memories!"
                  className="content-textarea"
                  rows="8"
                />
                {showError('content') && (
                  <div className="error-text">{showError('content')}</div>
                )}
              </div>
            </div>

            {/* Thumbnail Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Cover Photo</h3>
                <span className="optional-indicator">(Optional)</span>
              </div>
              <div className="thumbnail-section">
                <p className="section-description">Choose a cover image that represents your blog post</p>
                
                {thumbnailFile ? (
                  <div className="thumbnail-preview">
                    <img src={thumbnailFile.preview} alt="Cover preview" className="thumbnail-image" />
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={removeThumbnail}
                      title="Remove cover photo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="upload-area" onClick={() => thumbnailInputRef.current.click()}>
                    <div className="upload-content">
                      <div className="upload-icon">🖼️</div>
                      <p className="upload-text">
                        {thumbnailLoading ? 'Uploading...' : 'Click to upload cover photo'}
                      </p>
                      <p className="upload-subtext">Recommended: 1200×630 pixels</p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Media Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Photos & Videos</h3>
                <span className="optional-indicator">(Optional)</span>
              </div>
              <div className="media-section">
                <p className="section-description">Add photos and videos to make your blog more engaging</p>
                
                <button 
                  type="button" 
                  className="media-upload-btn"
                  onClick={() => fileInputRef.current.click()}
                  disabled={mediaLoading}
                >
                  <span className="btn-icon">📸</span>
                  {mediaLoading ? 'Processing...' : 'Add Photos/Videos'}
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
                  <div className="media-grid">
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="media-item">
                        {media.type === 'image' ? (
                          <img src={media.preview} alt={`Media ${index + 1}`} className="media-preview" />
                        ) : (
                          <video src={media.preview} className="media-preview" controls />
                        )}
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => removeMedia(index)}
                          title="Remove media"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {mediaFiles.length > 0 && (
                  <div className="media-count">
                    {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="submit-section">
              {error && <div className="error-message">{error}</div>}
              {success && (
                <div className="success-message">
                  ✅ Blog post created successfully! Redirecting to your blogs...
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🚀</span>
                      Publish Blog
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;