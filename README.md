# FixPoint - Civic Issue Reporting Platform

### Visit Our Website :
- **Frontend**: [https://itsamisha.github.io/FixPoint/](https://itsamisha.github.io/FixPoint/)
- **Backend**: [https://fixpoint-ajtz.onrender.com](https://fixpoint-ajtz.onrender.com)
- **Demo Video**: [YouTube Demo](https://youtube.com/watch?v=demo)

FixPoint is a comprehensive web application that connects citizens with local authorities to report and resolve civic issues in their communities. Built with Spring Boot backend and React frontend, it promotes civic engagement, transparency, and collaborative problem-solving through AI-powered features and real-time communication.

In many urban and semi-urban neighborhoods, small civic problems such as broken streetlights, potholes, garbage overflow, and stray animals often go unreported and unattended. Citizens are frequently unsure of where to report such problems, or they feel disheartened by the lack of visible response.

**FixPoint addresses this challenge by providing a user-friendly web application that enables residents to report local issues quickly and easily.**

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

## Feature Screenshots

### 1. Homepage

**Welcome to FixPoint - Your Civic Engagement Platform**

![Homepage](./assets/homepage.png)
_Clean, modern homepage with role-based authentication for Citizens, Admins, Staff, and Volunteers_

![Signup & Authentication](./assets/2_signup_auth.png)
_Seamless user registration and login system with intuitive role selection_

### 2. Reporting Issues

**From Problem to Solution - The Complete Reporting Experience**

![Issue Reporting by Citizen](./assets/3_reporting_issue_by_citizen.png)
_Comprehensive report form with image upload, GPS location mapping, and detailed descriptions_

![AI Auto-Generated Description](./assets/4_AI_auto_generateddescriptionandvoicetotext.png)
_AI automatically generates descriptions from uploaded images and converts voice to text and vice-versa_

![AI Categorization & Priority](./assets/4*AIcategorizationand priority.png)
\_Smart categorization and priority assessment using advanced AI analysis*

![Duplicate Check](./assets/6_duplicatecheck.png)
_Intelligent duplicate detection prevents spam and consolidates similar reports_

### 3. Interactive Mapping & Organization

**Visual Problem Tracking and Targeted Reporting**

![Map and Organization Selection](./assets/5_mapandorganizationselect.png)
_Interactive map interface with organization dropdown for targeted reporting_

![Task in Map View](./assets/taskinmapview.png)
_Real-time map showing all community issues with filtering and status indicators_

### 4. Dashboard & Management

**Comprehensive Control Center for All Users**

![Dashboard](./assets/7_dashboard.png)
_Unified dashboard providing overview of reports, statistics, and quick actions_

![Reports Overview](./assets/8_reportshpw.png)
_Detailed reports view with filtering, sorting, and bulk operations_

![Update Progress](./assets/8_updateprogress.png)
_Real-time progress tracking and status updates for issue resolution_

### 5. Communication & Collaboration

**Building Community Through Active Engagement**

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="./assets/AIchatbot.png" alt="AI Chatbot" width="100%"/>
        <br><em>Intelligent AI assistant providing guidance on civic engagement, issue reporting, and community participation</em>
      </td>
      <td align="center" width="50%">
        <img src="./assets/chat.png" alt="Chat System" width="100%"/>
        <br><em>Built-in messaging system for seamless communication between users, admins, and volunteers</em>
      </td>
    </tr>
  </table>
</div>

![Comments](./assets/comment.png)
_Community discussion and feedback system for each reported issue_

![Notifications](./assets/notification.png)
_Real-time notifications keep users informed about report updates and community activities_

### 6. Recognition & Documentation

**Celebrating Community Contributions**

![Certificate Generation](./assets/cirtificate.png)
_Automated certificate generation for volunteers and contributors_

![PDF Reports](./assets/reportpdf.png)
_Professional PDF export functionality for reports and analytics_

## Technology Stack

### Frontend

- **React.js** (v18.2.0) - UI Framework
- **React Router DOM** (v6.3.0) - Navigation
- **React Hook Form** (v7.45.1) - Form Management
- **Leaflet + React Leaflet** (v4.2.1) - Interactive Maps
- **Axios** (v1.4.0) - HTTP Client
- **React Toastify** (v9.1.3) - Notifications
- **jsPDF** (v3.0.2) - PDF Generation
- **Heroicons & Lucide React** - UI Icons
- **SockJS + STOMP** - WebSocket Communication

### Backend

- **Spring Boot** (v3.5.4) - Main Framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database Abstraction
- **JWT** - Token-based Authentication
- **Spring WebSocket** - Real-time Communication
- **Maven** - Dependency Management
- **Java 17** - Programming Language

### Database & Storage

- **H2 Database** - Primary Database (Development)
- **PostgreSQL/MySQL** - Production Database Options
- **Local File System** - Image Storage (Max 10MB)

## Project Structure

```
FixPoint/
├── backend/                    # Spring Boot backend
│   ├── src/                   # Source code
│   ├── target/                # Build output
│   ├── pom.xml               # Maven configuration
│   └── mvnw*                 # Maven wrapper
├── frontend/                  # React frontend
│   ├── src/                  # Source code
│   ├── public/               # Static assets
│   └── package.json          # Dependencies
├── docs/                     # Documentation
│   ├── features/             # Feature documentation
│   ├── setup/                # Setup guides
│   └── deployment/           # Deployment guides
├── scripts/                  # Build and utility scripts
│   ├── build/                # Build scripts
│   ├── database/             # Database scripts
│   └── deployment/           # Deployment scripts
├── tests/                    # Test files
│   ├── html/                 # HTML test files
│   ├── data/                 # Test data
│   └── python/               # Python test scripts
├── assets/                   # Images and static assets
├── uploads/                  # User uploaded files
├── data/                     # Database files
└── config/                   # Configuration files
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd FixPoint
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start both backend and frontend**

   ```bash
   npm start
   ```

   This will start:

   - Backend on `http://localhost:8080`
   - Frontend on `http://localhost:3000`

### Individual Setup

#### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Configure AI Services** (Optional)
   Edit `src/main/resources/application.properties`:

   ```properties
   # For Google Gemini
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

#### Frontend Setup

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

### Default Admin User

On first run, create an admin user through the registration form, then update the role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'your-admin-username';
```

### Building for Production

```bash
# Build both backend and frontend
npm run build

# Or build individually:
# Backend
npm run build:backend

# Frontend
npm run build:frontend
```

### Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

## Deployment

### Docker (Optional)

```dockerfile
# Backend Dockerfile (located in config/Dockerfile)
FROM openjdk:17-jdk-slim
COPY backend/target/fixpoint-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

### Production Configuration

For production, update `backend/src/main/resources/application.properties`:

```properties
spring.profiles.active=prod
spring.datasource.url=${DATABASE_URL}
spring.jpa.hibernate.ddl-auto=validate
jwt.secret=${JWT_SECRET}
ai.provider=${AI_PROVIDER}
```

### Available Scripts

- `npm start` - Start both backend and frontend
- `npm run backend` - Start only backend
- `npm run frontend` - Start only frontend
- `npm run build` - Build both backend and frontend
- `npm run test` - Run all tests
- `npm run clean` - Clean build artifacts

## Documentation

- **[Complete Documentation](docs/README.md)** - Full setup and feature guide
- **[Feature Documentation](docs/features/)** - Detailed feature explanations
- **[Setup Guides](docs/setup/)** - Installation and configuration
- **[Deployment Guides](docs/deployment/)** - Production deployment

---

**Built by Team Ambiguous - Connecting Communities, One Issue at a Time**
