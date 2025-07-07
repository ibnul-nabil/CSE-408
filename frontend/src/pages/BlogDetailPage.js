import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BlogDetailPage.css';

const API_URL = process.env.REACT_APP_URL;

// Media Gallery Component
const MediaGallery = ({ media, apiUrl }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

  if (!media || media.length === 0) {
    return null;
  }

  const openModal = (mediaItem) => {
    setSelectedMedia(mediaItem);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const getMediaUrl = (mediaUrl) => {
    if (mediaUrl.startsWith('http')) {
      return mediaUrl;
    }
    return `${apiUrl}${mediaUrl}`;
  };

  return (
    <div className="media-gallery">
      <div className="media-grid">
        {media.map((mediaItem, index) => (
          <div key={mediaItem.id || index} className="media-item" onClick={() => openModal(mediaItem)}>
            {mediaItem.mediaType === 'image' ? (
              <img 
                src={getMediaUrl(mediaItem.mediaUrl)} 
                alt={mediaItem.caption || `Media ${index + 1}`}
                className="media-thumbnail"
              />
            ) : (
              <div className="video-thumbnail" onClick={() => openModal(mediaItem)}>
                <video 
                  src={getMediaUrl(mediaItem.mediaUrl)}
                  className="media-thumbnail"
                  muted
                />
                <div className="play-overlay">▶</div>
              </div>
            )}
            {mediaItem.caption && (
              <div className="media-caption">{mediaItem.caption}</div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for full-size media */}
      {selectedMedia && (
        <div className="media-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>
            {selectedMedia.mediaType === 'image' ? (
              <img 
                src={getMediaUrl(selectedMedia.mediaUrl)} 
                alt={selectedMedia.caption || 'Media'}
                className="modal-media"
              />
            ) : (
              <video 
                src={getMediaUrl(selectedMedia.mediaUrl)}
                className="modal-media"
                controls
                autoPlay
              />
            )}
            {selectedMedia.caption && (
              <div className="modal-caption">{selectedMedia.caption}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BlogDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [blogMedia, setBlogMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/blogs/${id}`);
        if (!res.ok) throw new Error('Failed to fetch blog');
        const data = await res.json();
        setBlog(data);
        setLikesCount(data.likes || 0);
        
        // Fetch media for this blog
        const mediaRes = await fetch(`${API_URL}/api/blogs/${id}/media`);
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setBlogMedia(mediaData);
        }
        
        // Check if current user has liked this blog
        if (user) {
          const likeStatusRes = await fetch(`${API_URL}/api/blogs/${id}/like/status?userId=${user.id}`);
          if (likeStatusRes.ok) {
            const likeData = await likeStatusRes.json();
            setLiked(likeData.userLiked);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (liked) {
        // Unlike
        const res = await fetch(`${API_URL}/api/blogs/${id}/like?userId=${user.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const data = await res.json();
          setLikesCount(data.likes);
          setLiked(false);
        }
      } else {
        // Like
        const res = await fetch(`${API_URL}/api/blogs/${id}/like?userId=${user.id}`, {
          method: 'POST',
        });
        if (res.ok) {
          const data = await res.json();
          setLikesCount(data.likes);
          setLiked(true);
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  if (loading) return <div className="blog-detail-loading">Loading blog...</div>;
  if (error) return <div className="blog-detail-error">{error}</div>;
  if (!blog) return null;

  // Combine all destinations for display
  const allDestinations = [
    ...(blog.destinations || []),
    ...(blog.customDestinations || [])
  ];

  return (
    <div className="blog-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="blog-detail-card">
        {blog.thumbnailUrl && blog.thumbnailUrl.trim() !== '' && (
          <img 
            className="blog-detail-img" 
            src={blog.thumbnailUrl} 
            alt={blog.title || 'Blog thumbnail'} 
          />
        )}
        
        <div className="blog-header">
          <h1>{blog.title || 'Untitled Blog'}</h1>
          <div className="blog-meta">
            <div className="author-info">
              {blog.authorProfileImage && (
                <img 
                  src={blog.authorProfileImage} 
                  alt={blog.authorUsername} 
                  className="author-avatar"
                />
              )}
              <span className="author-name">By {blog.authorUsername}</span>
            </div>
            <div className="blog-dates">
              <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
              {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                <span>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        {allDestinations.length > 0 && (
          <div className="blog-destinations">
            <h3>Destinations</h3>
            <div className="destination-tags">
              {allDestinations.map((dest, index) => (
                <span key={index} className="destination-tag">
                  📍 {dest}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="blog-content">
          <p>{blog.content}</p>
        </div>

        {blogMedia.length > 0 && (
          <div className="blog-media">
            <h3>Photos & Videos ({blogMedia.length})</h3>
            <MediaGallery media={blogMedia} apiUrl={API_URL} />
          </div>
        )}

        <div className="blog-engagement">
          <div className="blog-stats">
            <span>👍 {likesCount} likes</span>
            <span>💬 {blog.commentsCount || 0} comments</span>
            <span>📷 {blog.mediaCount || 0} media items</span>
          </div>
          <button 
            className={`like-button ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {liked ? '💖 Unlike' : '🤍 Like'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage; 