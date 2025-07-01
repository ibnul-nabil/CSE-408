import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogDetailPage.css';

const API_URL = 'http://localhost:8080';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/blogs/${id}`);
        if (!res.ok) throw new Error('Failed to fetch blog');
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) return <div className="blog-detail-loading">Loading blog...</div>;
  if (error) return <div className="blog-detail-error">{error}</div>;
  if (!blog) return null;

  return (
    <div className="blog-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="blog-detail-card">
        <img className="blog-detail-img" src={blog.thumbnail_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop'} alt={blog.title} />
        <h1>{blog.title}</h1>
        <h3 className="blog-detail-destination">Destination: {blog.destination}</h3>
        <p className="blog-detail-content">{blog.content}</p>
      </div>
    </div>
  );
};

export default BlogDetailPage; 