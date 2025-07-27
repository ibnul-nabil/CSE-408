import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import './CommentsSection.css';

const API_URL = process.env.REACT_APP_URL;

// Move CommentItem outside as a separate memoized component
const CommentItem = React.memo(({ 
  comment, 
  isReply = false, 
  expandedReplies,
  onLikeComment,
  onUnlikeComment,
  onToggleReplies,
  onSetReplyingTo,
  replyingTo,
  replyText,
  onReplyTextChange,
  onReplySubmit,
  onCancelReply,
  submittingReplies,
  currentUser
}) => {
  const canInteract = currentUser.id;

  const formatTimeAgo = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }, []);

  return (
    <div className={`comment-item ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <img 
          src={comment.userProfileImage || 'https://via.placeholder.com/32'} 
          alt="User" 
          className="comment-avatar"
        />
        <div className="comment-meta">
          <span className="comment-author">
            {comment.username || 'Anonymous'}
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
          onClick={() => comment.userLiked ? onUnlikeComment(comment.id) : onLikeComment(comment.id)}
          disabled={!canInteract}
        >
          {comment.userLiked ? '❤️' : '🤍'} {comment.likes || 0}
        </button>

        {!isReply && canInteract && (
          <button
            className="comment-reply-btn"
            onClick={() => onSetReplyingTo(comment.id)}
          >
            💬 Reply
          </button>
        )}

        {!isReply && comment.replies && comment.replies.length > 0 && (
          <button
            className="toggle-replies-btn"
            onClick={() => onToggleReplies(comment.id)}
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
            onChange={onReplyTextChange}
            placeholder="Write a reply..."
            className="reply-textarea"
          />
          <div className="reply-form-actions">
            <button
              onClick={() => onReplySubmit(comment.id)}
              disabled={!replyText.trim() || submittingReplies.has(comment.id)}
              className="reply-submit-btn"
            >
              {submittingReplies.has(comment.id) ? 'Posting...' : 'Reply'}
            </button>
            <button
              onClick={onCancelReply}
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
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              isReply={true}
              expandedReplies={expandedReplies}
              onLikeComment={onLikeComment}
              onUnlikeComment={onUnlikeComment}
              onToggleReplies={onToggleReplies}
              onSetReplyingTo={onSetReplyingTo}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onReplySubmit={onReplySubmit}
              onCancelReply={onCancelReply}
              submittingReplies={submittingReplies}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
});

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
  const [submittingReplies, setSubmittingReplies] = useState(new Set());

  // Memoize current user to prevent unnecessary re-calculations
  const currentUser = useMemo(() => {
    return user || JSON.parse(localStorage.getItem('user') || '{}');
  }, [user]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleReplyTextChange = useCallback((e) => {
    setReplyText(e.target.value);
  }, []);

  const handleNewCommentChange = useCallback((e) => {
    setNewComment(e.target.value);
  }, []);

  // Stable callbacks that won't change on every render
  const handleSetReplyingTo = useCallback((commentId) => {
    setReplyingTo(prev => prev === commentId ? null : commentId);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyText('');
  }, []);

  const fetchComments = useCallback(async () => {
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
  }, [blogId]);

  useEffect(() => {
    if (blogId) {
      fetchComments();
    }
  }, [blogId, fetchComments]);

  const submitComment = useCallback(async (content, parentCommentId = null) => {
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
  }, [currentUser.id, blogId]);

  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    const success = await submitComment(newComment);
    if (success) {
      setNewComment('');
    }
    setSubmitting(false);
  }, [newComment, submitComment]);

  const likeComment = useCallback(async (commentId) => {
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
  }, [currentUser.id]);

  const unlikeComment = useCallback(async (commentId) => {
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
  }, [currentUser.id]);

  const updateCommentLikes = useCallback((commentId, newLikesCount, userLiked) => {
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
  }, []);

  const toggleReplies = useCallback((commentId) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const handleReplySubmit = useCallback(async (commentId) => {
    if (!replyText.trim()) return;

    setSubmittingReplies(prev => new Set([...prev, commentId]));
    setError('');

    const success = await submitComment(replyText, commentId);
    if (success) {
      setReplyText('');
      setReplyingTo(null);
      
      // Refresh all comments to get the updated replies
      await fetchComments();
    }
    setSubmittingReplies(prev => {
      const newSet = new Set(prev);
      newSet.delete(commentId);
      return newSet;
    });
  }, [replyText, submitComment, fetchComments]);

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

      {currentUser.id ? (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <div className="comment-form-header">
            <img 
              src={currentUser.profileImage || 'https://via.placeholder.com/40'} 
              alt="Your avatar" 
              className="comment-form-avatar"
            />
            <span className="comment-form-username">
              {currentUser.username || 'You'}
            </span>
          </div>
          <textarea
            value={newComment}
            onChange={handleNewCommentChange}
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
            <CommentItem 
              key={comment.id} 
              comment={comment}
              expandedReplies={expandedReplies}
              onLikeComment={likeComment}
              onUnlikeComment={unlikeComment}
              onToggleReplies={toggleReplies}
              onSetReplyingTo={handleSetReplyingTo}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={handleReplyTextChange}
              onReplySubmit={handleReplySubmit}
              onCancelReply={handleCancelReply}
              submittingReplies={submittingReplies}
              currentUser={currentUser}
            />
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