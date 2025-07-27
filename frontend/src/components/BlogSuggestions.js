import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogSuggestions.css';

const API_URL = process.env.REACT_APP_URL;

const BlogSuggestions = ({ destinationId, destinationName }) => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            if (!destinationId && !destinationName) return;
            
            setLoading(true);
            setError(null);
            try {
                let response;
                if (destinationId) {
                    // Use destination ID if available
                    response = await fetch(`${API_URL}/api/tours/blog-suggestions/${destinationId}`);
                } else if (destinationName) {
                    // Use the search endpoint for destination names
                    response = await fetch(`${API_URL}/api/tours/blog-suggestions/search/${encodeURIComponent(destinationName)}`);
                }
                
                if (!response.ok) throw new Error('Failed to fetch blog suggestions');
                const data = await response.json();
                setBlogs(data);
                console.log('📚 Fetched blog suggestions:', data);
            } catch (err) {
                console.error('❌ Error fetching blog suggestions:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [destinationId, destinationName]);

    if (loading) return <div className="blog-suggestions-loading">Loading blogs...</div>;
    if (error) return <div className="blog-suggestions-error">{error}</div>;
    if (!blogs.length) return null;

    return (
        <div className="blog-suggestions">
            <h3>Travel Blogs about {destinationName}</h3>
            <div className="blog-suggestions-grid">
                {blogs.map(blog => (
                    <div key={blog.id} className="blog-suggestion-card">
                        {blog.thumbnailUrl && (
                            <div className="blog-image">
                                <img src={blog.thumbnailUrl} alt={blog.title || 'Blog thumbnail'} />
                            </div>
                        )}
                        <div className="blog-info">
                            <h4>{blog.title || 'Untitled Blog'}</h4>
                            <p className="blog-author">By {blog.authorUsername}</p>
                            {blog.content && (
                                <p className="blog-preview">
                                    {blog.content.length > 100 ? blog.content.substring(0, 100) + '...' : blog.content}
                                </p>
                            )}
                            <div className="blog-stats">
                                <span>👍 {blog.likes || 0}</span>
                                <span>💬 {blog.commentsCount || 0}</span>
                                <span>📷 {blog.mediaCount || 0}</span>
                            </div>
                            <button 
                                onClick={() => navigate(`/blogs/${blog.id}`)}
                                className="read-blog-btn"
                            >
                                Read Blog
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogSuggestions; 