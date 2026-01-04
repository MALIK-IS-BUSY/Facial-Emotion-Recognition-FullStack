/**
 * Script to create an admin user
 * Run with: node scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.argv[2] || 'admin@fer.com';
    const adminPassword = process.argv[3] || 'admin123';
    const adminName = process.argv[4] || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      if (existingAdmin.role === 'admin') {
        console.log('User is already an admin.');
        process.exit(0);
      } else {
        // Update to admin
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('User updated to admin role!');
        process.exit(0);
      }
    }

    // Create new admin
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', adminPassword);
    console.log('Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

