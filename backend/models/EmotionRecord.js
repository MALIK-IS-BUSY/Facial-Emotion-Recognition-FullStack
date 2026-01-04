const mongoose = require('mongoose');

const emotionRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  emotion: {
    type: String,
    required: true,
    enum: ['Anger', 'Contempt', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
emotionRecordSchema.index({ user: 1, timestamp: -1 });
emotionRecordSchema.index({ user: 1, timestamp: 1, emotion: 1 });

module.exports = mongoose.model('EmotionRecord', emotionRecordSchema);

