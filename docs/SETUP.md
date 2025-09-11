# FixPoint Setup Guide

## Quick Start

### Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher

### 1. Clone and Install

```bash
git clone <repository-url>
cd FixPoint
npm install
```

### 2. Start the Application

```bash
npm start
```

This will start:

- Backend on `http://localhost:8080`
- Frontend on `http://localhost:3000`

## Individual Setup

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Configure AI Services** (Optional)
   Edit `src/main/resources/application.properties`:

   ```properties
   # For Google Gemini (Recommended - FREE)
   ai.provider=gemini
   gemini.api.key=your_gemini_api_key_here

   # For OpenAI (Backup)
   openai.api.key=your_openai_api_key_here

   # For Google Cloud Speech
   google.cloud.project.id=your_project_id
   google.cloud.credentials.path=path/to/credentials.json
   ```

3. **Run the Spring Boot application**
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## AI Services Setup

### Google Gemini (Recommended - FREE)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (starts with `AIza...`)
5. Add to `application.properties`:
   ```properties
   gemini.api.key=AIzaSyBl-YOUR-ACTUAL-KEY-HERE
   ai.provider=gemini
   ```

### OpenAI (Alternative)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the generated API key (starts with `sk-`)
5. Add to `application.properties`:
   ```properties
   openai.api.key=sk-your-actual-api-key-here
   ```

## Speech Features Setup

### Test Speech Features (No Backend Needed!)

Open this file in your browser:

```
frontend/public/speech-standalone.html
```

### Backend Speech Setup (Optional)

1. **Get Google Cloud Speech API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Speech-to-Text API
   - Create service account and download credentials
2. **Configure in application.properties**
   ```properties
   google.cloud.project.id=your_project_id
   google.cloud.credentials.path=path/to/credentials.json
   ```

## Database Setup

### Default Admin User

On first run, create an admin user through the registration form, then update the role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'your-admin-username';
```

### Test Data

The application includes dummy data for testing:

- **Staff User**: `dummy.staff` / `dummy123`
- **Sample Reports**: Various test reports with different statuses
- **Organizations**: Test organizations for assignment

## Environment Variables

### Frontend Environment

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### Backend Environment

The backend uses `application.properties` for configuration. Key settings:

```properties
# Database
spring.datasource.url=jdbc:h2:file:./data/fixpoint
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=your-secret-key-here
jwt.expiration=86400000

# AI Services
ai.provider=gemini
gemini.api.key=${GEMINI_API_KEY:}
openai.api.key=${OPENAI_API_KEY:}

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## Building for Production

```bash
# Build both backend and frontend
npm run build

# Or build individually:
# Backend
npm run build:backend

# Frontend
npm run build:frontend
```

## Available Scripts

- `npm start` - Start both backend and frontend
- `npm run backend` - Start only backend
- `npm run frontend` - Start only frontend
- `npm run build` - Build both backend and frontend
- `npm run test` - Run all tests
- `npm run clean` - Clean build artifacts

## Testing

### Test AI Features

1. Start the application
2. Go to report form and upload a test image
3. Select a category (e.g., "Roads & Infrastructure")
4. Click "Generate AI Description"
5. Check console logs for detailed analysis process

### Test Chatbot

1. Visit `http://localhost:3000`
2. Look for the 🤖 button in bottom-right
3. Click it and ask: "How do I report a pothole?"

### Test Speech Features

1. Go to "Report Issue"
2. Use the 🎤 button next to the description field
3. **Speech-to-Text works offline!**

## Troubleshooting

### Common Issues

**Backend won't start:**

- Check Java version: `java -version` (should be 17+)
- Check Maven: `mvn -version`
- Check port 8080 is not in use

**Frontend won't start:**

- Check Node.js version: `node -version` (should be 16+)
- Delete `node_modules` and run `npm install` again
- Check port 3000 is not in use

**AI features not working:**

- Check API keys in `application.properties`
- Verify internet connection
- Check console logs for error messages

**Database issues:**

- Delete `data/fixpoint.mv.db` to reset database
- Restart the application

### Debug Commands

```bash
# Check backend status
curl http://localhost:8080/api/organizations

# Check frontend
curl http://localhost:3000

# Check AI service
curl -X POST http://localhost:8080/api/public/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

## Additional Resources

- **[Features Documentation](FEATURES.md)** - Detailed feature descriptions and screenshots
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[AI Setup Guide](setup/MULTI_AI_SETUP_GUIDE.md)** - Advanced AI configuration
- **[Chatbot Setup](setup/CHATBOT_SETUP_COMPLETE.md)** - Chatbot configuration
- **[Speech Setup](setup/SPEECH-SETUP.md)** - Speech features configuration

---

**Need help?** Check the troubleshooting section above or refer to the detailed documentation in the `docs/` folder.
