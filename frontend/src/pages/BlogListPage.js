import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogListPage.css';

const API_URL =  process.env.REACT_APP_URL;


const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/blogs`);
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <div className="blog-list-loading">Loading blogs...</div>;
  if (error) return <div className="blog-list-error">{error}</div>;

  return (
    <div className="blog-list-container">
      <h1 className="blog-list-title">Blogs</h1>
      <div className="blog-card-grid">
        {blogs.map(blog => (
          <div key={blog.id} className="blog-card" onClick={() => navigate(`/blogs/${blog.id}`)}>
            <img className="blog-card-img" src={blog.thumbnailUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'} alt={blog.title} />
            <div className="blog-card-content">
              <h2>{blog.title}</h2>
              <p>{blog.content?.length > 100 ? blog.content.substring(0, 100) + '...' : blog.content}</p>
              <div className="blog-card-footer">
                <span className="blog-card-destination">📍 {blog.destination}</span>
                <span className="blog-card-date">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="blog-card-stats">
                <span className="blog-card-likes">
                  ❤️ {blog.likes || 0} likes
                </span>
              </div>
              <button 
                className="read-more-button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/blogs/${blog.id}`);
                }}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogListPage; 