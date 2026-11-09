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

## 배포

main에 푸시하면 GitHub Actions(`.github/workflows/ci.yml`)가 검사하고, 모두 통과해야만 배포돼요. 처음 한 번만 아래를 설정해요. 지역은 한국에서 가까운 Singapore로 맞춰요.

1. **Neon**: 프로젝트 생성(Singapore) → Connection string에서 **Pooled connection을 끈** 주소를 받아요(Flyway 마이그레이션이 풀러와 잘 안 맞음). `postgresql://사용자:비밀번호@호스트/DB?sslmode=require`를 세 값으로 나눠요
   - `DATABASE_URL` = `jdbc:postgresql://호스트/DB?sslmode=require`
   - `DATABASE_USERNAME`, `DATABASE_PASSWORD`
2. **Cloudflare**: My Profile > API Tokens > "Edit Cloudflare Workers" 템플릿으로 토큰 발급. 계정 ID는 대시보드 오른쪽 사이드바에 있어요
3. **GitHub 저장소** Settings > Secrets and variables > Actions
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
   - Variables: `VITE_API_BASE_URL` = Render 주소(4번에서 생김, 예: `https://makchabyeol-api.onrender.com`), `VITE_SITE_URL` = 프론트 주소(끝 `/` 없이). 이게 비면 링크 미리보기 이미지가 안 떠요
4. **Render**: New > Web Service > 이 저장소 → Root Directory `backend`, Language **Docker**, Region Singapore, Instance **Free**
   - Environment: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `ALLOWED_ORIGINS` = 프론트 주소(첫 배포 뒤 생기는 `https://makchabyeol.<계정>.workers.dev`)
   - Settings: Health Check Path `/api/health`, Auto-Deploy **After CI Checks Pass**
5. 프론트 주소와 백엔드 주소가 생긴 뒤 3번 Variables 두 개와 4번 `ALLOWED_ORIGINS`를 채우고, main에 한 번 더 푸시해요

확인: 프론트 주소에서 별을 띄운 뒤 개발자 도구 Network 탭에 `stars`가 201로 찍히면 끝이에요. Render 무료 서버는 15분 동안 아무도 안 오면 잠들어서, 첫 요청이 1분 가까이 걸릴 수 있어요(화면은 기다리지 않아요).

## 출시 뒤 확인 (T16)

배포해야만 볼 수 있는 것들이에요. 첫 배포 뒤 한 번 돌려요.

- [ ] GitHub Actions 첫 실행이 초록색이고, 프론트·백엔드가 둘 다 배포됨
- [ ] 15분 이상 아무도 안 온 뒤 첫 방문: 정류장이 바로 뜨고, 1분쯤 뒤 별 개수가 채워지고, Neon에서 `SELECT count(*) FROM star`가 늘어남
- [ ] 진짜 IP가 잡히는지: 한 기기에서 카드를 1분 안에 11번 찍으면 11번째가 429(개발자 도구 Network). 다른 기기는 영향 없음
- [ ] 개발자 도구 콘솔 에러 0
- [ ] 카카오톡에 주소를 붙였을 때 미리보기 카드가 뜸([카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)로 캐시 초기화)
- [ ] 스크린리더(Windows NVDA 또는 iPhone VoiceOver)로 카드 찍기 → 별 띄우기 → 도움 카드 닫기를 들어 봄
- [ ] 처리방침 법률 검토(만 14세 미만 이용자 문구 포함)와 시행일 기입
- [ ] 상담 번호·마들랜 링크를 공식 안내에서 다시 확인(2026-11-09 확인함)

## 도움이 필요하다면

자살예방상담전화 109 (24시간, 무료)
