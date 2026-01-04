const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/emotion', require('./routes/emotion'));
app.use('/api/emotions', require('./routes/emotions'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/newsletter', require('./routes/newsletter'));

// MongoDB Connection Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fer-website';

// MongoDB connection options (optimized for MongoDB Atlas)
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s for Atlas
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  retryWrites: true,
  w: 'majority'
  // Note: Removed family: 4 to allow both IPv4 and IPv6 (needed for Atlas)
};

// Connect to MongoDB with improved error handling
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  } catch (err) {
    console.error('\n❌ MongoDB Connection Failed');
    console.error(`   Error: ${err.message.split('\n')[0]}`);
    console.log('\n💡 Solutions:');
    
    if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
      console.log('   1. Install MongoDB locally:');
      console.log('      - Ubuntu/Debian: sudo apt-get install mongodb');
      console.log('      - macOS: brew install mongodb-community');
      console.log('      - Or download from: https://www.mongodb.com/try/download/community');
      console.log('   2. Start MongoDB service:');
      console.log('      - sudo systemctl start mongod');
      console.log('      - Or: mongod --dbpath /path/to/data');
      console.log('   3. Use MongoDB Atlas (Cloud - Free):');
      console.log('      - Sign up at: https://www.mongodb.com/cloud/atlas');
      console.log('      - Create cluster and get connection string');
      console.log('      - Update MONGODB_URI in .env file');
    } else {
      console.log('   1. Check your MongoDB Atlas connection string');
      console.log('   2. Verify IP whitelist includes your IP (0.0.0.0/0 for all)');
      console.log('   3. Check username and password are correct');
      console.log('   4. Ensure cluster is running');
    }
    
    console.log('\n⚠️  Server will continue running, but database features will not work');
    console.log('📝 Update .env file with correct MONGODB_URI and restart server\n');
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected - attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  // Only log critical errors, not connection retries
  if (err.message && !err.message.includes('ECONNREFUSED')) {
    console.error('❌ MongoDB error:', err.message);
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
