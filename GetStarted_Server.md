# Getting Started with Document Analysis Backend

This guide will help you set up and run the backend server locally.

## Prerequisites

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **Package Manager**: pnpm, npm, or yarn
  - Recommended: `npm install -g pnpm`
- **MongoDB**: 
  - Option 1: MongoDB Atlas (Cloud) - [Free tier available](https://www.mongodb.com/cloud/atlas)
  - Option 2: Local MongoDB ([Download](https://www.mongodb.com/try/download/community))
- **Git**: For cloning the repository

## Installation

### 1. Install Dependencies

```bash
# Navigate to server folder
cd server

# Install all dependencies
pnpm install
# OR
npm install
# OR
yarn install
```

### 2. Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user (username & password)
5. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
6. Add your IP address to whitelist

#### Option B: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # macOS (if installed with Homebrew)
   brew services start mongodb-community

   # Windows (run in cmd as administrator)
   mongod

   # Linux
   sudo systemctl start mongod
   ```
3. Connection string: `mongodb://localhost:27017/ScanDownload`

### 3. Configure Environment Variables

Create a `.env` file in the `server` folder:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ScanDownload
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/ScanDownload

# JWT Secret (use a random string for production)
JWT_SECRET=your-secret-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Email Service (Optional - for real OTP sending)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Development Server

### Start the Backend

```bash
# From the server folder
pnpm run dev
```

**Output:**
```
VITE v7.1.2  ready in 1095 ms

  ➜  Local:   http://localhost:3000/
  ➜  MongoDB connected
```

### Verify Server is Running

```bash
# In another terminal, test the API
curl http://localhost:3000/api/ping

# Expected response:
# {"message":"Server is running"}
```

## Available Scripts

```bash
# Start development server with auto-reload
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Run tests
pnpm run test

# Type checking
pnpm run typecheck
```

## Project Structure

```
server/
├── routes/                  # API route handlers
│   ├── auth.ts             # Authentication endpoints (OTP, login, verify)
│   ├── documents.ts        # Document upload & analysis
│   ├── users.ts            # User profile management
│   └── demo.ts             # Demo/test endpoints
│
├── models/                  # MongoDB schemas
│   ├── User.ts             # User schema with upload count, premium status
│   ├── Document.ts         # Document metadata schema
│   ├── Analysis.ts         # Document analysis results
│   ├── ChatMessage.ts      # Chat history
│   └── OTPSession.ts       # OTP storage with expiration
│
├── controllers/             # Business logic
│   └── userController.ts   # User operations (get profile, documents, etc.)
│
├── index.ts                # Main server entry point
├── package.json            # Backend dependencies
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables (create this)
└── GetStarted_Server.md    # This file
```

## API Endpoints

### Authentication
```
POST   /api/auth/send-otp          # Send OTP
POST   /api/auth/verify-otp        # Verify OTP and login
GET    /api/auth/verify-token      # Verify JWT token
```

### Documents
```
POST   /api/documents/upload       # Upload document
GET    /api/documents              # Get user's documents
POST   /api/documents/transcribe   # Transcribe audio
GET    /api/documents/:id/analyze  # Analyze document
GET    /api/documents/:id/chat     # Get chat history
POST   /api/documents/:id/chat     # Send chat message
```

### Users
```
GET    /api/users/profile/:id      # Get user profile
PATCH  /api/users/profile/:id      # Update user profile
GET    /api/users/documents/:id    # Get user's document history
DELETE /api/users/documents/:id    # Delete document
```

## Testing with Dummy OTP

For development/testing without sending real OTPs:

### 1. Test OTP Flow

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Response includes OTP in console logs (development mode)
# [TEST] OTP for test@example.com: 123456
```

### 2. Verify OTP

```bash
# Use the OTP from console logs
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# Response includes token for authentication
# {"success":true,"token":"...","refreshToken":"..."}
```

### 3. Use Token in Requests

```bash
# Use returned token in Authorization header
curl http://localhost:3000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Operations

### Connect to MongoDB Locally

```bash
# Using MongoDB CLI
mongosh

# Switch to database
use ScanDownload

# View collections
show collections

# Check documents
db.users.find()
db.documents.find()
db.otpsessions.find()
```

### Backup Database

```bash
# Backup from MongoDB Atlas
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" --out=./backup

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" ./backup
```

## Development Tips

### Hot Reload
- Changes to TypeScript files automatically restart the server
- No manual restart needed

### Logging
All logs print to console with context:
```
MongoDB connected
[TEST] OTP for email@example.com: 123456
Upload error: ...
```

### Error Handling
- All endpoints return JSON with `success` boolean
- Errors include descriptive messages
- Status codes follow HTTP standards (400, 401, 404, 500)

### MongoDB Connection Issues

```bash
# Test connection string
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/dbname"

# Check IP whitelist in MongoDB Atlas
# Settings > Network Access > IP Whitelist
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm run dev
```

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Check if local MongoDB is running:
   ```bash
   # macOS
   brew services list | grep mongodb-community

   # Windows
   net start MongoDB
   ```

2. Check MongoDB Atlas connection string
3. Verify IP is whitelisted in MongoDB Atlas
4. Check database username/password

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors
```bash
# Run type checking
pnpm run typecheck

# Fix TypeScript errors
tsc --noEmit
```

### OTP Not Appearing in Logs

For production, OTPs are sent via email/SMS. In development:
```bash
# Check console output for [TEST] prefix
# If not showing, check NODE_ENV=development in .env
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment (development/production) |
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/ScanDownload` | MongoDB connection string |
| `JWT_SECRET` | `your-secret-key-...` | JWT signing secret |
| `FRONTEND_URL` | `http://localhost:8080` | Frontend URL for CORS |
| `RESEND_API_KEY` | (optional) | Email sending API key |
| `RESEND_FROM_EMAIL` | (optional) | Email from address |

## Performance Monitoring

### Check Server Health
```bash
# Every 5 seconds
watch -n 5 "curl http://localhost:3000/api/ping"
```

### Monitor Memory Usage
```bash
# Watch Node process
node --inspect dist/index.js

# Open chrome://inspect in Chrome
```

### Database Indexes
Important for production:
```bash
# Create indexes in MongoDB
db.documents.createIndex({ userId: 1, uploadedAt: -1 })
db.users.createIndex({ email: 1 })
db.otpsessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

## Security Checklist

- [ ] `JWT_SECRET` is long random string (not default)
- [ ] Database user has limited permissions
- [ ] IP whitelist in MongoDB Atlas
- [ ] HTTPS in production
- [ ] CORS configured for frontend domain
- [ ] Environment variables not committed to git
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented

## Deployment

For deploying the backend to production, see `../DEPLOY_BACKEND.md`

Quick deployment to Railway:
```bash
# Login to Railway
railway login

# Link to project
railway link

# Deploy
railway up
```

## API Testing with Postman/Insomnia

### 1. Send OTP
```
POST http://localhost:3000/api/auth/send-otp
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 2. Verify OTP
```
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}
```

### 3. Upload Document
```
POST http://localhost:3000/api/documents/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: [select a file]
```

## Getting Help

1. Check error messages in console
2. Verify MongoDB is running
3. Confirm environment variables are set
4. Check API response status codes
5. Review TypeScript types in `../shared/api.ts`

## Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ✅ Set up MongoDB (Atlas or local)
3. ✅ Create `.env` file with configuration
4. ✅ Start dev server: `pnpm run dev`
5. ✅ Test API: `curl http://localhost:3000/api/ping`
6. ✅ Test OTP flow

## Development Workflow

```bash
# Terminal 1: Start Backend
cd server
pnpm install
pnpm run dev

# Terminal 2: Start Frontend  
cd client
pnpm install
pnpm run dev

# Browser
open http://localhost:8080
```

Happy coding! 🚀
