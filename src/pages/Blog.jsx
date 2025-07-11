import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faCalendar, 
  faClock, 
  faEye, 
  faTag,
  faUser,
  faChevronRight,
  faSpinner,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Blog.css';

const Blog = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogPosts, setBlogPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const postsPerPage = 9;

  useEffect(() => {
    fetchBlogPosts();
    fetchFeaturedPosts();
  }, [selectedCategory, selectedTag, currentPage]);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      fetchBlogPosts();
    }
  }, [searchTerm]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: postsPerPage.toString(),
        page: currentPage.toString()
      });

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (selectedTag) {
        params.append('tag', selectedTag);
      }

      const response = await fetch(`/api/blog/posts?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBlogPosts(data.posts || []);
        setTotalPosts(data.total || 0);
        
        // Extract unique categories and tags for filters
        const uniqueCategories = [...new Set(data.posts.map(post => post.category))];
        const uniqueTags = [...new Set(data.posts.flatMap(post => post.tags || []))];
        setCategories(uniqueCategories);
        setTags(uniqueTags);
      } else {
        console.error('Failed to fetch blog posts:', data.error);
        setBlogPosts([]);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts?featured=true&limit=3');
      const data = await response.json();

      if (response.ok) {
        setFeaturedPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchBlogPosts();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/blog/search?q=${encodeURIComponent(searchTerm)}&limit=${postsPerPage}`);
      const data = await response.json();

      if (response.ok) {
        setBlogPosts(data.posts || []);
        setTotalPosts(data.total || 0);
      } else {
        console.error('Search failed:', data.error);
        setBlogPosts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    
    if (filterType === 'category') {
      setSelectedCategory(value);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (value === 'all') {
          newParams.delete('category');
        } else {
          newParams.set('category', value);
        }
        newParams.delete('page');
        return newParams;
      });
    } else if (filterType === 'tag') {
      setSelectedTag(value);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (value) {
          newParams.set('tag', value);
        } else {
          newParams.delete('tag');
        }
        newParams.delete('page');
        return newParams;
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (searchTerm) {
        newParams.set('search', searchTerm);
      } else {
        newParams.delete('search');
      }
      newParams.delete('page');
      return newParams;
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', page.toString());
      return newParams;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTag('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="container">
          <div className="hero-content">
            <h1>SAT Prep Blog</h1>
            <p>Insights, tips, and strategies to help you ace the SAT</p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && !searchTerm && (
        <section className="featured-posts">
          <div className="container">
            <h2 className="section-title">Featured Articles</h2>
            <div className="featured-posts-grid">
              {featuredPosts.map(post => (
                <article key={post.id} className="featured-post-card">
                  {post.imageUrl && (
                    <div className="post-image">
                      <img src={post.imageUrl} alt={post.title} />
                      <div className="featured-badge">Featured</div>
                    </div>
                  )}
                  <div className="post-content">
                    <div className="post-meta">
                      <span className="post-category">{post.category}</span>
                      <span className="post-date">
                        <FontAwesomeIcon icon={faCalendar} />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <h3>
                      <Link to={`/blog/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="post-excerpt">{post.excerpt}</p>
                    <div className="post-footer">
                      <div className="post-stats">
                        <span>
                          <FontAwesomeIcon icon={faClock} />
                          {post.readTime} min read
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faEye} />
                          {post.views || 0} views
                        </span>
                      </div>
                      <Link to={`/blog/${post.id}`} className="read-more-btn">
                        Read More <FontAwesomeIcon icon={faChevronRight} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="blog-content">
        <div className="container">
          <div className="content-layout">
            {/* Sidebar Filters */}
            <aside className="blog-sidebar">
              <div className="sidebar-content">
                <div className="filter-header">
                  <h3>Filters</h3>
                  <button 
                    className="mobile-filter-toggle"
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    <FontAwesomeIcon icon={faFilter} />
                  </button>
                </div>
                
                <div className={`filters ${filterOpen ? 'filters-open' : ''}`}>
                  {/* Categories Filter */}
                  <div className="filter-group">
                    <h4>Categories</h4>
                    <div className="filter-options">
                      <label className={selectedCategory === 'all' ? 'active' : ''}>
                        <input
                          type="radio"
                          name="category"
                          value="all"
                          checked={selectedCategory === 'all'}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                        />
                        All Categories
                      </label>
                      {categories.map(category => (
                        <label key={category} className={selectedCategory === category ? 'active' : ''}>
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={selectedCategory === category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tags Filter */}
                  {tags.length > 0 && (
                    <div className="filter-group">
                      <h4>Tags</h4>
                      <div className="tags-list">
                        {tags.slice(0, 10).map(tag => (
                          <button
                            key={tag}
                            className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                            onClick={() => handleFilterChange('tag', selectedTag === tag ? '' : tag)}
                          >
                            <FontAwesomeIcon icon={faTag} />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear Filters */}
                  {(selectedCategory !== 'all' || selectedTag || searchTerm) && (
                    <button className="clear-filters-btn" onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Blog Posts Grid */}
            <main className="blog-main">
              <div className="posts-header">
                <h2>
                  {searchTerm ? `Search Results for "${searchTerm}"` : 
                   selectedCategory !== 'all' ? `${selectedCategory} Articles` : 
                   'All Articles'}
                </h2>
                <span className="posts-count">
                  {totalPosts} article{totalPosts !== 1 ? 's' : ''} found
                </span>
              </div>

              {loading ? (
                <div className="loading-state">
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <p>Loading articles...</p>
                </div>
              ) : blogPosts.length === 0 ? (
                <div className="empty-state">
                  <h3>No articles found</h3>
                  <p>Try adjusting your search or filters</p>
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="posts-grid">
                    {blogPosts.map(post => (
                      <article key={post.id} className="post-card">
                        {post.imageUrl && (
                          <div className="post-image">
                            <img src={post.imageUrl} alt={post.title} />
                          </div>
                        )}
                        <div className="post-content">
                          <div className="post-meta">
                            <span className="post-category">{post.category}</span>
                            <span className="post-date">
                              <FontAwesomeIcon icon={faCalendar} />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          <h3>
                            <Link to={`/blog/${post.id}`}>{post.title}</Link>
                          </h3>
                          <p className="post-excerpt">{post.excerpt}</p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="post-tags">
                              {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="post-footer">
                            <div className="post-stats">
                              <span>
                                <FontAwesomeIcon icon={faClock} />
                                {post.readTime} min
                              </span>
                              <span>
                                <FontAwesomeIcon icon={faEye} />
                                {post.views || 0}
                              </span>
                            </div>
                            <Link to={`/blog/${post.id}`} className="read-more-btn">
                              Read More
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      
                      <div className="pagination-numbers">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog; 