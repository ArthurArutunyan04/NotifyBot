#First stage
FROM maven:3.8.6-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

#Second stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/task-service.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]