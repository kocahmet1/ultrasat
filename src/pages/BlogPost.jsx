import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, 
  faClock, 
  faEye, 
  faTag,
  faUser,
  faArrowLeft,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import '../styles/BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBlogPost();
      fetchRelatedPosts();
    }
  }, [id]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blog/posts/${id}`);
      const data = await response.json();

      if (response.ok) {
        setBlogPost(data);
        // Increment view count is handled by the API
      } else {
        setError(data.error || 'Blog post not found');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      // Fetch some recent posts as related posts
      const response = await fetch('/api/blog/posts?limit=3');
      const data = await response.json();

      if (response.ok) {
        // Filter out the current post
        setRelatedPosts(data.posts.filter(post => post.id !== id));
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="blog-post-loading">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="blog-post-container">
        <div className="blog-post-error">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <h2>Blog Post Not Found</h2>
          <p>{error || 'The requested blog post could not be found.'}</p>
          <Link to="/blog" className="back-to-blog-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      {/* Back Navigation */}
      <div className="blog-post-nav">
        <Link to="/blog" className="back-link">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Blog
        </Link>
      </div>

      {/* Main Content */}
      <article className="blog-post-content">
        {/* Header */}
        <header className="blog-post-header">
          {blogPost.imageUrl && (
            <div className="blog-post-image">
              <img src={blogPost.imageUrl} alt={blogPost.title} />
            </div>
          )}
          
          <div className="blog-post-meta">
            <div className="blog-post-categories">
              {blogPost.category && (
                <span className="category-tag">{blogPost.category}</span>
              )}
            </div>
            
            <h1 className="blog-post-title">{blogPost.title}</h1>
            
            <div className="blog-post-info">
              <span className="post-author">
                <FontAwesomeIcon icon={faUser} />
                {blogPost.author || 'Admin'}
              </span>
              
              <span className="post-date">
                <FontAwesomeIcon icon={faCalendar} />
                {formatDate(blogPost.createdAt)}
              </span>
              
              <span className="post-read-time">
                <FontAwesomeIcon icon={faClock} />
                {blogPost.readTime || 5} min read
              </span>
              
              <span className="post-views">
                <FontAwesomeIcon icon={faEye} />
                {blogPost.views || 0} views
              </span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div className="blog-post-body">
          <div 
            className="blog-post-text"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />
        </div>

        {/* Tags */}
        {blogPost.tags && blogPost.tags.length > 0 && (
          <div className="blog-post-tags">
            <FontAwesomeIcon icon={faTag} />
            <div className="tags-list">
              {blogPost.tags.map((tag, index) => (
                <Link 
                  key={index}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="tag-link"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <h3>Related Posts</h3>
          <div className="related-posts-grid">
            {relatedPosts.slice(0, 3).map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.id}`}
                className="related-post-card"
              >
                {post.imageUrl && (
                  <div className="related-post-image">
                    <img src={post.imageUrl} alt={post.title} />
                  </div>
                )}
                <div className="related-post-content">
                  <h4>{post.title}</h4>
                  <p>{post.excerpt}</p>
                  <div className="related-post-meta">
                    <span>{formatDate(post.createdAt)}</span>
                    <span>{post.readTime || 5} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost; 