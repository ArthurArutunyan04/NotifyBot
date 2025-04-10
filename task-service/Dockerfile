FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY target/task-service-*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]