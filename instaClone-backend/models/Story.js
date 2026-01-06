import mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

const storySchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: '',
    trim: true,
    maxlength: 200
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: [viewSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
});

// TTL index - MongoDB automatically deletes documents when expiresAt is reached
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for fetching user stories efficiently
storySchema.index({ user: 1, createdAt: -1 });

// Index for feed queries
storySchema.index({ createdAt: -1 });

// Virtual to check if story is expired
storySchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual to get view count
storySchema.virtual('viewCount').get(function() {
  return this.views.length;
});

// Method to check if a user has viewed this story
storySchema.methods.hasViewed = function(userId) {
  return this.views.some(view => view.user.equals(userId));
};

// Ensure virtuals are included in JSON output
storySchema.set('toJSON', { virtuals: true });
storySchema.set('toObject', { virtuals: true });

export default mongoose.model('Story', storySchema);