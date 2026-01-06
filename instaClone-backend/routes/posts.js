import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST / - Create a new post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const post = new Post({
      image: `/uploads/${req.file.filename}`,
      caption: req.body.caption || '',
      user: req.user._id
    });

    await post.save();
    
    // Populate user details
    await post.populate('user', 'username profilePicture');
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /feed - Get feed posts (following-based or all posts with pagination)
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sort || 'latest';
    const feedType = req.query.type || 'following'; // 'following' or 'all'

    // Get current user's following list
    const currentUser = await User.findById(req.user._id);

    // Build filter based on feed type
    let filter = {};
    if (feedType === 'following') {
      // Include posts from followed users + own posts
      const followingIds = [...currentUser.following, currentUser._id];
      filter = { user: { $in: followingIds } };
    }
    // If feedType is 'all', filter remains empty (all posts)

    // Sorting options
    let sortOption = {};
    switch (sortBy) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { likesCount: -1, createdAt: -1 };
        break;
      case 'latest':
      default:
        sortOption = { createdAt: -1 };
    }

    // For popular sorting, use aggregation to sort by likes count
    let posts;
    if (sortBy === 'popular') {
      const pipeline = [
        { $match: filter },
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: sortOption },  
        { $skip: skip },
        { $limit: limit }
      ];
      posts = await Post.aggregate(pipeline);
      await Post.populate(posts, [
        { path: 'user', select: 'username profilePic' },
        { path: 'comments.user', select: 'username profilePic' }
      ]);
    } else {
      posts = await Post.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('user', 'username profilePic')
        .populate('comments.user', 'username profilePic');
    }

    // Get saved posts for current user
    const savedPostIds = (currentUser.savedPosts || []).map(id => id.toString());

    // Add liked and saved status for current user
    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toObject ? post.toObject() : post;
      return {
        ...postObj,
        likesCount: postObj.likes?.length || 0,
        commentsCount: postObj.comments?.length || 0,
        isLiked: postObj.likes?.some(like => like.equals ? like.equals(req.user._id) : like.toString() === req.user._id.toString()) || false,
        isSaved: savedPostIds.includes(postObj._id.toString())
      };
    });

    const total = await Post.countDocuments(filter);

    res.json({
      posts: postsWithLikeStatus,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      sortBy,
      feedType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /like/:id - Like/Unlike a post
router.post('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user._id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      post.likes = post.likes.filter(like => !like.equals(userId));
      // Remove like notification
      await Notification.removeNotification({
        recipient: post.user,
        sender: userId,
        type: 'like',
        post: post._id
      });
    } else {
      // Like
      post.likes.push(userId);
      // Create like notification (only if not own post)
      await Notification.createNotification({
        recipient: post.user,
        sender: userId,
        type: 'like',
        post: post._id
      });
    }

    await post.save();

    res.json({
      postId: post._id,
      likes: post.likes.length,
      liked: !hasLiked
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /comment/:id - Add comment to a post
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Create comment notification (only if not own post)
    await Notification.createNotification({
      recipient: post.user,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      comment: { text: text.trim().substring(0, 100) } // Store first 100 chars of comment
    });

    // Populate the newly added comment's user details
    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'username profilePicture');

    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /search - Search posts by caption or hashtag
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = q.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search in captions (case-insensitive)
    const filter = {
      caption: { $regex: searchQuery, $options: 'i' }
    };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic');

    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        likesCount: postObj.likes?.length || 0,
        commentsCount: postObj.comments?.length || 0,
        isLiked: postObj.likes?.some(like => like.toString() === req.user._id.toString()) || false
      };
    });

    const total = await Post.countDocuments(filter);

    res.json({
      posts: postsWithLikeStatus,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalPosts: total,
      query: searchQuery
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /hashtag/:tag - Search posts by hashtag
router.get('/hashtag/:tag', auth, async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!tag || tag.trim() === '') {
      return res.status(400).json({ error: 'Hashtag is required' });
    }

    const hashtag = tag.trim().replace(/^#/, ''); // Remove # if present
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search for hashtag in captions
    const filter = {
      caption: { $regex: `#${hashtag}\\b`, $options: 'i' }
    };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic');

    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        likesCount: postObj.likes?.length || 0,
        commentsCount: postObj.comments?.length || 0,
        isLiked: postObj.likes?.some(like => like.toString() === req.user._id.toString()) || false
      };
    });

    const total = await Post.countDocuments(filter);

    res.json({
      posts: postsWithLikeStatus,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalPosts: total,
      hashtag: `#${hashtag}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /explore - Explore page with trending and random posts
router.get('/explore', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'trending' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let posts;
    let total;

    if (type === 'random') {
      // Random posts using aggregation $sample
      posts = await Post.aggregate([
        { $sample: { size: parseInt(limit) } }
      ]);
      await Post.populate(posts, [
        { path: 'user', select: 'username profilePic' },
        { path: 'comments.user', select: 'username profilePic' }
      ]);
      total = await Post.countDocuments();
    } else {
      // Trending: posts sorted by engagement (likes + comments) from recent period
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const pipeline = [
        { $match: { createdAt: { $gte: oneWeekAgo } } },
        {
          $addFields: {
            likesCount: { $size: '$likes' },
            commentsCount: { $size: '$comments' },
            engagementScore: {
              $add: [
                { $multiply: [{ $size: '$likes' }, 2] }, // Likes weighted x2
                { $size: '$comments' }
              ]
            }
          }
        },
        { $sort: { engagementScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ];

      posts = await Post.aggregate(pipeline);
      await Post.populate(posts, [
        { path: 'user', select: 'username profilePic' },
        { path: 'comments.user', select: 'username profilePic' }
      ]);

      total = await Post.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    }

    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toObject ? post.toObject() : post;
      return {
        ...postObj,
        likesCount: postObj.likes?.length || postObj.likesCount || 0,
        commentsCount: postObj.comments?.length || postObj.commentsCount || 0,
        isLiked: postObj.likes?.some(like =>
          like.equals ? like.equals(req.user._id) : like.toString() === req.user._id.toString()
        ) || false
      };
    });

    res.json({
      posts: postsWithLikeStatus,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalPosts: total,
      type
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /trending-hashtags - Get trending hashtags
router.get('/trending-hashtags', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get posts from last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const posts = await Post.find(
      { createdAt: { $gte: oneWeekAgo } },
      { caption: 1 }
    );

    // Extract hashtags from captions
    const hashtagCounts = {};
    const hashtagRegex = /#(\w+)/g;

    posts.forEach(post => {
      if (post.caption) {
        const matches = post.caption.match(hashtagRegex);
        if (matches) {
          matches.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            hashtagCounts[normalizedTag] = (hashtagCounts[normalizedTag] || 0) + 1;
          });
        }
      }
    });

    // Sort by count and get top hashtags
    const trendingHashtags = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([hashtag, count]) => ({ hashtag, postCount: count }));

    res.json({ hashtags: trendingHashtags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Additional routes for better functionality

// GET /:id - Get single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /:id - Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (!post.user.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /save/:id - Save/Unsave a post (Bookmark)
router.post('/save/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      // Unsave - remove from savedPosts
      user.savedPosts = user.savedPosts.filter(id => !id.equals(postId));
    } else {
      // Save - add to savedPosts
      user.savedPosts.push(postId);
    }

    await user.save();

    res.json({
      postId,
      saved: !isSaved,
      message: isSaved ? 'Post unsaved' : 'Post saved'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /saved/all - Get all saved posts
router.get('/saved/all', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const totalSaved = user.savedPosts.length;

    // Get saved posts with pagination (newest saved first)
    const savedPostIds = user.savedPosts.slice().reverse().slice(skip, skip + limit);

    const posts = await Post.find({ _id: { $in: savedPostIds } })
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic');

    // Maintain the order of savedPosts (newest saved first)
    const orderedPosts = savedPostIds.map(id =>
      posts.find(post => post._id.equals(id))
    ).filter(Boolean);

    // Add metadata
    const postsWithMeta = orderedPosts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        likesCount: postObj.likes?.length || 0,
        commentsCount: postObj.comments?.length || 0,
        isLiked: postObj.likes?.some(like => like.equals(req.user._id)) || false,
        isSaved: true
      };
    });

    res.json({
      posts: postsWithMeta,
      currentPage: page,
      totalPages: Math.ceil(totalSaved / limit),
      totalSaved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;