# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application (this builds the fat jar using maven-shade-plugin)
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the generated fat jar from the build stage
COPY --from=build /app/target/backend-1.0.0-SNAPSHOT.jar app.jar

# Expose the port the app runs on (defaults to 8080 in Vert.x unless overridden)
EXPOSE 8080

# Command to run the application
CMD ["java", "-jar", "app.jar"]
