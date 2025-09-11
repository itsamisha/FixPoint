# FixPoint - Civic Issue Reporting Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Website-blue)](https://itsamisha.github.io/FixPoint/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Production-green)](https://fixpoint-ajtz.onrender.com)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-Watch%20Now-red)](https://youtube.com/watch?v=demo)

### Visit Our Website :

- **Frontend**: [https://itsamisha.github.io/FixPoint/](https://itsamisha.github.io/FixPoint/)
- **Backend**: [https://fixpoint-ajtz.onrender.com](https://fixpoint-ajtz.onrender.com)
- **Demo Video**: [YouTube Demo](https://youtube.com/watch?v=demo)

FixPoint is a comprehensive web application that connects citizens with local authorities to report and resolve civic issues in their communities. Built with Spring Boot backend and React frontend, it promotes civic engagement, transparency, and collaborative problem-solving through AI-powered features and real-time communication.

In many urban and semi-urban neighborhoods, small civic problems such as broken streetlights, potholes, garbage overflow, and stray animals often go unreported and unattended. Citizens are frequently unsure of where to report such problems, or they feel disheartened by the lack of visible response.

**FixPoint addresses this challenge by providing a user-friendly web application that enables residents to report local issues quickly and easily.**

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd FixPoint
npm install

# Start the application
npm start
```

**Access the application:**

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

## Key Features

### For Citizens

- **Issue Reporting**: Submit reports with photos, descriptions, and precise GPS locations
- **Interactive Map**: Browse community issues on an interactive map with filtering options
- **Progress Tracking**: Monitor the status of submitted reports with real-time updates
- **Community Engagement**: Vote on issues, add comments, and participate in discussions
- **Volunteer System**: Opt-in to help resolve local problems and earn certificates
- **Voice Features**: Voice-to-text and text-to-speech conversion for accessibility
- **Multi-language Support**: Report in Bangla with automatic English translation

### For Administrators & NGO Staff

- **Dashboard Management**: Access filtered views of reports by area, category, or severity
- **Status Management**: Update report lifecycle (Submitted → In Progress → Resolved)
- **Assignment System**: Assign reports to teams, contractors, or volunteers
- **Analytics**: Generate statistical reports and visualizations
- **Quality Control**: Validate, merge, or remove duplicate/spam reports
- **PDF Export**: Generate and export detailed reports

### Advanced AI Features

- **AI-Powered Description Generation**: Automatically generate descriptions from uploaded images
- **Smart Categorization**: AI suggests issue categories based on photos and descriptions
- **Duplicate Detection**: Intelligent detection of similar reports to prevent spam
- **Priority Assessment**: AI determines issue priority based on safety and impact
- **AI Chatbot**: Interactive assistant for civic engagement guidance
- **Auto-Translation**: Seamless Bangla ↔ English translation

## Technology Stack

**Frontend:** React.js, React Router, Leaflet Maps, Axios, jsPDF  
**Backend:** Spring Boot, Spring Security, JWT, WebSocket  
**Database:** H2 (Development), PostgreSQL/MySQL (Production)  
**AI Services:** Google Gemini, OpenAI, Google Cloud Speech

## Documentation

- **[Features & Screenshots](docs/FEATURES.md)** - Complete feature overview with screenshots
- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[AI Setup](docs/setup/MULTI_AI_SETUP_GUIDE.md)** - AI services configuration
- **[Chatbot Setup](docs/setup/CHATBOT_SETUP_COMPLETE.md)** - Chatbot configuration
- **[Speech Setup](docs/setup/SPEECH-SETUP.md)** - Speech features setup

## Project Structure

```
FixPoint/
├── backend/          # Spring Boot backend
├── frontend/         # React frontend
├── docs/            # Detailed documentation
├── assets/          # Screenshots and images
├── scripts/         # Build and utility scripts
└── tests/           # Test files and data
```

## Available Scripts

- `npm start` - Start both backend and frontend
- `npm run build` - Build for production
- `npm run test` - Run all tests
- `npm run clean` - Clean build artifacts

---

**Built by Team Ambiguous - Connecting Communities, One Issue at a Time**
