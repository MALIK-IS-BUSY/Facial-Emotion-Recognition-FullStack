const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  loginHistory: [{
    loginTime: {
      type: Date,
      default: Date.now
    },
    logoutTime: Date,
    sessionDuration: Number, // in seconds
    ipAddress: String,
    userAgent: String
  }],
  totalTimeOnSite: {
    type: Number,
    default: 0 // total seconds spent on site
  },
  lastLogin: {
    type: Date
  },
  lastLogout: {
    type: Date
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentSessionStart: {
    type: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    // Store plaintext password before hashing (for admin view only)
    this.plaintextPassword = this.password;
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addLoginSession = function(ipAddress, userAgent) {
  const session = {
    loginTime: new Date(),
    ipAddress,
    userAgent
  };
  this.loginHistory.push(session);
  this.lastLogin = new Date();
  this.isOnline = true;
  this.currentSessionStart = new Date();
  return this.save();
};

userSchema.methods.endSession = function() {
  if (this.loginHistory.length > 0) {
    const lastSession = this.loginHistory[this.loginHistory.length - 1];
    if (!lastSession.logoutTime) {
      const logoutTime = new Date();
      const sessionDuration = Math.floor((logoutTime - lastSession.loginTime) / 1000);
      lastSession.logoutTime = logoutTime;
      lastSession.sessionDuration = sessionDuration;
      this.totalTimeOnSite += sessionDuration;
      this.lastLogout = logoutTime;
      this.isOnline = false;
      this.currentSessionStart = null;
      return this.save();
    }
  }
  return Promise.resolve(this);
};

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);

