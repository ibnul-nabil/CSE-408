import React, { useState, useEffect } from 'react';
import './BlogSuggestions.css';

const API_URL = process.env.REACT_APP_URL;

const BlogSuggestions = ({ destinationId, destinationName }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            if (!destinationId) return;
            
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/blogs/destination/${destinationId}`);
                if (!response.ok) throw new Error('Failed to fetch blogs');
                const data = await response.json();
                setBlogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [destinationId]);

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
                            <a 
                                href={`/blogs/${blog.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="read-blog-btn"
                            >
                                Read Blog
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogSuggestions; 