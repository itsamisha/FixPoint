# FixPoint Deployment Guide

## Production Deployment

### Current Production URLs

- **Frontend**: [https://itsamisha.github.io/FixPoint/](https://itsamisha.github.io/FixPoint/)
- **Backend**: [https://fixpoint-ajtz.onrender.com](https://fixpoint-ajtz.onrender.com)

## Docker Deployment

### Backend Dockerfile

```dockerfile
# Backend Dockerfile (located in config/Dockerfile)
FROM openjdk:17-jdk-slim
COPY backend/target/fixpoint-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

### Docker Commands

```bash
# Build backend image
docker build -f config/Dockerfile -t fixpoint-backend .

# Run backend container
docker run -p 8080:8080 \
  -e GEMINI_API_KEY=your_key_here \
  -e OPENAI_API_KEY=your_key_here \
  fixpoint-backend
```

## Cloud Deployment Options

### Railway (Backend)

1. **Connect Repository**

   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the backend folder

2. **Environment Variables**
   Set these in Railway dashboard:

   ```
   PORT=8080
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   SPRING_PROFILES_ACTIVE=production
   ```

3. **Deploy**
   - Railway automatically builds and deploys
   - Backend will be available at your Railway URL

### GitHub Pages (Frontend)

1. **Build Frontend**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to GitHub Pages**

   ```bash
   # Install gh-pages
   npm install -g gh-pages

   # Deploy
   gh-pages -d build
   ```

3. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch

### Render (Alternative)

1. **Backend on Render**

   - Connect GitHub repository
   - Select backend folder
   - Set environment variables
   - Deploy

2. **Frontend on Render**
   - Create new Static Site
   - Connect repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

## Production Configuration

### Backend Configuration

Update `backend/src/main/resources/application.properties`:

```properties
# Production Profile
spring.profiles.active=prod

# Database (use PostgreSQL for production)
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate

# JWT
jwt.secret=${JWT_SECRET}

# AI Services
ai.provider=${AI_PROVIDER}
gemini.api.key=${GEMINI_API_KEY}
openai.api.key=${OPENAI_API_KEY}

# CORS (allow your frontend domain)
cors.allowed-origins=${FRONTEND_URL}

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Frontend Configuration

Update `frontend/src/services/api.js` for production:

```javascript
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-backend-url.com"
    : "http://localhost:8080";
```

## Database Setup

### PostgreSQL (Recommended for Production)

1. **Create Database**

   ```sql
   CREATE DATABASE fixpoint_prod;
   CREATE USER fixpoint_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE fixpoint_prod TO fixpoint_user;
   ```

2. **Update Configuration**
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/fixpoint_prod
   spring.datasource.username=fixpoint_user
   spring.datasource.password=secure_password
   spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
   ```

### Environment Variables for Database

```
DATABASE_URL=jdbc:postgresql://your-db-host:5432/fixpoint_prod
DB_USERNAME=fixpoint_user
DB_PASSWORD=secure_password
```

## Security Configuration

### Environment Variables

Set these in your production environment:

```bash
# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-here

# AI API Keys
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Database
DATABASE_URL=your_database_url
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

### SSL/HTTPS

- **Railway**: Automatically provides HTTPS
- **GitHub Pages**: Automatically provides HTTPS
- **Custom Domain**: Configure SSL certificate

## Monitoring & Logging

### Health Checks

```bash
# Backend health check
curl https://your-backend-url.com/actuator/health

# API test
curl https://your-backend-url.com/api/organizations
```

### Logging Configuration

Add to `application.properties`:

```properties
# Logging
logging.level.com.ambiguous.fixpoint=INFO
logging.file.name=logs/fixpoint.log
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

## Troubleshooting Production Issues

### Common Issues

**Backend not starting:**

- Check environment variables are set
- Verify database connection
- Check logs for specific errors

**Frontend not connecting to backend:**

- Verify CORS configuration
- Check API URLs in frontend
- Ensure backend is accessible

**Database connection issues:**

- Verify database credentials
- Check database server is running
- Ensure network connectivity

**AI features not working:**

- Verify API keys are set correctly
- Check API quotas and limits
- Review error logs

### Debug Commands

```bash
# Test backend API
curl -X GET https://your-backend-url.com/api/organizations

# Test chatbot
curl -X POST https://your-backend-url.com/api/public/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Check health
curl https://your-backend-url.com/actuator/health
```

## Performance Optimization

### Backend Optimization

- Use connection pooling
- Enable caching
- Optimize database queries
- Use CDN for static assets

### Frontend Optimization

- Enable gzip compression
- Use CDN for assets
- Implement lazy loading
- Optimize images

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Railway deployment commands

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        run: |
          # GitHub Pages deployment commands
```

## Deployment Checklist

### Pre-Deployment

- [ ] Test all features locally
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up monitoring
- [ ] Test API endpoints

### Post-Deployment

- [ ] Verify frontend loads correctly
- [ ] Test user registration/login
- [ ] Test issue reporting
- [ ] Verify AI features work
- [ ] Check chatbot functionality
- [ ] Test file uploads
- [ ] Verify email notifications

## Support

### Getting Help

- Check application logs for errors
- Verify all environment variables are set
- Test individual components
- Review this deployment guide

### Useful URLs

- **Railway Dashboard**: Monitor backend deployment
- **GitHub Pages Settings**: Manage frontend deployment
- **Application Logs**: Check for errors and issues

---

**Deployment successful?** Your FixPoint application should now be live and accessible to users worldwide!
