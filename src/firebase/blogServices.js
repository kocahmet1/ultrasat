import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

// ========== BLOG POSTS SERVICE ==========

/**
 * Create a new blog post
 * @param {Object} blogData - The blog post data
 * @returns {Promise<string>} - The ID of the created blog post
 */
export const createBlogPost = async (blogData) => {
  try {
    const blogRef = await addDoc(collection(db, 'blogPosts'), {
      ...blogData,
      status: blogData.status || 'published', // 'draft', 'published', 'archived'
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return blogRef.id;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

/**
 * Get all published blog posts
 * @param {number} limitCount - Maximum number of posts to return
 * @returns {Promise<Array>} - Array of blog posts
 */
export const getPublishedBlogPosts = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting published blog posts:', error);
    throw error;
  }
};

/**
 * Get all blog posts (admin only)
 * @param {number} limitCount - Maximum number of posts to return
 * @returns {Promise<Array>} - Array of blog posts
 */
export const getAllBlogPosts = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all blog posts:', error);
    throw error;
  }
};

/**
 * Get a single blog post by ID
 * @param {string} blogId - The blog post ID
 * @returns {Promise<Object|null>} - The blog post or null if not found
 */
export const getBlogPostById = async (blogId) => {
  try {
    const blogDoc = await getDoc(doc(db, 'blogPosts', blogId));
    if (blogDoc.exists()) {
      return {
        id: blogDoc.id,
        ...blogDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting blog post by ID:', error);
    throw error;
  }
};

/**
 * Get blog posts by category
 * @param {string} category - The category to filter by
 * @param {number} limitCount - Maximum number of posts to return
 * @returns {Promise<Array>} - Array of blog posts
 */
export const getBlogPostsByCategory = async (category, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('category', '==', category),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting blog posts by category:', error);
    throw error;
  }
};

/**
 * Get blog posts by tag
 * @param {string} tag - The tag to filter by
 * @param {number} limitCount - Maximum number of posts to return
 * @returns {Promise<Array>} - Array of blog posts
 */
export const getBlogPostsByTag = async (tag, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('tags', 'array-contains', tag),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting blog posts by tag:', error);
    throw error;
  }
};

/**
 * Update a blog post
 * @param {string} blogId - The blog post ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateBlogPost = async (blogId, updateData) => {
  try {
    await updateDoc(doc(db, 'blogPosts', blogId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

/**
 * Delete a blog post
 * @param {string} blogId - The blog post ID
 * @returns {Promise<void>}
 */
export const deleteBlogPost = async (blogId) => {
  try {
    await deleteDoc(doc(db, 'blogPosts', blogId));
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

/**
 * Increment blog post view count
 * @param {string} blogId - The blog post ID
 * @returns {Promise<void>}
 */
export const incrementBlogPostViews = async (blogId) => {
  try {
    const blogRef = doc(db, 'blogPosts', blogId);
    const blogDoc = await getDoc(blogRef);
    if (blogDoc.exists()) {
      const currentViews = blogDoc.data().views || 0;
      await updateDoc(blogRef, {
        views: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing blog post views:', error);
    // Don't throw error for view counting to avoid disrupting user experience
  }
};

/**
 * Get featured blog posts
 * @param {number} limitCount - Maximum number of posts to return
 * @returns {Promise<Array>} - Array of featured blog posts
 */
export const getFeaturedBlogPosts = async (limitCount = 5) => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('featured', '==', true),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting featured blog posts:', error);
    throw error;
  }
};

/**
 * Search blog posts by title or content
 * @param {string} searchTerm - The search term
 * @param {number} limitCount - Maximum number of posts to return
 * @returns {Promise<Array>} - Array of matching blog posts
 */
export const searchBlogPosts = async (searchTerm, limitCount = 20) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that searches in title and excerpt
    // For better search, consider using Algolia or similar
    const q = query(
      collection(db, 'blogPosts'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limitCount * 2) // Get more to filter
    );
    
    const querySnapshot = await getDocs(q);
    const allPosts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Client-side filtering for search term
    const searchLower = searchTerm.toLowerCase();
    const filteredPosts = allPosts.filter(post => 
      post.title?.toLowerCase().includes(searchLower) ||
      post.excerpt?.toLowerCase().includes(searchLower) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
    
    return filteredPosts.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching blog posts:', error);
    throw error;
  }
};

/**
 * Get recent blog posts for homepage/sidebar
 * @param {number} limitCount - Maximum number of posts to return
 * @returns {Promise<Array>} - Array of recent blog posts with minimal data
 */
export const getRecentBlogPosts = async (limitCount = 5) => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl,
        category: data.category,
        createdAt: data.createdAt,
        readTime: data.readTime
      };
    });
  } catch (error) {
    console.error('Error getting recent blog posts:', error);
    throw error;
  }
};

/**
 * Import blog posts from JSON data (for admin import functionality)
 * @param {Array|Object} blogData - Blog post data to import
 * @returns {Promise<Object>} - Import results
 */
export const importBlogPosts = async (blogData) => {
  try {
    const posts = Array.isArray(blogData) ? blogData : [blogData];
    const results = {
      successful: [],
      failed: [],
      total: posts.length
    };

    for (const post of posts) {
      try {
        // Validate required fields
        if (!post.title || !post.content) {
          results.failed.push({
            title: post.title || 'Unknown',
            error: 'Missing required fields (title, content)'
          });
          continue;
        }

        // Set default values
        const blogPost = {
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || post.content.substring(0, 200) + '...',
          author: post.author || 'Admin',
          category: post.category || 'General',
          tags: post.tags || [],
          imageUrl: post.imageUrl || '',
          featured: post.featured || false,
          status: post.status || 'published',
          readTime: post.readTime || Math.ceil(post.content.split(' ').length / 200) // Estimate reading time
        };

        const blogId = await createBlogPost(blogPost);
        results.successful.push({
          id: blogId,
          title: blogPost.title
        });

      } catch (error) {
        results.failed.push({
          title: post.title || 'Unknown',
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error importing blog posts:', error);
    throw error;
  }
}; 