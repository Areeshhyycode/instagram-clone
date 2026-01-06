import express from 'express';
import Story from '../models/Story.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST / - Create a new story
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const story = new Story({
      image: `/uploads/${req.file.filename}`,
      caption: req.body.caption || '',
      user: req.user._id
    });

    await story.save();
    await story.populate('user', 'username profilePic');

    res.status(201).json(story);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /feed - Get stories feed (all active stories grouped by user)
router.get('/feed', auth, async (req, res) => {
  try {
    // Get all non-expired stories
    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('views.user', 'username profilePic');

    // Group stories by user
    const storiesByUser = {};
    stories.forEach(story => {
      const userId = story.user._id.toString();
      if (!storiesByUser[userId]) {
        storiesByUser[userId] = {
          user: story.user,
          stories: [],
          hasUnviewed: false
        };
      }
      storiesByUser[userId].stories.push(story);

      // Check if current user has not viewed this story
      if (!story.hasViewed(req.user._id)) {
        storiesByUser[userId].hasUnviewed = true;
      }
    });

    // Convert to array and sort (unviewed first, then by most recent story)
    const groupedStories = Object.values(storiesByUser).sort((a, b) => {
      // Unviewed stories first
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      // Then by most recent story
      return new Date(b.stories[0].createdAt) - new Date(a.stories[0].createdAt);
    });

    res.json(groupedStories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /my - Get current user's stories
router.get('/my', auth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.user._id,
      expiresAt: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .populate('views.user', 'username profilePic');

    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /user/:userId - Get stories by a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      expiresAt: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic');

    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /view/:id - Mark story as viewed
router.post('/view/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if story is expired
    if (new Date() > story.expiresAt) {
      return res.status(410).json({ error: 'Story has expired' });
    }

    // Don't add view if it's the user's own story
    if (story.user.equals(req.user._id)) {
      return res.json({ message: 'Own story', viewCount: story.views.length });
    }

    // Check if user has already viewed
    if (!story.hasViewed(req.user._id)) {
      story.views.push({ user: req.user._id });
      await story.save();
    }

    res.json({
      storyId: story._id,
      viewCount: story.views.length,
      viewed: true
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /views/:id - Get viewers of a story (only for story owner)
router.get('/views/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('views.user', 'username profilePic');

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Only owner can see viewers
    if (!story.user.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to view this information' });
    }

    res.json({
      storyId: story._id,
      viewCount: story.views.length,
      viewers: story.views.map(view => ({
        user: view.user,
        viewedAt: view.viewedAt
      }))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /:id - Get single story
router.get('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('user', 'username profilePic');

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if expired
    if (new Date() > story.expiresAt) {
      return res.status(410).json({ error: 'Story has expired' });
    }

    res.json(story);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /:id - Delete a story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if user owns the story
    if (!story.user.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to delete this story' });
    }

    await story.deleteOne();

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;