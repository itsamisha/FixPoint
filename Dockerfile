# Multi-stage build for Render deployment
FROM openjdk:17-jdk-slim AS build

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies first (for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM openjdk:17-jre-slim

WORKDIR /app

# Copy the JAR file
COPY --from=build /app/target/fixpoint-0.0.1-SNAPSHOT.jar app.jar

# Create data directory for H2 database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8080

# Set environment
ENV SPRING_PROFILES_ACTIVE=production

# Run the application
CMD ["java", "-jar", "app.jar"]
