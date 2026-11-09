# 개발 일지

각 작업 끝에 무엇을 왜 했는지 3줄로 남겨요. 최신 항목이 위로 와요.
## 2026-11-09 · T15 공유·법적 페이지

- 처리방침(S6)은 앱 안 팝업이 아니라 별도 `privacy.html`(Vite 멀티 페이지, JS 없음)로 — 주소로 바로 열리고 크롤러도 읽는다. 맨 위 "저장하는 것" 표는 코드에서 확인한 사실만(localStorage 키 2개, 서버 테이블 3개, IP는 메모리 1분). 위탁·국외 이전(Cloudflare·Render·Neon), 보호책임자 연락처까지 넣은 초안이고 법적 검토는 T16
- 처리방침에 보관 기간을 적으려면 실제로 지워야 해서 `RetentionJob`을 추가: 별·카드 기록을 밤 날짜 90일 지나면 삭제. Render 무료 서버는 자다 깨므로 시각 예약 대신 기동 직후 + 6시간마다. 위기 횟수는 ID가 없어 남김
- OG 메타태그 + 1200×630 이미지(정류장 SVG와 전광판을 헤드리스로 캡처), favicon. og:image는 전체 주소가 필요해 `VITE_SITE_URL`을 빌드 때 넣음(비면 자리표시자가 그대로 남으니 GitHub Variables 필수). 캡처하다 가로등 빛이 SVG 틀에서 네모나게 잘리는 걸 발견 — 앱 정류장에도 같은 현상이 있어 따로 고칠 거리로 남김
## 2026-11-09 · T14 배포 + CI (설정 파일까지)

- 프론트 호스팅은 Cloudflare Workers 정적 자산으로 확정(Vercel Hobby는 비상업 제한이라 나중 후원 링크와 부딪힘, Cloudflare는 새 프로젝트에 Pages 대신 Workers를 권함). main 푸시 → Actions가 프론트·백엔드를 검사하고, 통과한 바로 그 빌드를 `wrangler deploy`로 올림. 백엔드는 Render "After CI Checks Pass"라 배포 훅·비밀값이 필요 없음
- Render는 Java를 직접 안 돌려서 `backend/Dockerfile`(JDK로 빌드, JRE로 실행, 512MB에 맞춰 힙 75%·SerialGC). Postgres 17 컨테이너 + `--memory=512m`로 띄워 기동 5.6초·메모리 253MB, 마이그레이션·별·카드·위기 API·CORS 확인. `gradlew` 실행 권한(100644→755)과 LF 고정(.gitattributes)도 같이 — 안 하면 리눅스에서 실행이 안 됨
- 그러다 T11에서 넣은 `server:` 블록이 `spring:` 한가운데 들어가 `jpa` 설정(open-in-view·ddl-auto validate)이 `server:` 밑으로 빠져 무시되고 있던 걸 로그 경고로 발견해 고침. 그동안 테스트는 H2 기본값(create-drop)으로 돌았던 셈 — validate로 다시 24개 통과. 계정이 필요한 실제 배포(Neon·Render·Cloudflare·GitHub)는 README "배포" 절차대로 진행
## 2026-11-09 · T13 접근성 점검

- 가장 큰 구멍은 장면 전환 때 포커스가 사라지는 것이었다(보이던 장면이 inert가 되면 포커스가 맨 앞으로 튐). 장면이 보이게 되면 그 단계의 첫 동작(단말기·입력칸·"다시 정류장으로")으로 포커스를 옮긴다. 화면 표현이라 `Stop`·`Sky` 안에서 처리하고, 첫 화면에서는 옮기지 않는다(이전 inert 값과 비교 — StrictMode 두 번 실행에도 안전)
- 대비를 투명도까지 섞어 계산하니 입력칸 예시 글자만 3.5:1로 미달 → 55%로 올려 5.5:1. 포커스 표시는 배경 10% 틴트라 밤하늘에서 안 보여서 `:focus-visible` 가로등 빛 테두리 한 줄로 통일. 위기 때 누르는 푸터 "도움받을 곳"이 22px이라 44px로
- 헤드리스에서 Tab·Enter·Esc만으로 카드 찍기 → 입력 → 맡기기 → 위기 카드 → 닫기 → 정류장 복귀를 돌려 단계마다 포커스 위치와 테두리 표시를 확인. 실제 스크린리더 청취는 T16에서
## 2026-11-09 · T12 위기 이벤트 집계

