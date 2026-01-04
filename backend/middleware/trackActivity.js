const User = require('../models/User');

// Track user activity and session time
exports.trackActivity = async (req, res, next) => {
  if (req.user) {
    try {
      const user = await User.findById(req.user._id);
      
      // Update last activity
      user.lastActivity = new Date();
      
      // Ensure user is marked as online if they have an active session
      if (!user.isOnline && user.currentSessionStart) {
        user.isOnline = true;
      }
      
      // If user is online, update current session duration and total time
      if (user.isOnline && user.currentSessionStart) {
        const currentSessionDuration = Math.floor(
          (new Date() - user.currentSessionStart) / 1000
        );
        // Update total time incrementally (every 30 seconds of activity)
        const timeSinceLastUpdate = user.lastActivity && user.updatedAt 
          ? Math.floor((new Date() - new Date(user.updatedAt)) / 1000)
          : 0;
        
        if (timeSinceLastUpdate >= 30) {
          // Add 30 seconds to total time
          user.totalTimeOnSite = (user.totalTimeOnSite || 0) + 30;
        }
      }
      
      await user.save();
    } catch (error) {
      // Don't block the request if tracking fails
      console.error('Activity tracking error:', error);
    }
  }
  next();
};

// Track login
exports.trackLogin = async (userId, ipAddress, userAgent) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      await user.addLoginSession(ipAddress, userAgent);
    }
  } catch (error) {
    console.error('Login tracking error:', error);
  }
};

// Track logout
exports.trackLogout = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      await user.endSession();
    }
  } catch (error) {
    console.error('Logout tracking error:', error);
  }
};

