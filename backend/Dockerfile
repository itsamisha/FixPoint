# Multi-stage build for Render deployment
FROM eclipse-temurin:17-jdk-alpine AS build

# Install Maven
RUN apk add --no-cache maven

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies first (for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the JAR file
COPY --from=build /app/target/fixpoint-0.0.1-SNAPSHOT.jar app.jar

# Create data directory for H2 database and uploads directory for file storage
RUN mkdir -p /app/data /app/uploads

# Expose port (Render will set PORT environment variable)
EXPOSE $PORT

# Set environment
ENV SPRING_PROFILES_ACTIVE=production

# Run the application with dynamic port binding
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
