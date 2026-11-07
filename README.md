# 막차별

막차를 기다리는 밤, 걱정 하나를 별에 맡기고 가는 정류장.

로그인 없이 들어와 교통카드를 찍고(오늘도 버텼다 도장), 걱정 한 줄을 별로 띄우는 작은 위로 웹사이트예요. 걱정 원문은 서버로 보내지 않아요.

## 구성

| 폴더 | 내용 |
| --- | --- |
| `frontend/` | React + Vite. 정류장·하늘 장면과 의식 |
| `backend/` | Spring Boot 3.5 + Java 21. 별·카드 찍기·위기 안내 집계 API |
| `docs/` | PRD, 화면 설계, 기술 설계, 개발 일지 |

## 로컬 실행

필요한 것: Node.js 20 이상, JDK 21

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

http://localhost:5173 에서 "막차까지 ∞분" 화면이 보이면 성공이에요.

### 백엔드

```bash
cd backend
./gradlew bootRun        # Windows: gradlew.bat bootRun
```

http://localhost:8080/api/health 에서 `{"status":"UP"}`가 보이면 성공이에요. 로컬에서는 H2 메모리 DB를 쓰기 때문에 따로 설치할 DB가 없어요.

테스트: `./gradlew test`

## 환경변수

`.env.example`을 참고하세요. 프론트 변수는 `frontend/.env.local`에, 백엔드 변수는 실행 환경(IDE 실행 설정 또는 배포 플랫폼)에 넣어요. 실제 값이 든 파일은 커밋하지 않아요.

## 도움이 필요하다면

자살예방상담전화 109 (24시간, 무료)
