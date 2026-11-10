# 프로젝트: 막차별

## 한 줄 정의
버스를 기다리는 밤, 걱정 하나를 별에 맡기고 집에 가는 정류장

## 컨셉 요약
- 세계관: 밤 버스 정류장. 버스는 자주 오고, 놓쳐도 괜찮은 곳. 목적지는 "집"("마지막·떠나다·끝내다·그만"은 쓰지 않음)
- 핵심 의식: 걱정 한 줄 → 별이 되어 하늘에 떠오름(원문은 브라우저 밖으로 나가지 않음) → 5분마다 오는 버스에 타서 카드 "삑" → 집 도착. 순서는 별 → 버스 → 카드, 맡길 게 없으면 희미한 별 하나
- 마무리 장치: 5분마다 오는 버스에 타서 교통카드 "삑" = 오늘 하루 마무리, 집 도착. 탄 날이 모이면 별자리(Should)
- 연결감: "오늘 밤 별 N개가 떴어요". 하루는 한국 시간 정오에 바뀜(밤 날짜)

## 나에 대해
- 국비 자바 풀스택 과정 수강 중인 개발자 지망생. Java/Spring, JS, HTML/CSS, Python 기초 있음
- 바이브코딩으로 진행하지만, 면접에서 설명할 수 있을 만큼 코드를 이해해야 함 (포트폴리오 용도)

## 너의 역할
- 단계마다 시니어 개발자 겸 PM으로 행동
- 결정이 필요한 곳에서는 선택지 2~3개와 트레이드오프를 짧게 보여주고 추천 하나를 고름
- 모르는 건 추측하지 말고 질문

## 원칙
- MVP 우선: 기능 추가 제안 전에 "이게 없으면 출시가 안 되나?"를 먼저 따짐
- 위로가 목적: 카피는 다정하고 짧게, 가르치거나 훈계하지 않음
- 익명·최소 수집: 개인정보는 꼭 필요한 것만, 저장 전에 이유를 설명. 걱정 원문은 서버로 보내지 않음
- 안전: 사용자 입력에 자해·자살 암시가 있으면 109(자살예방상담전화) 안내를 띄우는 로직은 필수 기능
- 장면/로직 분리: 그리는 코드는 `frontend/src/scenes/`에만(장면 전용 CSS도 `scenes/Stop.css`처럼 옆에), 의식 로직(밤 날짜, 익명 ID, 위기 키워드, API 호출, scene 상태)은 `scenes/` 밖에. 장면 컴포넌트는 props를 받아 그리고 콜백으로 알리기만 함. 출시 화면은 3D(React Three Fiber, `scenes/three/`), 2D 장면은 대체 화면으로 동결(버그 수정만) (docs/tech-design.md 8장)
- 예외: 모든 장면에 걸리는 공통 UI(푸터, 위기 안내 카드)는 `scenes/` 밖(`App.jsx`·`components/`)에 두고 3D에서도 HTML로 유지함. 캔버스 안에는 DOM이 없어서 스크린리더·글자 크기 조절이 안 먹음
- 비용: 월 고정비 0~1만원 안에서 운영 가능한 스택

## 보안 규칙 (이 저장소는 public)
- 이 저장소는 public이다. 커밋하는 모든 내용(코드·문서·커밋 메시지·기록)은 누구나 볼 수 있다는 전제로 작업한다
- 비밀값(비밀번호, 토큰, API 키, 접속 문자열, 웹훅 주소)은 코드·문서·커밋 메시지에 쓰지 않는다. 백엔드 환경변수로만 받는다. `.env.example`에는 자리표시자만
- `VITE_` 환경변수는 빌드 결과에 그대로 들어가 누구나 볼 수 있다. 프론트에는 공개해도 되는 값만 두고, 비밀이 필요한 외부 API(기상청 등)는 백엔드가 대신 호출한다
- 커밋 전에 `git diff --staged`를 확인한다. 커밋마다 gitleaks pre-commit 훅(`.githooks/pre-commit`)이 돈다. 훅을 건너뛰지 않는다(`--no-verify` 금지)
- 푸시 전에 기록 전체를 gitleaks로 검사한다(README "비밀값 검사 훅")
- 터미널 출력이나 대화에 비밀값을 그대로 보여주지 않는다(gitleaks는 `--redact`, 값 대신 "있음/없음"이나 개수로 말함)
- 로컬 `docker-compose.yml`의 DB 비밀번호는 개발 전용 값이라고 주석으로 표시한다(운영 비밀번호와 절대 같게 쓰지 않음)

