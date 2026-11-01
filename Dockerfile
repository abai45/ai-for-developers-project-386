# syntax=docker/dockerfile:1
# Календарь звонков: один образ, один порт (PORT).
# Фронтенд собирается Vite и укладывается в джар как статика (classpath:/static).

# 1. Сборка фронтенда
FROM node:22-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# 2. Сборка бэкенда: openapi.json (контракт) + dist (статика) → исполняемый джар
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /src
COPY backend/pom.xml backend/pom.xml
COPY backend/.mvn backend/.mvn
RUN mvn -B -q -f backend/pom.xml dependency:go-offline
COPY docs/openapi.json docs/openapi.json
COPY backend backend
COPY --from=frontend-build /build/dist backend/src/main/resources/static
RUN mvn -B -q -f backend/pom.xml package -DskipTests

# 3. Рантайм: только JRE и джар; порт и запуск — из PORT (дефолт 8080)
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=backend-build /src/backend/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
