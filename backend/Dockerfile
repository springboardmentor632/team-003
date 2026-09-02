### Multi-stage Dockerfile to build and run the Spring Boot backend
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only what is needed for a Maven build initially to leverage layer caching
COPY pom.xml mvnw* ./
COPY .mvn .mvn
COPY src src

RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