- `POST /api/v1/crisis-events`는 본문을 읽지 않고 밤 날짜만 저장해 204를 준다. 원문·방문자 ID·IP 어느 것도 서버에 남지 않고, 테스트가 `information_schema`로 컬럼이 `id, night_date, created_at` 셋뿐임을 확인한다
- 프론트는 감지 순간이 아니라 카드가 실제로 보이는 순간(별이 다 뜬 뒤)에 보낸다. 의식 도중 창을 닫아 카드를 못 본 경우가 섞이지 않게. 응답은 기다리지 않는다
- T11 인터셉터를 한 줄 더 등록해 IP당 1분 10회. 집계 화면은 만들지 않음 — Neon 콘솔에서 `SELECT night_date, count(*) FROM crisis_event GROUP BY 1`
## 2026-11-09 · T11 rate limit

- 방문자 한도(별 1분 3개·밤 20개)는 메모리가 아니라 DB `count`로 센다. 설계 때 만든 `(visitor_id, created_at)` 인덱스를 그대로 쓰고, 서버가 재시작해도 한도가 풀리지 않는다
- IP 한도(1분 10회)는 Bucket4j 대신 직접 짠 1분 고정 창(`RateLimitInterceptor`)이다. 의존성 0개, 분이 바뀌면 맵을 비워 메모리가 안 쌓인다. 대가는 분 경계 2배 버스트와 서버 1대 전제 — 여러 대가 되면 Redis로. 필터가 아닌 인터셉터라 예외가 `ApiExceptionHandler`로 가서 429도 400과 같은 `{code, message}`로 나간다
- Render 프록시 뒤에서 모두가 같은 IP로 보이지 않게 `server.forward-headers-strategy: native`를 켰다(내부망 프록시 헤더만 신뢰해 위조 불가). 실제로 진짜 IP가 들어오는지는 T14 배포에서 확인. 테스트 4개 추가, 전체 21개 통과
## 2026-11-09 · T10 카드 찍기 서버 기록

- `POST /api/v1/card-taps`는 조회 없이 바로 insert하고 유니크 제약(`visitor_id, night_date`) 위반을 "오늘은 이미 찍었다"로 번역해 200을 준다. 조회-후-저장은 쿼리가 두 번인 데다 연타하면 둘 다 통과해 500이 난다. `@Transactional`을 일부러 안 걸었다 — 바깥 트랜잭션이 있으면 제약 위반 뒤 롤백 전용이 되어 예외를 잡아도 소용이 없다
- 프론트는 응답을 보지 않는다. "삑" 문구는 기기 기록(localStorage)으로 즉시 정하고 `postCardTap()`은 뒤에서 따라간다. 헤드리스에서 피드백 353ms / 서버 응답 357ms, 새로고침 뒤 두 번째 탭이 200 firstToday:false와 "오늘은 이미 찍었어요" 확인
- 돌리는 김에 `SchemaMigrationTest`가 `count(*) == 0`으로 "테이블이 있는가"를 검사하던 걸 고쳤다. 메모리 DB를 테스트 전체가 공유하는데 클래스 이름 순으로 cardtap이 common보다 먼저 돌면서 드러났다(star는 뒤라 지금까지 우연히 통과). 개수 대신 조회가 되는지만 본다

## 2026-11-09 · T09 위기 안내

- 키워드 감지(`safety/crisis.js`)는 "소문자로 바꾸고 한글·영문·숫자만 남긴 뒤 어간 32개와 대조"하는 두 줄. 정규화를 먼저 하니 "죽 고 싶", "죽.고.싶", 줄바꿈 섞인 입력이 한 규칙으로 다 걸린다. `node --test` 11케이스 통과(평범한 걱정 5개 오탐 없음). 원문은 이 파일까지만 오고 서버로는 안 간다
- S4 위기 카드와 S5 도움받을 곳을 `components/HelpCard.jsx` **한 컴포넌트**로 만들고 `variant`로 제목·문구·연락처 개수(2개/4개)만 바꿨다. 연락처 목록이 한 곳에 모여 출시 전 번호 검토(T16)가 파일 하나로 끝난다. 네이티브 `<dialog>` + `showModal()`이라 포커스 트랩·Esc 닫기·backdrop을 직접 짜지 않았다(T13에서 다시 안 봐도 됨)
- 마들랜 링크는 문서에 없어서 추측하지 않고 공식 출처를 찾아 카카오톡 채널(`pf.kakao.com/_DAxbYG/chat`, 한국생명존중희망재단 운영)로 넣고 screen-design.md에 적었다. 헤드리스 360×640에서 푸터→S5, 위기 입력→의식 2.8초 뒤 S4, Esc 닫기, 별 유지, 오버플로 0 확인. 서버가 꺼져 있어도(ERR_CONNECTION_REFUSED) 카드는 그대로 떴다