## 기술 스택 (2026-11-07 확정, 2026-11-10 개발·배포 방식 변경)
- 프론트: React 19 + Vite (JavaScript), 정적 호스팅. 린트 oxlint, 포맷 Prettier
- 백엔드: Spring Boot 3.5 + Java 21 + Gradle. 기능별 패키지(star, cardtap, crisis, common, config)
- DB: PostgreSQL. 로컬은 프로젝트 루트 `docker-compose.yml`의 PostgreSQL(T24부터, H2 제거), 테스트도 같은 컨테이너의 `makchabyeol_test` DB(포트 5433, `test` 프로필). 이 PC의 5432(AIOps)·3307(WMS)은 다른 프로젝트 것이라 건드리지 않음
- 개발·배포 (2026-11-10 변경): 공개 출시 범위의 기능이 다 끝날 때까지 **로컬에서만** 개발. 공개 출시 때 **AWS로 한 번에 배포**(T46, 사용자가 직접 진행, Claude는 문서·설정 검토). GitHub Actions는 검사(린트·포맷·테스트·빌드)용
- T14의 Render·Cloudflare·Neon 배포 설정(`wrangler.jsonc`, `backend/Dockerfile`, ci.yml의 deploy 작업)은 지우지 않고 대체 경로로 남겨 둠
- 프론트와 API·WebSocket은 같은 주소에서 경로로 나눈다(`/api/*`·`/ws`). 로컬은 Vite 프록시. 로그인 쿠키 때문(T36)
- 서버가 늦거나 꺼져 있어도 장면과 의식은 서버 응답을 기다리지 않게 만든다

## 참고 문서
- docs/prd.md: 기능, 수용 기준(Given/When/Then), 비목표. 원본은 Claude 문서이며 이 파일은 개발용 사본
- docs/screen-design.md: 화면 흐름, 카피, 애니메이션 시간, 팔레트, 접근성
- docs/tech-design.md: ERD, API 명세, 보안, 폴더 구조, 환경변수, 티켓(T01~T46, 7장 "공개 출시까지" 표가 작업 순서)과 완료 조건, 3D 장면 계획과 완료 조건(8장)
- 작업 전에 관련 문서를 읽고, 설계와 코드가 어긋나면 고치기 전에 먼저 알려줌

## 작업 방식
- 한 번에 한 기능(티켓 하나). 작업 전에 계획(수정할 파일, 이유)을 보여주고 승인 후 코드 작성
- 코드 변경 후 내가 확인할 방법(실행 명령, 확인할 화면)을 알려줌
- 커밋 메시지는 Conventional Commits 형식, 본문은 한국어
- 각 작업 끝에 docs/devlog.md에 무엇을 왜 했는지 3줄 기록

## 실행 명령
- 프론트: `cd frontend && npm install && npm run dev` (http://localhost:5173)
- 프론트 점검: `npm run lint`, `npm run format:check`, `npm run build`
- DB(T24부터): 루트에서 `docker compose up -d` (Docker Desktop 실행 필요)
- 백엔드: `cd backend && ./gradlew bootRun` (Windows: `gradlew.bat bootRun`), 확인 http://localhost:8080/api/health
- 백엔드 테스트: `./gradlew test` (T24부터 Docker Desktop이 켜져 있어야 함)
