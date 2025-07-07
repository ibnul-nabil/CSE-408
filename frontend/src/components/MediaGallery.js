import React, { useState } from 'react';
import './MediaGallery.css';

const MediaGallery = ({ media = [], className = '' }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!media || media.length === 0) {
    return null;
  }

  const openLightbox = (mediaItem, index) => {
    setSelectedMedia(mediaItem);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const navigateLightbox = (direction) => {
    const newIndex = direction === 'next' 
      ? (lightboxIndex + 1) % media.length
      : (lightboxIndex - 1 + media.length) % media.length;
    
    setLightboxIndex(newIndex);
    setSelectedMedia(media[newIndex]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      navigateLightbox('next');
    } else if (e.key === 'ArrowLeft') {
      navigateLightbox('prev');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className={`media-gallery ${className}`}>
        <div className="media-grid">
          {media.map((mediaItem, index) => (
            <div 
              key={mediaItem.id || index} 
              className="media-item"
              onClick={() => openLightbox(mediaItem, index)}
            >
              {mediaItem.mediaType === 'image' ? (
                <img
                  src={mediaItem.mediaUrl}
                  alt={mediaItem.caption || `Media ${index + 1}`}
                  className="media-thumbnail"
                  loading="lazy"
                />
              ) : (
                <div className="video-thumbnail">
                  <video
                    src={mediaItem.mediaUrl}
                    className="media-thumbnail"
                    preload="metadata"
                  />
                  <div className="video-overlay">
                    <div className="play-button">▶</div>
                    {mediaItem.duration && (
                      <div className="video-duration">
                        {formatDuration(mediaItem.duration)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {mediaItem.caption && (
                <div className="media-caption">
                  {mediaItem.caption}
                </div>
              )}
              
              {mediaItem.isThumbnail && (
                <div className="thumbnail-badge">
                  Thumbnail
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div 
          className="lightbox-overlay" 
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              ×
            </button>
            
            {media.length > 1 && (
              <>
                <button 
                  className="lightbox-nav lightbox-prev" 
                  onClick={() => navigateLightbox('prev')}
                >
                  ‹
                </button>
                <button 
                  className="lightbox-nav lightbox-next" 
                  onClick={() => navigateLightbox('next')}
                >
                  ›
                </button>
              </>
            )}

            <div className="lightbox-media">
              {selectedMedia.mediaType === 'image' ? (
                <img
                  src={selectedMedia.mediaUrl}
                  alt={selectedMedia.caption || 'Media'}
                  className="lightbox-image"
                />
              ) : (
                <video
                  src={selectedMedia.mediaUrl}
                  controls
                  className="lightbox-video"
                  autoPlay
                />
              )}
            </div>

            {selectedMedia.caption && (
              <div className="lightbox-caption">
                {selectedMedia.caption}
              </div>
            )}

            <div className="lightbox-info">
              <span className="media-counter">
                {lightboxIndex + 1} of {media.length}
              </span>
              {selectedMedia.fileName && (
                <span className="media-filename">
                  {selectedMedia.fileName}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery; 