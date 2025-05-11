# First stage
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Second stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/telegram-bot.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]