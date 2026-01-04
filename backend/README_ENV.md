# Backend Environment Setup

## .env File Configuration

Your `.env` file should be located in the `backend/` directory and contain the following:

```env
MONGODB_URI=mongodb://localhost:27017/fer-website
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
PYTHON_API_URL=http://localhost:8000
```

## MongoDB Connection String Formats

### Local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/fer-website
```

### MongoDB Atlas (Cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fer-website?retryWrites=true&w=majority
```

**Important:** Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.

## Troubleshooting

### If you see "MongoDB Connection Error":

1. **For Local MongoDB:**
   - Make sure MongoDB is installed and running
   - Start MongoDB: `sudo systemctl start mongod` (Linux) or `brew services start mongodb-community` (Mac)
   - Check if MongoDB is running: `mongosh` or `mongo`

2. **For MongoDB Atlas:**
   - Make sure your IP address is whitelisted in MongoDB Atlas
   - Check your username and password are correct
   - Verify the cluster name in the connection string

3. **The server will still run** even if MongoDB is not connected, but database features won't work.

## Quick Setup

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and add your MongoDB connection string

3. Make sure MongoDB is running (for local) or your Atlas connection is configured

4. Restart the server:
   ```bash
   npm run dev
   ```

