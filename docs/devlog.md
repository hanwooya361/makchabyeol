# 개발 일지

각 작업 끝에 무엇을 왜 했는지 3줄로 남겨요. 최신 항목이 위로 와요.

## 2026-11-07 · T02 정류장 장면(S1)

- S1을 `scenes/Stop.jsx` + `styles/stop.css`로 만듦. 지붕·벤치·가로등은 인라인 SVG 하나로 그리고 통째로 `aria-hidden`, 읽어야 하는 글자(전광판·단말기 안내·하늘 보기)는 HTML로 올림. 대비·글자 크기 조절·스크린리더가 그냥 따라오고, SVG에 글자를 넣었을 때 생기는 문제를 피함
- 지붕/벤치/가로등을 컴포넌트로 쪼개지 않음(재사용할 데가 없음). ∞ 깜빡임은 CSS `@keyframes`라 JS·상태·타이머가 없고, 모션 줄이기는 global.css 규칙이 이미 멈춰 줌
- 폰트(Pretendard·고운바탕)를 CDN으로 넣고 `docs/credits.md`에 출처·라이선스를 적음. 헤드리스 브라우저로 360×780 / 360×560 / 480×780에서 오버플로 0 확인. 남은 404는 아직 없는 favicon 하나(T15)

## 2026-11-07 · git 초기화 + 백엔드 빌드 첫 확인

- git 저장소를 만들고 지금까지의 뼈대(문서·프론트·백엔드)를 첫 커밋으로 남김. `.claude/settings.local.json`은 로컬 전용이라 .gitignore에 추가함
- `gradlew.bat test`가 "Cannot find a Java installation ... languageVersion=21"로 실패함. 로컬에 JDK 17만 설치돼 있었음
- JDK를 수동 설치하는 대신 settings.gradle에 foojay-resolver-convention(3줄)을 넣어 Gradle이 JDK 21을 자동으로 내려받게 함. Java 21 설계를 그대로 두고 테스트 통과 확인(BUILD SUCCESSFUL)
- `bootRun`도 띄워서 `/api/health`가 200 `{"status":"UP"}`, H2 메모리 DB 연결까지 확인함(기동 4.1초, 경고·에러 없음). T01 완료 조건 충족

## 2026-11-07 · 기획·설계·T01 프로젝트 뼈대

- 컨셉을 "막차 정류장 + 별에 걱정 맡기기 + 교통카드 도장"으로 확정하고 PRD·화면 설계·기술 설계를 docs/에 정리함. 리뷰로 Must를 4개로 줄이고 위기 안내 집계·마들랜 링크를 추가함
- 스택은 백엔드 포트폴리오 가치 때문에 Spring Boot + React + PostgreSQL로 정함. Render 무료 서버가 잠드는 문제는 "장면과 의식이 서버를 기다리지 않는" 설계로 피함
- 프론트(Vite, oxlint, Prettier)는 빈 화면까지 빌드 확인함. 백엔드는 작업 환경에서 Maven 저장소에 접근할 수 없어 빌드를 못 돌렸으니, 로컬에서 `gradlew.bat test`와 `bootRun`으로 첫 확인 필요