## 2026-11-09 · T08 오늘 밤 별 개수(S3)

- 폴링은 `lib/useNight.js` 훅 하나로 끝냈다(30초 간격, 하늘에 올라와 있는 동안만). 장면은 숫자를 props로 받아 그리기만 한다. 첫 응답이 10초 안에 안 오면 `slow`를 올려 "오늘 밤에도 별이 뜨고 있어요."로 바꾸고, 한 번 받은 뒤 폴링이 실패하면 직전 숫자를 그대로 둔다 — 숫자가 사라지는 편이 더 불안하다
- 티켓 조건에는 개수만 있었지만 다른 사람들의 별도 같이 그렸다. 서버가 주는 좌표가 천분율이라 `left: x/10%` 한 줄이면 되고, "혼자가 아니다"가 이 장면의 목적이라 숫자만 있으면 반쪽이다. 장식이라 `aria-hidden`
- 세 상태를 실제로 확인: 별 1개 → "첫 별들 중 하나예요", 6개 → "별 6개가 떴어요" + 점 6개, 백엔드를 끄고 10초 → 점 세 개 깜빡임에서 대체 문구로 전환. 폴링은 28초 뒤 다시 물어보는 것까지 확인

## 2026-11-09 · T07 별 띄우기 의식(프론트)

- S3를 새 장면으로 만들지 않고 하늘 한 장면에 `phase`(ask → releasing → done)를 뒀다. 화면 설계상 S2와 S3는 같은 하늘이고, 장면 전환 기계(겹친 두 장면)도 그대로 둘 수 있었다. 2.8초 의식은 CSS 애니메이션 세 개(모임 0.8 + 상승 1.5 + 반짝 0.5)이고, 그 시간이 지나 phase를 바꾸는 타이머만 App이 가진다
- 걱정 원문은 `Sky`의 state에 있다가 `onRelease`로 App까지만 올라가고 끝난다. 서버로 가는 요청은 `{"visitorId": "..."}` 하나뿐인 걸 헤드리스 브라우저로 나가는 요청을 전부 받아 적어 확인함(원문 문자열 검색 0건). 저장은 기다리지 않고 쏘기만 해서, 서버가 잠들어 있어도 별은 뜬다
- `api/client.js`는 타임아웃 15초에 재시도 없음(`shortcut:` 주석). 잠든 Render가 깨는 데 1분 가까이 걸려서 한 번 더 걸어도 대개 같이 실패하고, 실패해도 사용자 손해는 "별 개수에 1이 안 더해짐"뿐이다. 익명 ID(`lib/visitor.js`)는 저장소가 막힌 브라우저에서도 그 방문에만 쓰는 ID로 굴러간다

## 2026-11-09 · T06 별 API

- `GET /api/v1/night`과 `POST /api/v1/stars`를 `star/` 패키지(엔티티·리포지토리·서비스·컨트롤러)로 만듦. 위치(0~1000)와 색조(0~359)는 서버가 정한다 — 클라이언트가 좌표를 보내면 누군가 하늘에 글자를 그릴 수 있어서. 밤 날짜는 `common/NightDate`가 프론트 `lib/night.js`와 같은 규칙으로 계산하고, 경계 4케이스를 같은 식으로 테스트함
- 하늘 조회는 10초 메모리 캐시(T08이 30초마다 폴링함). 별을 띄우면 캐시를 버려서 방금 뜬 별이 바로 보인다. 인스턴스가 여러 대가 되면 공용 캐시가 필요하다는 걸 `shortcut:` 주석으로 남김. CORS(`config/WebConfig`)도 넣음 — `app.allowed-origins` 설정만 있고 쓰는 데가 없어서, 이게 없으면 T07에서 브라우저가 API를 못 부른다
- `ddl-auto: validate`가 "missing column [posx]"로 바로 잡아 줌. 기본 네이밍 전략은 끝 글자가 대문자 하나뿐이면 `pos_x`가 아니라 `posx`로 바꾼다. 컬럼명을 직접 적어 고침. 테스트 13개 통과(H2), 실제로 띄워서 201·400·CORS 403·night 응답까지 확인

