const express = require('express');
const { protect } = require('../middleware/auth');
const { trackActivity } = require('../middleware/trackActivity');
const User = require('../models/User');
const router = express.Router();

// Apply activity tracking to all user routes
router.use(protect);
router.use(trackActivity);

// @route   GET /api/users/profile
// @desc    Get user profile with full details
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('+password') // Include password for admin view
      .lean();
    
    // Format time on site
    const totalHours = Math.floor(user.totalTimeOnSite / 3600);
    const totalMinutes = Math.floor((user.totalTimeOnSite % 3600) / 60);
    const totalSeconds = user.totalTimeOnSite % 60;
    
    // Calculate current session time if online
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
        password: user.password, // Hashed password
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
        loginCount: user.loginHistory ? user.loginHistory.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    
    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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

module.exports = router;

