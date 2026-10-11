FROM eclipse-temurin:25-jre

WORKDIR /app

# Install curl for healthcheck probe
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user and group
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/bash -m appuser && \
    mkdir -p /app/logs && \
    chown -R appuser:appgroup /app

# Copy pre-built packaged JAR from target directory
COPY target/*.jar /app/app.jar
RUN chown appuser:appgroup /app/app.jar

# Switch to non-root user
USER appuser:appgroup

# Expose backend application port
EXPOSE 8080

# Default JVM container flags and entrypoint
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE="prod"

# Healthcheck probe using Spring Boot Actuator
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
