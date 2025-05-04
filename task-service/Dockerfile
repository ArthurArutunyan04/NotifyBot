FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app
COPY target/task-service-*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
