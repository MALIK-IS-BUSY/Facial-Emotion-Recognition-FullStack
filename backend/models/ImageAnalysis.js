const mongoose = require('mongoose');

const imageAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
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
  allEmotions: {
    type: Map,
    of: Number,
    default: {}
  },
  bbox: {
    type: [Number], // [x1, y1, x2, y2]
    default: null
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
imageAnalysisSchema.index({ user: 1, timestamp: -1 });
imageAnalysisSchema.index({ user: 1, emotion: 1 });

module.exports = mongoose.model('ImageAnalysis', imageAnalysisSchema);


