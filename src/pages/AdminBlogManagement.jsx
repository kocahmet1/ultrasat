import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faEye,
  faUpload,
  faDownload,
  faFileImport,
  faSpinner,
  faSearch,
  faFilter,
  faCalendar,
  faClock,
  faTag,
  faUser,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/AdminBlogManagement.css';

export default function AdminBlogManagement() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importResults, setImportResults] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: 'Admin',
    category: 'General',
    tags: [],
    imageUrl: '',
    featured: false,
    status: 'published'
  });

  // Import options
  const [importOptions, setImportOptions] = useState({
    dryRun: false,
    skipInvalid: true
  });

  useEffect(() => {
    loadBlogPosts();
  }, [statusFilter]);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/blog/admin/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setBlogPosts(data.posts || []);
      } else {
        toast.error('Failed to load blog posts: ' + data.error);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please select a JSON file');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('blogFile', file);
      formData.append('dryRun', importOptions.dryRun.toString());
      formData.append('skipInvalid', importOptions.skipInvalid.toString());

      const response = await fetch('/api/blog/admin/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setImportResults(result);
        
        if (!result.dryRun && result.imported > 0) {
          toast.success(`Successfully imported ${result.imported} blog posts!`);
          await loadBlogPosts();
        } else if (result.dryRun) {
          toast.info(`Dry run completed: ${result.valid} valid, ${result.invalid} invalid posts found`);
        }
      } else {
        toast.error(`Import failed: ${result.error}`);
        setImportResults(result);
      }
    } catch (error) {
      toast.error('Error importing blog posts: ' + error.message);
      console.error('Import error:', error);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const downloadSampleJson = async () => {
    try {
      const response = await fetch('/api/blog/admin/sample', {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample-blog-posts.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Sample JSON downloaded successfully!');
      } else {
        const errorData = await response.json();
        toast.error('Failed to download sample JSON: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error downloading sample JSON:', error);
      toast.error('Error downloading sample JSON: ' + error.message);
    }
  };

  const handleCreatePost = async () => {
    try {
      const response = await fetch('/api/blog/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Blog post created successfully!');
        setShowCreateForm(false);
        resetForm();
        await loadBlogPosts();
      } else {
        toast.error('Failed to create blog post: ' + result.error);
      }
    } catch (error) {
      toast.error('Error creating blog post: ' + error.message);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const response = await fetch(`/api/blog/admin/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Blog post updated successfully!');
        setEditingPost(null);
        resetForm();
        await loadBlogPosts();
      } else {
        toast.error('Failed to update blog post: ' + result.error);
      }
    } catch (error) {
      toast.error('Error updating blog post: ' + error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Blog post deleted successfully!');
        await loadBlogPosts();
      } else {
        toast.error('Failed to delete blog post: ' + result.error);
      }
    } catch (error) {
      toast.error('Error deleting blog post: ' + error.message);
    }
  };

  const startEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      category: post.category,
      tags: post.tags || [],
      imageUrl: post.imageUrl || '',
      featured: post.featured || false,
      status: post.status
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: 'Admin',
      category: 'General',
      tags: [],
      imageUrl: '',
      featured: false,
      status: 'published'
    });
  };

  const handleTagInput = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-blog-management">
      <div className="page-header">
        <h1>
          <FontAwesomeIcon icon={faEdit} className="page-icon" />
          Blog Management
        </h1>
        <p className="page-description">
          Manage blog posts, import content, and monitor publication status
        </p>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-group">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingPost(null);
              resetForm();
              setShowCreateForm(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} /> Create Post
          </button>
          <button className="btn btn-success" onClick={downloadSampleJson}>
            <FontAwesomeIcon icon={faDownload} /> Sample JSON
          </button>
        </div>

        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Import Section */}
      <div className="import-section">
        <h2>Import Blog Posts</h2>
        <div className="import-tools">
          <div className="import-options">
            <label>
              <input
                type="checkbox"
                checked={importOptions.dryRun}
                onChange={(e) => setImportOptions({ ...importOptions, dryRun: e.target.checked })}
              />
              Dry Run (preview only)
            </label>
            <label>
              <input
                type="checkbox"
                checked={importOptions.skipInvalid}
                onChange={(e) => setImportOptions({ ...importOptions, skipInvalid: e.target.checked })}
              />
              Skip Invalid Posts
            </label>
          </div>
          
          <label className="btn btn-secondary file-input-btn">
            <FontAwesomeIcon icon={faFileImport} />
            {importing ? 'Importing...' : 'Import JSON File'}
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              disabled={importing}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Import Results */}
        {importResults && (
          <div className="import-results">
            <h4>Import Results</h4>
            <div className="results-summary">
              <div className="result-item">
                <span className="label">Total:</span>
                <span className="value">{importResults.total}</span>
              </div>
              <div className="result-item">
                <span className="label">Valid:</span>
                <span className="value success">{importResults.valid}</span>
              </div>
              <div className="result-item">
                <span className="label">Invalid:</span>
                <span className="value error">{importResults.invalid}</span>
              </div>
              <div className="result-item">
                <span className="label">Imported:</span>
                <span className="value success">{importResults.imported}</span>
              </div>
            </div>

            {importResults.successful && importResults.successful.length > 0 && (
              <div className="success-list">
                <h5>Successfully Imported:</h5>
                <ul>
                  {importResults.successful.map((item, index) => (
                    <li key={index}>{item.title}</li>
                  ))}
                </ul>
              </div>
            )}

            {importResults.failed && importResults.failed.length > 0 && (
              <div className="error-list">
                <h5>Failed Imports:</h5>
                <ul>
                  {importResults.failed.map((item, index) => (
                    <li key={index}>
                      <strong>{item.title}:</strong> {item.errors.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button 
              className="btn btn-secondary"
              onClick={() => setImportResults(null)}
            >
              Clear Results
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPost(null);
                  resetForm();
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="form-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter blog post title"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter blog post content (HTML supported)"
                    rows="10"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Short summary (auto-generated if empty)"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Author name"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Category"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagInput(e.target.value)}
                    placeholder="Comma-separated tags"
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Featured image URL"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    Featured Post
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPost(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={editingPost ? handleUpdatePost : handleCreatePost}
                  disabled={!formData.title || !formData.content}
                >
                  <FontAwesomeIcon icon={faSave} />
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts List */}
      <div className="posts-section">
        <div className="section-header">
          <h2>Blog Posts ({filteredPosts.length})</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} spin />
            <p>Loading blog posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <h3>No blog posts found</h3>
            <p>Create your first blog post or import from JSON</p>
          </div>
        ) : (
          <div className="posts-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <div className="post-title">
                        <strong>{post.title}</strong>
                        {post.featured && <span className="featured-badge">Featured</span>}
                      </div>
                    </td>
                    <td>{post.category}</td>
                    <td>
                      <span className={`status-badge status-${post.status}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>{post.views || 0}</td>
                    <td>{formatDate(post.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-view"
                          onClick={() => window.open(`/blog/${post.id}`, '_blank')}
                          title="View Post"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="btn-icon btn-edit"
                          onClick={() => startEdit(post)}
                          title="Edit Post"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete Post"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
} 