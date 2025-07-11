/**
 * Blog API Endpoints
 * Handles blog post management operations including import, list, CRUD operations
 */

const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const router = express.Router();

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }
    
    // Verify token
    try {
      if (!req.admin) {
        return res.status(500).json({ error: 'Firebase Admin not available' });
      }
      
      const decodedToken = await req.admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Middleware to verify admin access for write operations
const verifyAdminAccess = async (req, res, next) => {
  try {
    // Check if user is admin by looking up their document in Firestore
    const userDoc = await req.db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return res.status(500).json({ error: 'Server error during admin verification' });
  }
};

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for blog posts with images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

/**
 * Validates a blog post object
 * @param {Object} blogPost - The blog post to validate
 * @returns {Object} Validation result with status and normalized post or errors
 */
function validateBlogPost(blogPost) {
  const errors = [];
  
  // Required fields
  if (!blogPost.title || typeof blogPost.title !== 'string' || blogPost.title.trim().length === 0) {
    errors.push('Missing or invalid title');
  }
  
  if (!blogPost.content || typeof blogPost.content !== 'string' || blogPost.content.trim().length === 0) {
    errors.push('Missing or invalid content');
  }
  
  // Optional but validated fields
  if (blogPost.category && typeof blogPost.category !== 'string') {
    errors.push('Invalid category - must be a string');
  }
  
  if (blogPost.tags && !Array.isArray(blogPost.tags)) {
    errors.push('Invalid tags - must be an array');
  }
  
  if (blogPost.featured && typeof blogPost.featured !== 'boolean') {
    errors.push('Invalid featured flag - must be boolean');
  }
  
  if (blogPost.status && !['draft', 'published', 'archived'].includes(blogPost.status)) {
    errors.push('Invalid status - must be draft, published, or archived');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Generate excerpt if not provided
  const excerpt = blogPost.excerpt || 
    (blogPost.content.length > 200 ? 
      blogPost.content.substring(0, 200).trim() + '...' : 
      blogPost.content.trim());
  
  // Estimate reading time (average 200 words per minute)
  const wordCount = blogPost.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  
  return {
    valid: true,
    blogPost: {
      title: blogPost.title.trim(),
      content: blogPost.content.trim(),
      excerpt: excerpt,
      author: blogPost.author || 'Admin',
      category: blogPost.category || 'General',
      tags: Array.isArray(blogPost.tags) ? blogPost.tags.map(tag => tag.trim()) : [],
      imageUrl: blogPost.imageUrl || '',
      featured: blogPost.featured || false,
      status: blogPost.status || 'published',
      readTime: blogPost.readTime || readTime,
      views: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };
}

/**
 * Import blog posts from uploaded JSON data
 * @param {Object} db - Firestore database instance
 * @param {Array|Object} blogData - Blog post data to import
 * @param {Object} options - Import options
 */
async function importBlogPostsFromData(db, blogData, options = {}) {
  const { dryRun = false, skipInvalid = true } = options;
  
  const posts = Array.isArray(blogData) ? blogData : [blogData];
  
  const results = {
    total: posts.length,
    valid: 0,
    invalid: 0,
    imported: 0,
    errors: [],
    dryRun,
    successful: [],
    failed: []
  };
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    
    try {
      const validation = validateBlogPost(post);
      
      if (!validation.valid) {
        results.invalid++;
        const errorInfo = {
          index: i,
          title: post.title || `Post ${i + 1}`,
          errors: validation.errors
        };
        results.errors.push(errorInfo);
        results.failed.push(errorInfo);
        
        if (!skipInvalid) {
          throw new Error(`Validation failed for post ${i + 1}: ${validation.errors.join(', ')}`);
        }
        continue;
      }
      
      results.valid++;
      
      if (!dryRun) {
        // Add the blog post to Firestore
        const docRef = await db.collection('blogPosts').add(validation.blogPost);
        results.imported++;
        results.successful.push({
          id: docRef.id,
          title: validation.blogPost.title,
          index: i
        });
      }
      
    } catch (error) {
      results.invalid++;
      const errorInfo = {
        index: i,
        title: post.title || `Post ${i + 1}`,
        errors: [error.message]
      };
      results.errors.push(errorInfo);
      results.failed.push(errorInfo);
      
      if (!skipInvalid) {
        throw error;
      }
    }
  }
  
  return results;
}

// ========== PUBLIC ENDPOINTS ==========

/**
 * GET /api/blog/posts
 * Get published blog posts (public endpoint)
 */
router.get('/posts', async (req, res) => {
  try {
    // Check if Firebase is available
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database service unavailable',
        posts: [],
        total: 0
      });
    }

    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const category = req.query.category;
    const tag = req.query.tag;
    const featured = req.query.featured === 'true';
    
    let query = req.db.collection('blogPosts')
      .where('status', '==', 'published');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (tag) {
      query = query.where('tags', 'array-contains', tag);
    }
    
    if (featured) {
      query = query.where('featured', '==', true);
    }
    
    query = query.orderBy('createdAt', 'desc').limit(limit);
    
    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
    
    res.json({ posts, total: posts.length });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

/**
 * GET /api/blog/posts/:id
 * Get a single blog post by ID (public endpoint)
 */
router.get('/posts/:id', async (req, res) => {
  try {
    // Check if Firebase is available
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database service unavailable'
      });
    }

    const { id } = req.params;
    const doc = await req.db.collection('blogPosts').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    const post = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    };
    
    // Only return published posts to public (unless admin)
    if (post.status !== 'published') {
      // Check if user is authenticated and admin
      try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const idToken = authHeader.split('Bearer ')[1];
          const decodedToken = await req.admin.auth().verifyIdToken(idToken);
          const userDoc = await req.db.collection('users').doc(decodedToken.uid).get();
          if (!userDoc.exists || !userDoc.data().isAdmin) {
            return res.status(404).json({ error: 'Blog post not found' });
          }
        } else {
          return res.status(404).json({ error: 'Blog post not found' });
        }
      } catch (authError) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
    }
    
    // Increment view count (fire and forget)
    req.db.collection('blogPosts').doc(id).update({
      views: admin.firestore.FieldValue.increment(1)
    }).catch(err => console.error('Error incrementing views:', err));
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