## 2026-11-09 · T05 DB 스키마

- Flyway V1으로 `star`·`card_tap`·`crisis_event`를 만들었다. 세 테이블은 외래 키로 묶지 않고 방문자 테이블도 없다(최소 수집). 제약은 DB에 박아 둠: 카드 찍기 `UNIQUE(visitor_id, night_date)`, 별 좌표 0~1000·색조 0~359 CHECK. 서비스 코드가 잊어도 DB가 막는다
- 마이그레이션 파일을 H2용·Postgres용으로 나누지 않으려고 `BIGSERIAL` 대신 `BIGINT GENERATED BY DEFAULT AS IDENTITY`, `TIMESTAMPTZ` 대신 `TIMESTAMP WITH TIME ZONE`을 썼다(둘 다 표준 문법). 설계 문서 3장에 이 치환을 적어 둠
- `ddl-auto`를 prod 전용에서 전역 `validate`로 옮겼다. H2는 기본값이 `create-drop`이라 그냥 두면 Hibernate가 Flyway가 만든 스키마를 갈아엎는다. 확인은 `gradlew.bat test`(H2, 테이블·UNIQUE·CHECK 3케이스)와 버리는 `postgres:17` 컨테이너에 `bootRun`(flyway_schema_history success=t, 제약까지 그대로). Neon 연결은 T14 배포에서

## 2026-11-09 · T04 하늘 전환(S2)

- 전환은 CSS 한 덩어리로 끝냄. 두 장면을 `.scenes` 안에 겹쳐 두고 `data-scene`에 따라 `translateY(±100%)`만 바꾼다(1.2초 ease-in-out). JS 애니메이션·라이브러리·라우팅이 없고, `App.jsx`가 가진 건 `scene` 문자열 하나와 "찍고 1초 뒤 올라간다"는 `setTimeout` 한 줄뿐
- 모션 줄이기는 global.css의 `*` 규칙이 transition을 0.01ms로 죽여서 설계의 0.4초 페이드까지 같이 사라졌음. 같은 블록 안에 `.scene`(선택자가 `*`보다 구체적이라 !important 싸움에서 이김)로 `transform: none` + `opacity 0.4s` 예외를 둬서, 이동만 빠지고 페이드는 남게 함. 헤드리스에서 두 모드 다 확인
- 화면 밖 장면은 React 19 `inert` prop 하나로 포커스·스크린리더에서 뺌(Tab이 안 보이는 "카드를 대 주세요"로 가던 문제). 그 과정에서 T02 때 남은 `.scene--stop { position: relative }`가 새 `position: absolute`를 덮어 S1이 화면 높이를 197px 못 채우던 것을 발견해 지움. 360×(420~1200) 다섯 높이에서 오버플로 0·푸터 보임

## 2026-11-07 · VS Code Gradle import가 Java 25를 잡는 문제

- VS Code가 "Can't use Java 25.0.4.1 and Gradle 8.14.3"로 import를 거부함. 범인은 설치한 JDK가 아니라 **Red Hat Java 확장에 딸려 오는 번들 JRE**(`~/.vscode/extensions/redhat.java-1.58.0-win32-x64/jre/25.0.4.1`)였음. 확장이 그걸로 Gradle 데몬을 띄우는데 Gradle 8.14.3이 Java 25를 모름. 터미널 `gradlew.bat`은 JAVA_HOME(17) 데몬 + toolchain 21로 멀쩡히 돌고 있었으므로 깨진 건 IDE 쪽 하나뿐이었음
- Gradle을 9로 올리는 선택지는 버림. toolchain이 어차피 21이라 Java 25를 데몬으로 써서 얻는 게 없고, 원인(데몬 JVM이 프로젝트 기준과 다름)도 안 고치면서 Spring Boot 플러그인 호환만 다시 봐야 함. 대신 Temurin JDK 21.0.13을 정식 설치하고(`C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot`) VS Code가 그걸 보게 함
- 설정은 **`.vscode/settings.json`(작업 영역)에만** 넣음. `JAVA_HOME`은 17 그대로 둬서 수업 프로젝트에 영향 없음. 주의: `.vscode/`는 .gitignore에 있어 이 파일은 커밋되지 않음 — 다른 PC에서 클론하면 같은 알림이 다시 뜨고, 그때 이 항목을 보고 다시 만들면 됨. `gradlew.bat test --rerun-tasks` BUILD SUCCESSFUL 확인

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
