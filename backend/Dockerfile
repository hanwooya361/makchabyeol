# Render는 Java를 직접 돌리지 않아서 Docker로 올린다. 빌드는 JDK, 실행은 더 가벼운 JRE 이미지로
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
# 테스트는 CI에서 이미 통과한 커밋만 여기까지 온다(Render: After CI Checks Pass)
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/app.jar app.jar
# Render 무료 인스턴스는 메모리 512MB. 힙을 75%로 묶고 GC는 가장 가벼운 것으로
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
