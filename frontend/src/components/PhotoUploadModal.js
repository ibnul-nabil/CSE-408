import React, { useState, useRef } from 'react';
import './PhotoUploadModal.css';

const API_URL = process.env.REACT_APP_URL;

const PhotoUploadModal = ({ 
  isOpen, 
  onClose, 
  currentPhoto, 
  photoType, // 'profile' or 'cover'
  userId,
  onPhotoUpdate 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('options'); // 'options', 'view', 'upload'
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
    setViewMode('upload');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Upload file first
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', userId);

      const uploadResponse = await fetch(`${API_URL}/api/upload/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.url;

      // Update profile with new photo URL
      const updateEndpoint = photoType === 'profile' ? 'profile-image' : 'cover-photo';
      const updateResponse = await fetch(`${API_URL}/api/profile/${userId}/${updateEndpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(imageUrl),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile');
      }

      // Call callback to update parent component
      onPhotoUpdate(imageUrl);
      onClose();
      
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    setViewMode('options');
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Reset modal state when it opens or when photoType changes
  React.useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen, photoType]);

  if (!isOpen) return null;

  return (
    <div className="photo-modal-overlay" onClick={handleClose}>
      <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="photo-modal-header">
          <h3>{photoType === 'profile' ? 'Profile Picture' : 'Cover Photo'}</h3>
          <button className="photo-modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="photo-modal-content">
          {viewMode === 'options' && (
            <div className="photo-options">
              {currentPhoto && currentPhoto.trim() && (
                <button 
                  className="photo-option-btn view-btn"
                  onClick={() => setViewMode('view')}
                >
                  <span className="photo-option-icon">👁️</span>
                  See {photoType === 'profile' ? 'Profile Picture' : 'Cover Photo'}
                </button>
              )}
              <button 
                className="photo-option-btn upload-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="photo-option-icon">📤</span>
                Upload New {photoType === 'profile' ? 'Profile Picture' : 'Cover Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {viewMode === 'view' && currentPhoto && currentPhoto.trim() && (
            <div className="photo-view">
              <img 
                src={currentPhoto} 
                alt={photoType === 'profile' ? 'Profile Picture' : 'Cover Photo'}
                className={`photo-preview ${photoType === 'cover' ? 'cover-preview' : 'profile-preview'}`}
              />
              <div className="photo-actions">
                <button 
                  className="photo-action-btn secondary"
                  onClick={() => setViewMode('options')}
                >
                  Back
                </button>
                <button 
                  className="photo-action-btn primary"
                  onClick={() => fileInputRef.current.click()}
                >
                  Change Photo
                </button>
              </div>
            </div>
          )}

          {viewMode === 'upload' && (
            <div className="photo-upload">
              {preview && (
                <img 
                  src={preview} 
                  alt="Preview"
                  className={`photo-preview ${photoType === 'cover' ? 'cover-preview' : 'profile-preview'}`}
                />
              )}
              
              {error && <div className="photo-error">{error}</div>}
              
              <div className="photo-actions">
                <button 
                  className="photo-action-btn secondary"
                  onClick={resetModal}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  className="photo-action-btn primary"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal; 