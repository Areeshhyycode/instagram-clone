import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    ref: 'Post'
  },
  comment: {
    text: String
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

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Static method to create notification (avoids duplicates)
notificationSchema.statics.createNotification = async function(notificationData) {
  const { recipient, sender, type, post, comment } = notificationData;

  // Don't create notification if sender is the same as recipient
  if (recipient.toString() === sender.toString()) {
    return null;
  }

  // Check if similar notification already exists (for likes)
  if (type === 'like') {
    const existingNotification = await this.findOne({
      recipient,
      sender,
      type,
      post
    });

    if (existingNotification) {
      return existingNotification;
    }
  }

  // Create new notification
  const notification = new this({
    recipient,
    sender,
    type,
    post,
    comment
  });

  await notification.save();
  return notification;
};

// Static method to remove notification
notificationSchema.statics.removeNotification = async function(notificationData) {
  const { recipient, sender, type, post } = notificationData;

  return await this.deleteOne({
    recipient,
    sender,
    type,
    post
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
