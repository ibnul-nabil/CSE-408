import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './CommentsSection.css';

const API_URL = process.env.REACT_APP_URL;

const CommentsSection = ({ blogId, className = '' }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  useEffect(() => {
    if (blogId) {
      fetchComments();
    }
  }, [blogId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/blogs/${blogId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        setError('Failed to load comments');
      }
    } catch (err) {
      setError('Error loading comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/api/blogs/comments/${commentId}/replies`);
      if (response.ok) {
        const replies = await response.json();
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, replies: replies }
              : comment
          )
        );
        setExpandedReplies(prev => new Set([...prev, commentId]));
      }
    } catch (err) {
      console.error('Error fetching replies:', err);
    }
  };

  const getCurrentUser = () => {
    return user || JSON.parse(localStorage.getItem('user') || '{}');
  };

  const submitComment = async (content, parentCommentId = null) => {
    const currentUser = getCurrentUser();
    if (!currentUser.id) {
      setError('Please log in to comment');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/blogs/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          blogId: parseInt(blogId),
          userId: currentUser.id,
          content: content.trim(),
          parentCommentId
        })
      });

      if (response.ok) {
        const newCommentData = await response.json();
        
        if (parentCommentId) {
          // Add reply to existing comment
          setComments(prevComments => 
            prevComments.map(comment => 
              comment.id === parentCommentId 
                ? { 
                    ...comment, 
                    replies: [...(comment.replies || []), newCommentData]
                  }
                : comment
            )
          );
          setExpandedReplies(prev => new Set([...prev, parentCommentId]));
        } else {
          // Add new top-level comment
          setComments(prevComments => [newCommentData, ...prevComments]);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to post comment');
        return false;
      }
    } catch (err) {
      setError('Error posting comment');
      console.error('Error submitting comment:', err);
      return false;
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    const success = await submitComment(newComment);
    if (success) {
      setNewComment('');
    }
    setSubmitting(false);
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    setError('');

    const success = await submitComment(replyText, commentId);
    if (success) {
      setReplyText('');
      setReplyingTo(null);
    }
    setSubmitting(false);
  };

  const likeComment = async (commentId) => {
    const currentUser = getCurrentUser();
    if (!currentUser.id) {
      setError('Please log in to like comments');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/blogs/comments/${commentId}/like?userId=${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        updateCommentLikes(commentId, data.likes, true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to like comment');
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const unlikeComment = async (commentId) => {
    const currentUser = getCurrentUser();
    if (!currentUser.id) return;

    try {
      const response = await fetch(`${API_URL}/api/blogs/comments/${commentId}/like?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        updateCommentLikes(commentId, data.likes, false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to unlike comment');
      }
    } catch (err) {
      console.error('Error unliking comment:', err);
    }
  };

  const updateCommentLikes = (commentId, newLikesCount, userLiked) => {
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes: newLikesCount, userLiked };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? { ...reply, likes: newLikesCount, userLiked }
                : reply
            )
          };
        }
        return comment;
      })
    );
  };

  const toggleReplies = (commentId) => {
    if (expandedReplies.has(commentId)) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      fetchReplies(commentId);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const currentUser = getCurrentUser();
    const canInteract = currentUser.id;

    return (
      <div className={`comment-item ${isReply ? 'reply' : ''}`}>
        <div className="comment-header">
          <img 
            src={comment.user?.profileImage || 'https://via.placeholder.com/32'} 
            alt="User" 
            className="comment-avatar"
          />
          <div className="comment-meta">
            <span className="comment-author">
              {comment.user?.username || 'Anonymous'}
            </span>
            <span className="comment-time">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
        </div>

        <div className="comment-content">
          {comment.content}
        </div>

        <div className="comment-actions">
          <button
            className={`comment-like-btn ${comment.userLiked ? 'liked' : ''}`}
            onClick={() => comment.userLiked ? unlikeComment(comment.id) : likeComment(comment.id)}
            disabled={!canInteract}
          >
            {comment.userLiked ? '❤️' : '🤍'} {comment.likes || 0}
          </button>

          {!isReply && canInteract && (
            <button
              className="comment-reply-btn"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              💬 Reply
            </button>
          )}

          {!isReply && comment.replies && comment.replies.length > 0 && (
            <button
              className="toggle-replies-btn"
              onClick={() => toggleReplies(comment.id)}
            >
              {expandedReplies.has(comment.id) 
                ? `Hide ${comment.replies.length} replies` 
                : `Show ${comment.replies.length} replies`}
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="reply-textarea"
            />
            <div className="reply-form-actions">
              <button
                onClick={() => handleReplySubmit(comment.id)}
                disabled={!replyText.trim() || submitting}
                className="reply-submit-btn"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="reply-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isReply && expandedReplies.has(comment.id) && comment.replies && (
          <div className="replies-container">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  return (
    <div className={`comments-section ${className}`}>
      <h3 className="comments-title">
        Comments ({comments.length})
      </h3>

      {error && (
        <div className="comments-error">
          {error}
        </div>
      )}

      {getCurrentUser().id ? (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <div className="comment-form-header">
            <img 
              src={getCurrentUser().profileImage || 'https://via.placeholder.com/40'} 
              alt="Your avatar" 
              className="comment-form-avatar"
            />
            <span className="comment-form-username">
              {getCurrentUser().username || 'You'}
            </span>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-textarea"
            rows={3}
          />
          <div className="comment-form-actions">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="comment-submit-btn"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          Please log in to leave a comment.
        </div>
      )}

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="no-comments">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection; 