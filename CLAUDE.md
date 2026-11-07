# 프로젝트: 막차별

## 한 줄 정의
막차를 기다리는 밤, 걱정 하나를 별에 맡기고 가는 정류장

## 컨셉 요약
- 세계관: 밤 버스 정류장. 버스는 오지 않아도 괜찮은 곳
- 핵심 의식: 걱정 한 줄 → 별이 되어 하늘에 떠오름. 원문은 브라우저 밖으로 나가지 않음
- 재방문 장치: 교통카드 "삑" 찍기 = 오늘도 버텼다 도장. 모이면 별자리(Should)
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
- 장면/로직 분리: 그리는 코드는 `frontend/src/scenes/`에만(장면 전용 CSS도 `scenes/Stop.css`처럼 옆에), 의식 로직(밤 날짜, 익명 ID, 위기 키워드, API 호출, scene 상태)은 `scenes/` 밖에. 장면 컴포넌트는 props를 받아 그리고 콜백으로 알리기만 함. 출시 뒤 장면을 3D(React Three Fiber)로 통째로 갈아끼우기 위한 경계 (docs/tech-design.md 8장)
- 예외: 모든 장면에 걸리는 공통 UI(푸터, 위기 안내 카드)는 `scenes/` 밖(`App.jsx`·`components/`)에 두고 3D에서도 HTML로 유지함. 캔버스 안에는 DOM이 없어서 스크린리더·글자 크기 조절이 안 먹음
- 비용: 월 고정비 0~1만원 안에서 운영 가능한 스택

## 기술 스택 (2026-11-07 확정)
- 프론트: React 19 + Vite (JavaScript), 정적 호스팅. 린트 oxlint, 포맷 Prettier
- 백엔드: Spring Boot 3.5 + Java 21 + Gradle. 기능별 패키지(star, cardtap, crisis, common, config)
- DB: PostgreSQL (배포: Neon 무료), 로컬은 H2 메모리 DB(PostgreSQL 모드)
- 배포: 프론트 정적 호스팅(Vercel 또는 Cloudflare Pages), 백엔드 Render 무료 → 후원이 모이면 상시 가동 인스턴스로
- 서버가 잠들어 있어도(Render 무료) 장면과 의식은 서버 응답을 기다리지 않게 만든다

## 참고 문서
- docs/prd.md: 기능, 수용 기준(Given/When/Then), 비목표. 원본은 Claude 문서이며 이 파일은 개발용 사본
- docs/screen-design.md: 화면 흐름, 카피, 애니메이션 시간, 팔레트, 접근성
- docs/tech-design.md: ERD, API 명세, 보안, 폴더 구조, 환경변수, 티켓(T01~T16)과 완료 조건, 출시 뒤 3D 전환 계획(8장)
- 작업 전에 관련 문서를 읽고, 설계와 코드가 어긋나면 고치기 전에 먼저 알려줌

## 작업 방식
- 한 번에 한 기능(티켓 하나). 작업 전에 계획(수정할 파일, 이유)을 보여주고 승인 후 코드 작성
- 코드 변경 후 내가 확인할 방법(실행 명령, 확인할 화면)을 알려줌
- 커밋 메시지는 Conventional Commits 형식, 본문은 한국어
- 각 작업 끝에 docs/devlog.md에 무엇을 왜 했는지 3줄 기록

## 실행 명령
- 프론트: `cd frontend && npm install && npm run dev` (http://localhost:5173)
- 프론트 점검: `npm run lint`, `npm run format:check`, `npm run build`
- 백엔드: `cd backend && ./gradlew bootRun` (Windows: `gradlew.bat bootRun`), 확인 http://localhost:8080/api/health
- 백엔드 테스트: `./gradlew test`