/**
 * GET /api/blog/search
 * Search blog posts (public endpoint)
 */
router.get('/search', async (req, res) => {
  try {
    // Check if Firebase is available
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database service unavailable',
        posts: [],
        total: 0
      });
    }

    const searchTerm = req.query.q;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    
    // Simple search implementation (Firestore doesn't support full-text search)
    const query = req.db.collection('blogPosts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(limit * 2); // Get more to filter
    
    const snapshot = await query.get();
    const allPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
    
    // Client-side filtering
    const searchLower = searchTerm.toLowerCase();
    const filteredPosts = allPosts.filter(post => 
      post.title?.toLowerCase().includes(searchLower) ||
      post.excerpt?.toLowerCase().includes(searchLower) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
    
    res.json({ 
      posts: filteredPosts.slice(0, limit), 
      total: filteredPosts.length,
      searchTerm 
    });
  } catch (error) {
    console.error('Error searching blog posts:', error);
    res.status(500).json({ error: 'Failed to search blog posts' });
  }
});

// ========== ADMIN ENDPOINTS ==========

/**
 * GET /api/blog/admin/posts
 * Get all blog posts (admin only)
 */
router.get('/admin/posts', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    // Check if Firebase is available
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database service unavailable',
        posts: [],
        total: 0
      });
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const status = req.query.status;
    
    let query = req.db.collection('blogPosts');
    
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      query = query.where('status', '==', status);
    }
    
    query = query.orderBy('createdAt', 'desc').limit(limit);
    
    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
    
    res.json({ posts, total: posts.length });
  } catch (error) {
    console.error('Error fetching admin blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

/**
 * POST /api/blog/admin/posts
 * Create a new blog post (admin only)
 */
router.post('/admin/posts', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    // Check if Firebase is available
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database service unavailable'
      });
    }

    const validation = validateBlogPost(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.errors 
      });
    }
    
    const docRef = await req.db.collection('blogPosts').add(validation.blogPost);
    
    res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Blog post created successfully'
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

/**
 * PUT /api/blog/admin/posts/:id
 * Update a blog post (admin only)
 */
router.put('/admin/posts/:id', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    // Check if Firebase is available
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database service unavailable'
      });
    }

    const { id } = req.params;
    const doc = await req.db.collection('blogPosts').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Validate the update data
    const validation = validateBlogPost(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.errors 
      });
    }
    
    // Remove the createdAt field for updates
    delete validation.blogPost.createdAt;
    validation.blogPost.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await req.db.collection('blogPosts').doc(id).update(validation.blogPost);
    
    res.json({
      success: true,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

/**
 * DELETE /api/blog/admin/posts/:id
 * Delete a blog post (admin only)
 */
router.delete('/admin/posts/:id', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    // Check if Firebase is available
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database service unavailable'
      });
    }

    const { id } = req.params;
    const doc = await req.db.collection('blogPosts').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    await req.db.collection('blogPosts').doc(id).delete();
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

/**
 * POST /api/blog/admin/import
 * Import blog posts from uploaded JSON file (admin only)
 */
router.post('/admin/import', verifyFirebaseToken, verifyAdminAccess, upload.single('blogFile'), async (req, res) => {
  try {
    // Check if Firebase is available
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database service unavailable'
      });
    }

    const { dryRun = false, skipInvalid = true } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let blogData;
    try {
      const fileContent = req.file.buffer.toString('utf8');
      blogData = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'Invalid JSON file',
        details: parseError.message 
      });
    }

    const importResults = await importBlogPostsFromData(
      req.db, 
      blogData,
      { 
        dryRun: dryRun === 'true' || dryRun === true,
        skipInvalid: skipInvalid === 'true' || skipInvalid === true
      }
    );

    res.json(importResults);

  } catch (error) {
    console.error('Blog import error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/blog/admin/sample
 * Download sample blog post JSON (admin only)
 */
router.get('/admin/sample', verifyFirebaseToken, verifyAdminAccess, (req, res) => {
  const sampleBlogPost = {
    title: "Sample Blog Post",
    content: "This is a sample blog post content. You can include HTML tags like <strong>bold text</strong> and <em>italic text</em>. This content should be meaningful and engaging for your readers.",
    excerpt: "A short preview of what this blog post is about...",
    author: "Admin",
    category: "Study Tips",
    tags: ["SAT", "study", "tips", "preparation"],
    imageUrl: "https://example.com/image.jpg",
    featured: false,
    status: "published"
  };

  const sampleData = [sampleBlogPost];

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="sample-blog-posts.json"');
  res.json(sampleData);
});

module.exports = router; 