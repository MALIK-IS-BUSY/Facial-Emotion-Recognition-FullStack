# MongoDB Setup Guide

## Current Status
❌ MongoDB is not running or not configured properly.

## Option 1: MongoDB Atlas (Cloud - Recommended & Free)

### Step 1: Create Free Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `fer-website` (or keep default)

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fer-website?retryWrites=true&w=majority
```

### Step 3: Configure Network Access
1. Go to "Network Access" in Atlas
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Or add your specific IP address

### Step 4: Update .env File
Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fer-website?retryWrites=true&w=majority
```

## Option 2: Local MongoDB Installation

### Ubuntu/Debian:
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### macOS:
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### Windows:
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Run installer
3. MongoDB will start as a service automatically

### Verify Installation:
```bash
# Test connection
mongosh
# Or older versions:
mongo
```

### Update .env File:
Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/fer-website
```

## Option 3: Docker (Alternative)

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=fer-website \
  mongo:latest

# Update .env
MONGODB_URI=mongodb://localhost:27017/fer-website
```

## Testing Connection

After updating `.env`, restart your backend:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
📊 Database: fer-website
🔗 Host: localhost:27017
```

## Troubleshooting

### Error: ECONNREFUSED
- **Local MongoDB:** Make sure MongoDB service is running
- **MongoDB Atlas:** Check IP whitelist and credentials

### Error: Authentication failed
- Check username and password in connection string
- Verify database user exists in Atlas

### Error: Timeout
- Check internet connection (for Atlas)
- Verify firewall isn't blocking port 27017 (local)

### Server runs but MongoDB not connected
- Check `.env` file exists in `backend/` folder
- Verify `MONGODB_URI` is set correctly
- Restart server after updating `.env`

## Quick Start (Recommended: MongoDB Atlas)

1. **Sign up:** https://www.mongodb.com/cloud/atlas/register
2. **Create cluster:** Free tier (M0)
3. **Get connection string:** Connect → Connect your application
4. **Update .env:** Add connection string to `backend/.env`
5. **Restart server:** `npm run dev`

That's it! No local installation needed.

