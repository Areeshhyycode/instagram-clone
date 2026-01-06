import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET /profile/username/:username - Get user profile by username with posts count
router.get('/profile/username/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get posts count
    const postsCount = await Post.countDocuments({ user: user._id });

    // Check if current user is following this user
    const isFollowing = user.followers.some(
      follower => follower.equals(req.user._id)
    );

    res.json({
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
      postsCount,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
      isOwnProfile: user._id.equals(req.user._id),
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /posts/:username - Get user's posts by username with pagination
router.get('/posts/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic');

    // Add liked status for current user
    const postsWithLikeStatus = posts.map(post => ({
      ...post.toObject(),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: post.likes.some(like => like.equals(req.user._id))
    }));

    const total = await Post.countDocuments({ user: user._id });

    res.json({
      posts: postsWithLikeStatus,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /profile/edit - Edit current user's profile (bio, profile picture)
router.put('/profile/edit', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const { bio, username } = req.body;
    const updates = {};

    // Update bio if provided
    if (bio !== undefined) {
      updates.bio = bio.trim();
    }

    // Update username if provided
    if (username !== undefined) {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
        return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
      }
      // Check if username is already taken
      const existingUser = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: req.user._id }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      updates.username = trimmedUsername;
    }

    // Update profile picture if uploaded
    if (req.file) {
      updates.profilePic = `/uploads/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    // Get posts count
    const postsCount = await Post.countDocuments({ user: user._id });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      postsCount,
      followersCount: user.followers.length,
      followingCount: user.following.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /follow/:id - Follow a user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Can't follow yourself
    if (userToFollow._id.equals(currentUser._id)) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ error: 'You are already following this user' });
    }

    // Add to current user's following list
    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    // Add to target user's followers list
    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();

    // Create follow notification
    await Notification.createNotification({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: 'follow'
    });

    res.json({
      message: `You are now following ${userToFollow.username}`,
      following: true,
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /unfollow/:id - Unfollow a user
router.post('/unfollow/:id', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Can't unfollow yourself
    if (userToUnfollow._id.equals(currentUser._id)) {
      return res.status(400).json({ error: 'You cannot unfollow yourself' });
    }

    // Check if not following
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ error: 'You are not following this user' });
    }

    // Remove from current user's following list
    currentUser.following = currentUser.following.filter(
      id => !id.equals(userToUnfollow._id)
    );
    await currentUser.save();

    // Remove from target user's followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => !id.equals(currentUser._id)
    );
    await userToUnfollow.save();

    // Remove follow notification
    await Notification.removeNotification({
      recipient: userToUnfollow._id,
      sender: currentUser._id,
      type: 'follow'
    });

    res.json({
      message: `You have unfollowed ${userToUnfollow.username}`,
      following: false,
      followersCount: userToUnfollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /profile/:id - Get user profile with follow stats
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user is following this user
    const isFollowing = user.followers.some(
      follower => follower._id.equals(req.user._id)
    );

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
      isOwnProfile: user._id.equals(req.user._id),
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /followers/:id - Get user's followers list
router.get('/followers/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePic bio');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add isFollowing flag for each follower
    const followersWithStatus = user.followers.map(follower => ({
      _id: follower._id,
      username: follower.username,
      profilePic: follower.profilePic,
      bio: follower.bio,
      isFollowing: req.user.following?.includes(follower._id) || false
    }));

    res.json({
      userId: user._id,
      username: user.username,
      followersCount: user.followers.length,
      followers: followersWithStatus
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /following/:id - Get user's following list
router.get('/following/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username profilePic bio');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add isFollowing flag for each user
    const followingWithStatus = user.following.map(followedUser => ({
      _id: followedUser._id,
      username: followedUser.username,
      profilePic: followedUser.profilePic,
      bio: followedUser.bio,
      isFollowing: req.user.following?.includes(followedUser._id) || false
    }));

    res.json({
      userId: user._id,
      username: user.username,
      followingCount: user.following.length,
      following: followingWithStatus
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /search - Search users by username or bio
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = q.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search in both username and bio
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { bio: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ]
    })
      .select('username profilePic bio followers')
      .skip(skip)
      .limit(parseInt(limit));

    const usersWithStatus = users.map(user => ({
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
      followersCount: user.followers.length,
      isFollowing: req.user.following?.includes(user._id) || false
    }));

    const total = await User.countDocuments({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { bio: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ]
    });

    res.json({
      users: usersWithStatus,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalUsers: total,
      query: searchQuery
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /suggested - Get suggested users to follow
router.get('/suggested', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const currentUser = await User.findById(req.user._id);

    // Get users that:
    // 1. Current user is not following
    // 2. Is not the current user
    // 3. Sorted by follower count (popular users)
    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: {
            $nin: [...currentUser.following, currentUser._id]
          }
        }
      },
      {
        $addFields: {
          followersCount: { $size: '$followers' },
          // Check if any of current user's following also follow this user
          mutualFollowers: {
            $size: {
              $setIntersection: ['$followers', currentUser.following]
            }
          }
        }
      },
      // Prioritize users with mutual connections, then by popularity
      { $sort: { mutualFollowers: -1, followersCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          username: 1,
          profilePic: 1,
          bio: 1,
          followersCount: 1,
          mutualFollowers: 1
        }
      }
    ]);

    const usersWithStatus = suggestedUsers.map(user => ({
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
      followersCount: user.followersCount,
      mutualFollowers: user.mutualFollowers,
      isFollowing: false
    }));

    res.json({ users: usersWithStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;