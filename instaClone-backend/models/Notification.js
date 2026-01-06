import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow'],
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  comment: {
    text: { type: String, default: null }
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Prevent duplicate notifications for same action
notificationSchema.index(
  { recipient: 1, sender: 1, type: 1, post: 1 },
  { unique: true, sparse: true }
);

// Static method to create notification (prevents duplicates)
notificationSchema.statics.createNotification = async function(data) {
  // Don't notify yourself
  if (data.recipient.toString() === data.sender.toString()) {
    return null;
  }

  try {
    const notification = await this.findOneAndUpdate(
      {
        recipient: data.recipient,
        sender: data.sender,
        type: data.type,
        post: data.post || null
      },
      {
        $set: {
          comment: data.comment || {},
          read: false,
          createdAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    return notification;
  } catch (error) {
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      return null;
    }
    throw error;
  }
};

// Static method to remove notification (for unlike/unfollow)
notificationSchema.statics.removeNotification = async function(data) {
  return this.findOneAndDelete({
    recipient: data.recipient,
    sender: data.sender,
    type: data.type,
    post: data.post || null
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;