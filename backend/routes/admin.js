const express = require('express');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const EmotionRecord = require('../models/EmotionRecord');
const ImageAnalysis = require('../models/ImageAnalysis');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalContacts = await Contact.countDocuments();
    const unreadContacts = await Contact.countDocuments({ read: false });
    const totalNewsletters = await Newsletter.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    
    // Calculate total time spent by all users
    const users = await User.find().select('totalTimeOnSite');
    const totalTimeAllUsers = users.reduce((sum, user) => sum + (user.totalTimeOnSite || 0), 0);
    const avgTimePerUser = totalUsers > 0 ? Math.floor(totalTimeAllUsers / totalUsers) : 0;
    
    // Get recent logins (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = await User.countDocuments({
      lastLogin: { $gte: oneDayAgo }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalContacts,
        unreadContacts,
        totalNewsletters,
        onlineUsers,
        totalTimeAllUsers,
        totalTimeAllUsersFormatted: formatTime(totalTimeAllUsers),
        avgTimePerUser,
        avgTimePerUserFormatted: formatTime(avgTimePerUser),
        recentLogins
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with full details including passwords
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('+password +plaintextPassword').sort({ createdAt: -1 }).lean();
    
    // Format user data with time calculations
    const formattedUsers = users.map(user => {
      const totalHours = Math.floor(user.totalTimeOnSite / 3600);
      const totalMinutes = Math.floor((user.totalTimeOnSite % 3600) / 60);
      const totalSeconds = user.totalTimeOnSite % 60;
      
      let currentSessionTime = 0;
      if (user.isOnline && user.currentSessionStart) {
        currentSessionTime = Math.floor((new Date() - new Date(user.currentSessionStart)) / 1000);
      }
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.plaintextPassword || user.password, // Plaintext password if available, else hashed
        hashedPassword: user.password, // Always include hashed version
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        lastLogout: user.lastLogout,
        isOnline: user.isOnline,
        totalTimeOnSite: user.totalTimeOnSite,
        totalTimeFormatted: `${totalHours}h ${totalMinutes}m ${totalSeconds}s`,
        currentSessionTime: currentSessionTime,
        currentSessionTimeFormatted: formatTime(currentSessionTime),
        loginHistory: user.loginHistory || [],
        loginCount: user.loginHistory ? user.loginHistory.length : 0,
        currentSessionStart: user.currentSessionStart
      };
    });
    
    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to format time
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// @route   GET /api/admin/contacts
// @desc    Get all contact messages
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      contacts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/contacts/:id/read
// @desc    Mark contact as read
router.put('/contacts/:id/read', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json({
      success: true,
      contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/newsletters
// @desc    Get all newsletter subscribers
router.get('/newsletters', async (req, res) => {
  try {
    const newsletters = await Newsletter.find().sort({ subscribedAt: -1 });
    res.json({
      success: true,
      newsletters
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get detailed user information
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+password +plaintextPassword').lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const totalHours = Math.floor(user.totalTimeOnSite / 3600);
    const totalMinutes = Math.floor((user.totalTimeOnSite % 3600) / 60);
    const totalSeconds = user.totalTimeOnSite % 60;
    
    let currentSessionTime = 0;
    if (user.isOnline && user.currentSessionStart) {
      currentSessionTime = Math.floor((new Date() - new Date(user.currentSessionStart)) / 1000);
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.plaintextPassword || user.password, // Plaintext password if available, else hashed
        hashedPassword: user.password, // Always include hashed version
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        lastLogout: user.lastLogout,
        isOnline: user.isOnline,
        totalTimeOnSite: user.totalTimeOnSite,
        totalTimeFormatted: `${totalHours}h ${totalMinutes}m ${totalSeconds}s`,
        currentSessionTime: currentSessionTime,
        currentSessionTimeFormatted: formatTime(currentSessionTime),
        loginHistory: user.loginHistory || [],
        loginCount: user.loginHistory ? user.loginHistory.length : 0,
        currentSessionStart: user.currentSessionStart
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:id/emotions
// @desc    Get emotion statistics for a specific user (admin only)
router.get('/users/:id/emotions', async (req, res) => {
  try {
    const { period = 'hour' } = req.query;
    const userId = req.params.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate time range based on period
    const now = new Date();
    let startTime;
    
    switch (period) {
      case 'second':
        startTime = new Date(now.getTime() - 60 * 1000);
        break;
      case 'minute':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'hour':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get all records for this user
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
        timeKey = recordTime.toISOString().slice(0, 19);
      } else if (period === 'minute') {
        timeKey = recordTime.toISOString().slice(0, 16);
      } else {
        timeKey = recordTime.toISOString().slice(0, 13);
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
      userId,
      userName: user.name,
      period,
      timeRange: {
        start: startTime,
        end: now
      },
      stats,
      overall: overallStats
    });
  } catch (error) {
    console.error('Error fetching user emotion stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:id/image-analyses
// @desc    Get image analyses for a specific user (admin only)
router.get('/users/:id/image-analyses', async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const analyses = await ImageAnalysis.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .select('imageUrl emotion confidence allEmotions bbox fileName fileSize timestamp');

    const total = await ImageAnalysis.countDocuments({ user: userId });

    // Get statistics
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
        percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
      };
    });

    res.json({
      success: true,
      analyses,
      total,
      limit,
      skip,
      stats: {
        totalAnalyses: total,
        avgConfidence: avgConfidence[0]?.avgConfidence || 0,
        emotionStats
      }
    });
  } catch (error) {
    console.error('Error fetching user image analyses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

