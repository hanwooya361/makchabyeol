# 개발 일지

각 작업 끝에 무엇을 왜 했는지 3줄로 남겨요. 최신 항목이 위로 와요.

## 2026-11-07 · T03 카드 찍기(로컬)

- 밤 날짜(`lib/night.js`)는 "정오를 자정으로 12시간 당긴 뒤 날짜만 떼는" 한 줄 계산으로 만듦. `getHours` 같은 로컬 시간대 함수를 한 번도 안 써서 해외 접속에서도 한국 밤 날짜가 나옴. 테스트는 Node v24 내장 `node --test`로 돌림 — 순수 함수라 Vitest(패키지 40개)를 붙일 이유가 없었음. 정오 경계·자정 넘김·시간대·연말 6케이스 통과
- 단말기를 `<button>`으로 바꿔 탭·Enter·Space를 공짜로 얻음. 새 규칙대로 `Stop.jsx`는 `tapped`를 받아 그리고 `onCardTap()`만 부르고, "오늘 이미 찍었나" 판단은 `App.jsx`가 함. 저장(`lib/stamp.js`)은 사생활 보호 모드에서 localStorage가 예외를 던지므로 try/catch로 삼킴 — 저장이 막혀도 의식은 그대로 굴러감
- 피드백 문구를 넣자 360×560에서 푸터가 23px 잘림. 원인은 `.stage`의 `min-height: 100dvh`로, **min**이라 무대가 화면 밖으로 자라기만 하고 장면이 줄어들 이유가 없었음. `height: 100dvh`로 묶고 `.scene`에 `min-height: 0`을 주니 SVG가 비로소 줄어듦(420px 화면에서 141px). 420~1200px 다섯 높이에서 오버플로 0·푸터 보임 확인

## 2026-11-07 · 3D 전환을 Later로 못박고 장면/로직 경계를 세움

- 최종 목표는 모든 장면을 React Three Fiber로 바꾸는 것. 다만 3D를 먼저 하면 4주 일정이 깨지고 실기기 성능도 출시 전엔 알 수 없어서 MVP는 2D로 출시하기로 함. prd.md Later와 리스크 표, tech-design.md 8장(경계·2D를 남기는 이유·렌더러 선택·전환 전 확인 항목), CLAUDE.md 원칙에 나눠 적음
- 2D를 지우지 않는 이유를 조건으로 박음: WebGL 미지원, 저사양 기기, `prefers-reduced-motion`. 3D 카메라 이동은 멀미를 유발할 수 있고, 밤에 오래된 폰으로 들어오는 게 이 서비스의 주 사용 상황임. 글자는 3D에서도 HTML 오버레이로 둬서 T13 접근성 작업이 전환 뒤에도 살아남게 함
- 새 규칙으로 T02 코드를 점검함. `scenes/`에 샌 로직은 없었고(훅·fetch·storage·Date·타이머 0개), 대신 S1 전용 `styles/stop.css`가 `scenes/` 밖에 있어 `scenes/Stop.css`로 옮김. 빌드 산출물 해시가 이동 전과 동일해 동작 변화 없음을 확인. 카피 문자열 추출은 쓰는 곳이 한 군데뿐이라 지금은 미루고, 3D 티켓의 첫 작업으로 8장에 적어 둠

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
