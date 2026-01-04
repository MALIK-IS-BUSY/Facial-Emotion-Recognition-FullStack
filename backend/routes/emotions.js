const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const EmotionRecord = require('../models/EmotionRecord');
const ImageAnalysis = require('../models/ImageAnalysis');
const router = express.Router();

// @route   POST /api/emotions/record
// @desc    Save an emotion detection record
router.post('/record', protect, async (req, res) => {
  try {
    const { emotion, confidence, sessionId } = req.body;

    if (!emotion || confidence === undefined) {
      return res.status(400).json({ message: 'Emotion and confidence are required' });
    }

    const record = await EmotionRecord.create({
      user: req.user.id,
      emotion,
      confidence: parseFloat(confidence),
      sessionId: sessionId || `session_${Date.now()}`
    });

    res.json({
      success: true,
      record: {
        id: record._id,
        emotion: record.emotion,
        confidence: record.confidence,
        timestamp: record.timestamp
      }
    });
  } catch (error) {
    console.error('Error saving emotion record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/emotions/stats
// @desc    Get emotion statistics for the user
router.get('/stats', protect, async (req, res) => {
  try {
    const { period = 'hour' } = req.query; // hour, minute, second
    const userId = req.user.id;

    // Calculate time range based on period
    const now = new Date();
    let startTime;
    
    switch (period) {
      case 'second':
        startTime = new Date(now.getTime() - 60 * 1000); // Last 60 seconds
        break;
      case 'minute':
        startTime = new Date(now.getTime() - 60 * 60 * 1000); // Last 60 minutes
        break;
      case 'hour':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get all records in the time range
    const records = await EmotionRecord.find({
      user: userId,
      timestamp: { $gte: startTime, $lte: now }
    }).sort({ timestamp: 1 });

    // Group by time period
    const grouped = {};
    const emotions = ['Anger', 'Contempt', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise'];
    
    records.forEach(record => {
      let timeKey;
      const recordTime = new Date(record.timestamp);
      
      if (period === 'second') {
        timeKey = recordTime.toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss
      } else if (period === 'minute') {
        timeKey = recordTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      } else {
        timeKey = recordTime.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      }

      if (!grouped[timeKey]) {
        grouped[timeKey] = {
          time: timeKey,
          emotions: {},
          total: 0
        };
        emotions.forEach(em => {
          grouped[timeKey].emotions[em] = 0;
        });
      }

      grouped[timeKey].emotions[record.emotion]++;
      grouped[timeKey].total++;
    });

    // Convert to array and find dominant emotion for each period
    const stats = Object.values(grouped).map(period => {
      let dominantEmotion = 'Neutral';
      let maxCount = 0;

      emotions.forEach(emotion => {
        if (period.emotions[emotion] > maxCount) {
          maxCount = period.emotions[emotion];
          dominantEmotion = emotion;
        }
      });

      return {
        ...period,
        dominantEmotion,
        dominantCount: maxCount,
        dominantPercentage: period.total > 0 ? (maxCount / period.total * 100).toFixed(1) : 0
      };
    });

    // Overall statistics
    const overallStats = {
      totalRecords: records.length,
      emotionCounts: {},
      emotionPercentages: {},
      mostCommonEmotion: 'Neutral',
      mostCommonCount: 0
    };

    emotions.forEach(emotion => {
      const count = records.filter(r => r.emotion === emotion).length;
      overallStats.emotionCounts[emotion] = count;
      overallStats.emotionPercentages[emotion] = records.length > 0 
        ? (count / records.length * 100).toFixed(1) 
        : 0;
      
      if (count > overallStats.mostCommonCount) {
        overallStats.mostCommonCount = count;
        overallStats.mostCommonEmotion = emotion;
      }
    });

    res.json({
      success: true,
      period,
      timeRange: {
        start: startTime,
        end: now
      },
      stats,
      overall: overallStats
    });
  } catch (error) {
    console.error('Error fetching emotion stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/emotions/recent
// @desc    Get recent emotion records
router.get('/recent', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const userId = req.user.id;

    const records = await EmotionRecord.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('emotion confidence timestamp sessionId');

    res.json({
      success: true,
      records: records.map(r => ({
        emotion: r.emotion,
        confidence: r.confidence,
        timestamp: r.timestamp,
        sessionId: r.sessionId
      }))
    });
  } catch (error) {
    console.error('Error fetching recent records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/emotions/image-analysis
// @desc    Save an image analysis result
router.post('/image-analysis', protect, async (req, res) => {
  try {
    const { imageUrl, emotion, confidence, allEmotions, bbox, fileName, fileSize } = req.body;

    if (!imageUrl || !emotion || confidence === undefined) {
      return res.status(400).json({ message: 'Image URL, emotion, and confidence are required' });
    }

    const analysis = await ImageAnalysis.create({
      user: req.user.id,
      imageUrl,
      emotion,
      confidence: parseFloat(confidence),
      allEmotions: allEmotions || {},
      bbox: bbox || null,
      fileName: fileName || '',
      fileSize: fileSize || 0
    });

    res.json({
      success: true,
      analysis: {
        id: analysis._id,
        imageUrl: analysis.imageUrl,
        emotion: analysis.emotion,
        confidence: analysis.confidence,
        allEmotions: analysis.allEmotions,
        bbox: analysis.bbox,
        timestamp: analysis.timestamp
      }
    });
  } catch (error) {
    console.error('Error saving image analysis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/emotions/image-analyses
// @desc    Get all image analyses for the user
router.get('/image-analyses', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const analyses = await ImageAnalysis.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .select('imageUrl emotion confidence allEmotions bbox fileName fileSize timestamp');

    const total = await ImageAnalysis.countDocuments({ user: userId });

    res.json({
      success: true,
      analyses,
      total,
      limit,
      skip
    });
  } catch (error) {
    console.error('Error fetching image analyses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/emotions/image-analyses/stats
// @desc    Get image analysis statistics
router.get('/image-analyses/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalAnalyses = await ImageAnalysis.countDocuments({ user: userId });

    const emotionCounts = await ImageAnalysis.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const avgConfidence = await ImageAnalysis.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
    ]);

    const emotionStats = {};
    emotionCounts.forEach(item => {
      emotionStats[item._id] = {
        count: item.count,
        percentage: totalAnalyses > 0 ? ((item.count / totalAnalyses) * 100).toFixed(1) : 0
      };
    });

    res.json({
      success: true,
      totalAnalyses,
      avgConfidence: avgConfidence[0]?.avgConfidence || 0,
      emotionStats
    });
  } catch (error) {
    console.error('Error fetching image analysis stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/emotions/image-analyses/:id
// @desc    Delete an image analysis
router.delete('/image-analyses/:id', protect, async (req, res) => {
  try {
    const analysis = await ImageAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: 'Image analysis not found' });
    }

    if (analysis.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await ImageAnalysis.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Image analysis deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image analysis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

