# Use Maven image for building - Render Docker deployment
FROM maven:3.9.4-openjdk-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN mvn clean package -DskipTests

# Use OpenJDK 17 for runtime
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/fixpoint-0.0.1-SNAPSHOT.jar app.jar

# Expose port (Render will set PORT environment variable)
EXPOSE $PORT

# Run the application with dynamic port
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
