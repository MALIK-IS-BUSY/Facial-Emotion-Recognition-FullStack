/**
 * MongoDB Connection Checker
 * Run this to test your MongoDB connection
 * Usage: node check-mongodb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fer-website';

if (!process.env.MONGODB_URI) {
  console.log('⚠️  MONGODB_URI not found in .env file\n');
}

console.log('🔍 Testing MongoDB Connection...\n');
console.log(`Connection String: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}\n`);

const testConnection = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ SUCCESS: MongoDB Connected!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    console.log(`👤 User: ${mongoose.connection.user || 'none'}`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.length}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FAILED: MongoDB Connection Error');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 This means MongoDB is not running or not accessible.');
      console.log('   Solutions:');
      console.log('   1. Install and start MongoDB locally');
      console.log('   2. Use MongoDB Atlas (cloud) - recommended');
      console.log('   3. Check your connection string in .env file');
    } else if (error.message.includes('authentication')) {
      console.log('💡 Authentication failed.');
      console.log('   Check your username and password in the connection string');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Connection timeout.');
      console.log('   Check your internet connection and firewall settings');
    }
    
    console.log('\n📖 See MONGODB_SETUP.md for detailed setup instructions\n');
    process.exit(1);
  }
};

testConnection();

