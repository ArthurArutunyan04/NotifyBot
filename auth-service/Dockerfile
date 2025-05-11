FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/auth-service.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]