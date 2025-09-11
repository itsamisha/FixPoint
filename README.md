# FixPoint - Civic Issue Reporting Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Website-blue)](https://itsamisha.github.io/FixPoint/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Production-green)](https://fixpoint-ajtz.onrender.com)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-Watch%20Now-red)](https://youtube.com/watch?v=demo)

FixPoint is a comprehensive web application that connects citizens with local authorities to report and resolve civic issues in their communities. Built with Spring Boot backend and React frontend, it promotes civic engagement, transparency, and collaborative problem-solving through AI-powered features and real-time communication.

## 🚀 Quick Start

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

## ✨ Key Features

### 🏠 For Citizens

- **Issue Reporting** with photos, GPS locations, and AI-generated descriptions
- **Interactive Map** to browse and filter community issues
- **Progress Tracking** with real-time status updates
- **Community Engagement** through voting, comments, and discussions
- **Volunteer System** with certificate generation
- **Voice Features** for accessibility (speech-to-text/text-to-speech)
- **Multi-language Support** (Bangla ↔ English translation)

### 🏛️ For Administrators & Staff

- **Dashboard Management** with filtered views and analytics
- **Task Assignment** to teams, contractors, and volunteers
- **Status Management** through complete report lifecycle
- **Quality Control** with duplicate detection and spam prevention
- **PDF Export** for reports and analytics

### 🤖 Advanced AI Features

- **AI-Powered Description Generation** from uploaded images
- **Smart Categorization** based on photos and descriptions
- **Duplicate Detection** to prevent spam
- **Priority Assessment** based on safety and impact
- **AI Chatbot** for civic engagement guidance
- **Auto-Translation** between languages

## 🛠️ Technology Stack

**Frontend:** React.js, React Router, Leaflet Maps, Axios, jsPDF  
**Backend:** Spring Boot, Spring Security, JWT, WebSocket  
**Database:** H2 (Development), PostgreSQL/MySQL (Production)  
**AI Services:** Google Gemini, OpenAI, Google Cloud Speech

## 📚 Documentation

| Document                                                     | Description                                |
| ------------------------------------------------------------ | ------------------------------------------ |
| **[📋 Features & Screenshots](FEATURES.md)**                 | Complete feature overview with screenshots |
| **[⚙️ Setup Guide](SETUP.md)**                               | Detailed installation and configuration    |
| **[🚀 Deployment Guide](DEPLOYMENT.md)**                     | Production deployment instructions         |
| **[🤖 AI Setup](docs/setup/MULTI_AI_SETUP_GUIDE.md)**        | AI services configuration                  |
| **[💬 Chatbot Setup](docs/setup/CHATBOT_SETUP_COMPLETE.md)** | Chatbot configuration                      |
| **[🎤 Speech Setup](docs/setup/SPEECH-SETUP.md)**            | Speech features setup                      |

## 🎯 Project Structure

```
FixPoint/
├── backend/          # Spring Boot backend
├── frontend/         # React frontend
├── docs/            # Detailed documentation
├── assets/          # Screenshots and images
├── scripts/         # Build and utility scripts
└── tests/           # Test files and data
```

## 🔧 Available Scripts

- `npm start` - Start both backend and frontend
- `npm run build` - Build for production
- `npm run test` - Run all tests
- `npm run clean` - Clean build artifacts

## 🌍 Live Demo

- **Frontend**: [https://itsamisha.github.io/FixPoint/](https://itsamisha.github.io/FixPoint/)
- **Backend API**: [https://fixpoint-ajtz.onrender.com](https://fixpoint-ajtz.onrender.com)
- **Demo Video**: [YouTube Demo](https://youtube.com/watch?v=demo)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ by Team Ambiguous - Connecting Communities, One Issue at a Time**
