# FixPoint Deployment Guide

## Current Status ✅

### Backend (Railway)
- **URL**: `https://web-production-8aac9.up.railway.app`
- **Status**: Deployed (but needs to restart with new configuration)
- **Configuration**: Updated with Railway-specific settings

### Frontend (GitHub Pages)
- **URL**: `https://itsamisha.github.io/FixPoint` (or your GitHub Pages URL)
- **Status**: Needs to be built and deployed with new API configuration

## Step-by-Step Fix Process

### 1. Backend Railway Deployment ✅ DONE

The backend has been configured with:
- ✅ `railway.toml` - Railway-specific configuration
- ✅ `PORT` environment variable support in `application.properties`
- ✅ CORS configuration for GitHub Pages
- ✅ Production-ready settings

**Action needed**: Wait for Railway to redeploy automatically (it should happen within 5-10 minutes after the git push)

### 2. Frontend GitHub Pages Deployment 🔄 NEXT STEPS

The frontend has been updated with:
- ✅ Production API URLs pointing to Railway backend
- ✅ WebSocket URLs for production
- ✅ Environment configuration

**Action needed**: Deploy the frontend to GitHub Pages

#### Frontend Deployment Commands:
```bash
# Build the frontend for production
cd frontend
npm install
npm run build

# Deploy to GitHub Pages (you may need to set this up)
# Option 1: Use gh-pages package
npm install -g gh-pages
gh-pages -d build

# Option 2: Manual deployment
# Copy the build folder contents to your GitHub Pages repository
```

### 3. Environment Variables

#### Railway Backend Environment Variables
Make sure these are set in your Railway project dashboard:
- `PORT` - (automatically set by Railway)
- `EMAIL_USERNAME` - Your email for notifications
- `EMAIL_PASSWORD` - Your email password/app password
- `SPRING_PROFILES_ACTIVE` - Set to `production`

#### Frontend Environment Variables
The frontend is configured to automatically detect production environment.

### 4. Testing the Connection

Once both are deployed, test with:

```javascript
// Test backend API
fetch('https://web-production-8aac9.up.railway.app/api/organizations')
  .then(response => response.json())
  .then(data => console.log('Backend working:', data))
  .catch(error => console.error('Backend error:', error));
```

### 5. Common Issues and Solutions

#### Backend Issues:
- **404 errors**: Check if Railway deployment completed successfully
- **Port issues**: Railway automatically sets PORT environment variable
- **CORS errors**: Backend is configured to allow requests from GitHub Pages

#### Frontend Issues:
- **API connection**: Frontend automatically detects GitHub Pages and uses Railway backend
- **WebSocket connection**: Updated to use Railway URL for production
- **Authentication**: JWT tokens should work across domains

### 6. Monitoring

#### Check Backend Status:
- Railway Dashboard: Monitor logs and deployment status
- Health Check: `https://web-production-8aac9.up.railway.app/actuator/health`
- API Test: `https://web-production-8aac9.up.railway.app/api/organizations`

#### Check Frontend Status:
- GitHub Pages settings in repository
- Browser console for API connection errors
- Network tab for failed requests

## URLs Summary

| Service | Local Development | Production |
|---------|------------------|------------|
| Backend API | `http://localhost:8080` | `https://web-production-8aac9.up.railway.app` |
| Frontend | `http://localhost:3000` | `https://itsamisha.github.io/FixPoint` |
| WebSocket | `ws://localhost:8080/ws` | `wss://web-production-8aac9.up.railway.app/ws` |

## Next Actions for You:

1. **Wait 5-10 minutes** for Railway to redeploy the backend automatically
2. **Test the backend** with: `https://web-production-8aac9.up.railway.app/api/organizations`
3. **Deploy the frontend** to GitHub Pages using the commands above
4. **Test the full application** once both are deployed

The configuration has been updated to automatically handle the connection between your GitHub Pages frontend and Railway backend. Once Railway finishes redeploying, the API should work properly.
