# FixPoint - Civic Issue Reporting Platform

FixPoint is a comprehensive web application that connects citizens with local authorities to report and resolve civic issues in their communities. Built with Spring Boot backend and React frontend, it promotes civic engagement, transparency, and collaborative problem-solving.

## Features

### For Citizens

- **Issue Reporting**: Submit reports with photos, descriptions, and precise GPS locations
- **Map-based Exploration**: Browse community issues on an interactive map
- **Progress Tracking**: Monitor the status of submitted reports with real-time updates
- **Community Engagement**: Vote on issues and add comments
- **Volunteer System**: Opt-in to help resolve local problems

### For Administrators & NGO Staff

- **Dashboard Management**: Access filtered views of reports by area, category, or severity
- **Status Management**: Update report lifecycle (Submitted → In Progress → Resolved)
- **Assignment System**: Assign reports to teams, contractors, or volunteers
- **Analytics**: Generate statistical reports and visualizations
- **Quality Control**: Validate, merge, or remove duplicate/spam reports

### Advanced Features

- **Real-time Chat**: Built-in messaging between users, admins, and volunteers
- **Gamification**: Monthly challenges and community leaderboards
- **Multi-language Support**: AI-powered translation (Bangla ↔ English)
- **AI Categorization**: Auto-suggest issue categories based on photos and descriptions
- **AI-Powered Description Generation**: Automatically generate descriptions from uploaded images using LangChain

## Technology Stack

### Backend

- **Spring Boot 3.5.4** - Main framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction
- **JWT** - Token-based authentication
- **H2/MySQL/PostgreSQL** - Database options
- **LangChain4j** - AI integration for image analysis
- **Maven** - Dependency management

### Frontend

- **React 18** - UI framework
- **React Router** - Navigation
- **Leaflet** - Interactive maps
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Toastify** - Notifications

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd FixPoint
   ```

2. **Configure database** (Optional - H2 is configured by default)
   Edit `src/main/resources/application.properties`:

   ```properties
   # For MySQL
   spring.datasource.url=jdbc:mysql://localhost:3306/fixpoint
   spring.datasource.username=your-username
   spring.datasource.password=your-password
   spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
   ```

3. **Run the Spring Boot application**
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`

### AI-Powered Description Generation Setup

The application includes AI-powered description generation using LangChain4j. You can configure either OpenAI or Google Vertex AI:

#### Option 1: OpenAI (Recommended for development)

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Edit `src/main/resources/application.properties`:
   ```properties
   ai.provider=openai
   openai.api.key=your_actual_openai_api_key_here
   ```

#### Option 2: Google Vertex AI

1. Set up a Google Cloud project and enable Vertex AI API
2. Get your project ID from [Google Cloud Console](https://console.cloud.google.com/)
3. Edit `src/main/resources/application.properties`:
   ```properties
   ai.provider=vertexai
   vertexai.project.id=your_actual_project_id_here
   vertexai.location=us-central1
   ```

#### How it works:

- Upload an image in the report form
- Click "Generate Description with AI" button
- The AI analyzes the image and generates a detailed description
- You can review, edit, or use the generated description
- The system gracefully falls back if AI services are unavailable

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
   The frontend will start on `http://localhost:3000`

### Default Admin User

On first run, you can create an admin user through the registration form, then manually update the role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'your-admin-username';
```

## API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/check-username` - Check username availability
- `GET /api/auth/check-email` - Check email availability

### Reports

- `GET /api/reports` - Get all reports (authenticated)
- `POST /api/reports` - Create new report
- `GET /api/reports/{id}` - Get report by ID
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports/area` - Get reports in geographical area
- `POST /api/reports/{id}/vote` - Vote for a report
- `PUT /api/reports/{id}/status` - Update report status (admin only)
- `PUT /api/reports/{id}/assign` - Assign report (admin only)

### Public Endpoints

- `GET /api/public/reports` - Get public reports
- `GET /api/public/reports/resolved` - Get resolved reports
- `GET /api/public/reports/categories` - Get report categories
- `GET /api/public/reports/statuses` - Get report statuses

## Database Schema

### Users Table

- Basic user information (username, email, password)
- Location data (latitude, longitude, address)
- Role management (CITIZEN, ADMIN, NGO_STAFF)
- Volunteer status and skills

### Reports Table

- Issue details (title, description, category)
- Status tracking (SUBMITTED, IN_PROGRESS, RESOLVED, REJECTED)
- Location data with precise coordinates
- Image attachments and resolution photos
- Priority levels and vote counts

### Supporting Tables

- Comments for community discussion
- Votes for issue prioritization
- Chat messages for real-time communication

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for citizens, admins, and NGO staff
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Comprehensive validation on both frontend and backend
- **File Upload Security**: Secure image upload with size and type restrictions

## Development

### Running Tests

```bash
# Backend tests
./mvnw test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Backend
./mvnw clean package

# Frontend
cd frontend
npm run build
```

### Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:8080
```

## Deployment

### Docker (Optional)

Create a `Dockerfile` for containerized deployment:

```dockerfile
# Backend Dockerfile
FROM openjdk:17-jdk-slim
COPY target/fixpoint-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

### Production Configuration

For production, update `application.properties`:

```properties
spring.profiles.active=prod
spring.datasource.url=${DATABASE_URL}
spring.jpa.hibernate.ddl-auto=validate
jwt.secret=${JWT_SECRET}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] Mobile application (React Native)
- [ ] AI-powered issue categorization
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with government APIs
- [ ] Offline capability with sync

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team at [team-email]

## Acknowledgments

- OpenStreetMap for map data
- Leaflet for mapping functionality
- Spring Boot and React communities
- All contributors and beta testers

---

**Built with ❤️ by Team Ambiguous**
