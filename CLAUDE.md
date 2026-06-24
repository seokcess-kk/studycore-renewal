<!--
이 파일은 점진적으로 개선됩니다.
클로드가 실수하거나 의도와 다른 결과를 낼 때마다,
해당 케이스를 방지하는 규칙을 한 줄씩 추가해 주세요.
예: "API 응답 타입을 변경할 때 프론트엔드 타입도 반드시 함께 수정할 것"
-->
<!-- 팀 공유 학습 시스템 -->
<!-- 이 파일은 Git으로 관리됩니다. 규칙 추가/수정 시 PR을 통해 팀원 리뷰를 받아주세요. -->

# StudyCore Web

## 개요
관리형 학습공간 홈페이지. 공개 랜딩 + 재원생 서비스(공지·질문방·도시락) + 어드민 패널.

## 기술 스택
Next.js 16 (App Router, TS strict, webpack 빌드) · Tailwind v4 + @tailwindcss/typography + shadcn/ui · Supabase (PG + Auth + Storage + Edge Functions) · Zustand (sessionStorage persist) · react-hook-form + zod v4 · Tiptap · Framer Motion · @dnd-kit(정렬) · xlsx(엑셀) · isomorphic-dompurify(sanitize) · next-pwa · Playwright E2E · Vercel 배포. Path alias: `@/*` → `./src/*`

## 빌드 & 실행
```bash
npm install            # 의존성 설치
npm run dev            # localhost:3000 (webpack)
npm run build          # 프로덕션 빌드
npm run lint           # ESLint
npx tsc --noEmit       # 타입 체크
npx playwright test              # E2E 전체 실행 (dev 서버 실행 필수)
npx playwright test --ui         # UI 디버깅 모드 (= npm run test:e2e:ui)
npx playwright test --project=public   # 공개 페이지만
npx playwright test --project=auth     # 인증/권한만
npx playwright test --project=admin    # 어드민만
npx playwright test --project=member   # 재원생만
```

## 디렉터리 구조
```
src/app/(public)/      공개 페이지 (홈, 블로그, 상담, 소개, 후기)
src/app/(member)/      재원생 전용 (공지, 질문방, 도시락) + src/app/my/
src/app/admin/         어드민 (admin/mentor 권한)
src/app/api/           Route Handlers (auth/staff-login, admin/create-staff, consult, notify)
src/domains/           DDD 3파일 패턴 — 상세: src/domains/CLAUDE.md
src/components/        UI 컴포넌트 — 브랜드/패턴: src/components/CLAUDE.md
e2e/                   E2E 테스트 (Playwright) — helpers, fixtures, tests/{public,auth,admin,member}
src/stores/            Zustand 스토어
src/hooks/             커스텀 훅
src/lib/supabase/      Supabase 클라이언트 (server.ts, client.ts)
```

## 도메인 용어
| 용어 | 의미 | 혼동 주의 |
|------|------|----------|
| Consultation (상담 신청) | 외부 방문자의 입소/견학 문의. status: `new→contacted→done` | Counseling과 **별개** 도메인 |
| Counseling (상담 기록) | 스태프↔재원생 상담 내역 기록. types: admission/career/etc | Consultation과 혼동 금지 |
| 재원생 (student) | 등록된 학생. 계정 상태: `pending→active→inactive` | User(시스템 사용자)와 구분 |
| 스태프 | admin · mentor · assistant 통칭. `isStaffRole()`로 판별 | |
| Notice | 공지사항. visibility: `public`(전체 공개) vs `members_only`(회원 공개) | 비로그인은 public만 조회 |
| MealPeriod | 도시락 신청 기간. selection: `weekday`(요일) vs `date`(날짜) | |
| Question | 재원생 Q&A. status: `pending→answered` | |

## 코딩 규칙

### 절대 금지 — 위반 발견 시 즉시 수정
1. `rounded-*` 클래스 → border-radius 항상 0 (globals.css override)
2. `shadow-*` 클래스 → box-shadow 불가
3. `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출
4. Next.js Route에서 알림톡/SMS 직접 호출 → Supabase Edge Function 경유 필수
5. 컴포넌트에서 직접 DB 쿼리 → `src/domains/[도메인]/repository.ts` 경유 필수
6. 로그아웃 시 `router.push()` → `window.location.href = "/"` 사용 (전체 리로드)
7. `SIGNED_OUT`에서 `setUser`/`setProfile` 개별 호출 → `logout()` 한 번 호출
8. 도메인 repository→repository 직접 호출 → service→service만 허용
9. `cn()`/`twMerge`에 커스텀 `text-*` 색상과 `text-*` 폰트 크기를 함께 전달 → twMerge가 동일 그룹으로 인식하여 하나를 삭제함. Button 컴포넌트처럼 내부 클래스는 문자열 결합 사용

### 필수 패턴
- 모든 폼: react-hook-form + zod
- Server Component / Route Handler → `createClient()` (lib/supabase/server.ts)
- Client Component → `createClient()` 또는 별칭 `createBrowserClient()` (lib/supabase/client.ts)
- RLS 우회 → `createAdminClient()` (lib/supabase/server.ts)
- 권한 검사 → middleware.ts
- 클릭 가능 요소 → `cursor-pointer` 필수
- hover 상태 → `transition-colors duration-200` 이상
- 폰트 사이즈 → `text-label`~`text-subhead` / `text-fluid-*` 토큰 사용 (`text-[Npx]` 금지)
- 섹션 패딩 → `section-sm`/`section-md`/`section-lg` 사용
- 페이지 본문 → `page-body` 사용 (`pt-24 pb-20` 금지)
- 컨테이너 너비 → Tailwind `max-w-md`/`max-w-3xl`/`max-w-4xl`/`max-w-6xl` + `mx-auto` 사용
- line-height → `leading-heading`/`leading-ui`/`leading-prose` 사용 (`leading-[N]` 금지)
- letter-spacing → `tracking-heading`/`tracking-cta`/`tracking-label` 사용 (`tracking-[Nem]` 금지)

### 인증
- 재원생: 카카오 OAuth → `/auth/callback` → `/register`
- 스태프: username → 이메일(`@studycore.internal`) 조회 → `signInWithPassword` → `verify_staff_password` RPC
- 잠금: 5회 실패 → 15분 (`login_attempts`)
- 로그아웃: `signOut()` → `logout()` → `window.location.href = "/"`

### 권한
| 역할 | 접근 | 체크 함수 | 비고 |
|------|------|----------|------|
| student | 공개 + 재원생 페이지 | `isStudent()` | status=active 필수 |
| assistant | + /admin/guide 만 | `isStaffRole()` | 사이드바에 "조교 온보딩"만 표시 |
| mentor | + /admin/* 전체 | `hasAdminAccess()` | admin과 동일 권한 |
| admin | /admin/* 전체 | `hasAdminAccess()` | mentor와 동일 권한 |

**권한 레이어 (3단계)**:
1. **middleware.ts** — 서버 사이드 라우트 보호 (SSoT)
   - `PROTECTED_ROUTES`: 로그인 필수 (`/guide`, `/questions`, `/meal`, `/my`, `/reviews/write`)
   - `/notices`는 비로그인 접근 허용 (visibility='public' 게시글만 표시)
   - `/manual`은 비로그인 접근 허용 (type='manual' + is_visible=true 섹션만 표시, 스태프는 ?tab=onboarding 추가 노출)
   - `ADMIN_ROUTES`: admin/mentor 필수 (`/admin`)
   - `ASSISTANT_ROUTES`: staff 필수 (`/admin/guide`)
   - 재원생 전용 라우트: `/meal`, `/reviews/write`, `/questions/new` — 스태프 접근 차단
   - 스태프 전용 라우트: `/guide` — 학생 접근 차단 (스태프는 `/manual?tab=onboarding`으로 리다이렉트)
   - `/manual` 페이지에서 스태프 전용 온보딩 탭 제공 (`?tab=onboarding`), 학생에게는 탭 미노출
   - student status 체크 (pending→안내, inactive→안내)
2. **admin/layout.tsx** — 클라이언트 사이드 이중 체크
   - `/admin/guide`: `isStaff` 체크 (assistant 허용)
   - 그 외 `/admin/*`: `canAccessAdmin` 체크 (admin+mentor만)
3. **AdminSidebar.tsx** — 역할별 메뉴 필터링
   - assistant: `assistantVisible: true`인 메뉴만 표시
   - admin/mentor: 전체 메뉴 표시

**질문 관리 권한**: 질문 답변/고정/답변 삭제는 `canAccessAdmin`(admin+mentor)만 가능. assistant는 불가. 마지막 답변 삭제 시 질문 상태가 `pending`으로 자동 복원.

### 상태 관리
- `useUserStore` (Zustand + sessionStorage persist). `isLoading`은 persist 제외
- `AuthInitializer`: 검증만 수행. persist↔Supabase 불일치 시만 DB 재조회

### 알림 흐름 (모두 Edge Function 경유)
클라이언트는 식별자(questionId/noticeId)만 `/api/notify`에 전송 → 서버가 권한 검사·수신자·본문을 DB로 재계산 후 Edge Function 호출 (상담 신청만 `/api/consult` 경유). 클라이언트에서 메시지 본문·수신자 직접 전송 금지.
```
상담 신청 → /api/consult → notify-consult     → 관리자 알림톡 + 신청자 SMS
재원생 질문 → /api/notify → notify-question   → 멘토 알림톡
멘토 답변 → /api/notify → notify-answer       → 재원생 알림톡 (active만)
공지 발행 → /api/notify → send-kakao-alimtalk → 재원생/학부모
```

## 코드 리뷰 (구현 직후 자동 수행 — 최우선 규칙)

**코드를 구현하거나 수정한 직후, 사용자에게 결과를 보여주기 전에** 아래 프로세스를 수행한다.
- ⚠️ 사용자가 리뷰를 요청할 때까지 기다리지 말 것 — 구현 완료 즉시 자동 수행
- ⚠️ 리뷰 없이 "완료했습니다"라고 보고하는 것은 금지

### 프로세스
1. 코드 구현/수정 완료
2. 수정한 모든 파일을 다시 읽고 아래 체크 항목 전체 점검
3. 수정사항이 있으면 반영 후 다시 리뷰 (수정사항 0개가 될 때까지 반복)
4. 리뷰 종료 → 사용자에게 결과 보고
5. (커밋은 사용자 요청 시에만)

### A. 요구사항 충족 검증 (가장 먼저 수행)
- 사용자의 요청사항을 하나씩 나열하고, 각각 반영 여부를 대조
- 이번 작업으로 이전에 완료한 변경이 되돌려지거나 누락되지 않았는지 확인
- 여러 파일에 걸친 작업일 경우, 모든 파일에서 요구사항이 일관되게 적용됐는지 확인

### B. 프로젝트 전체 영향도 검증
- 공통 컴포넌트·유틸·타입을 수정했다면, 해당 모듈을 import하는 **모든 사용처**를 Grep으로 찾아 호환성 확인
- props 변경·삭제 시 사용처에서 빌드 에러나 런타임 오류가 없는지 확인
- 도메인 서비스/repository 수정 시 해당 도메인을 호출하는 페이지·컴포넌트의 동작 맥락이 어긋나지 않는지 확인
- 스타일 변경 시 동일 클래스를 공유하는 다른 화면에 의도치 않은 영향이 없는지 확인

### C. 코드 품질 체크
- 미사용 import / 변수
- import 순서 (외부 라이브러리 → 내부 모듈 → 상대경로)
- 모바일 레이아웃 깨짐 (padding/margin 변경 시)
- 레이아웃 시프트 (hover 시 크기 변경)
- 애니메이션 상태 관리 (`undefined` target, 순환 로직)
- CLAUDE.md 프로젝트 규칙 위반 (rounded, shadow, 서버/클라이언트 컴포넌트, DDD 패턴 등)
- 변경 대상과 동일 패턴이 다른 파일에도 있는지 (누락 방지)
- 기존 코드와의 일관성

## 검증 규칙 (Self-Verification)
코드 변경 후 아래를 순서대로 수행. **에러 0개가 될 때까지 반복**한다. 1회 통과로 끝내지 말 것.

| 단계 | 명령어 | 실패 시 대응 |
|------|--------|-------------|
| 1. 타입 체크 | `npx tsc --noEmit` | 에러 파일:줄 확인 → 타입 수정 → **1단계 재실행**. import 경로 오타, 누락된 props가 80% |
| 2. 빌드 | `npm run build` | 터미널 에러 메시지의 파일:줄 확인 → 수정 → **2단계 재실행**. Server/Client 혼용이 가장 흔함 |
| 3. 린트 | `npm run lint` | `--fix`로 자동 수정 가능한 것 먼저 처리, 나머지 수동 수정 → **3단계 재실행** |
| 4. UI 확인 | `npm run dev` | 변경한 페이지 경로 + 확인할 동작을 체크리스트로 제시 (아래 예시) |

**핵심: 각 단계에서 에러가 발견되면 수정 후 해당 단계를 다시 실행한다. 에러 0개가 확인될 때까지 다음 단계로 넘어가지 않는다.**

**UI 변경 시**: `.claude/skills/ui-ux-pro-max/SKILL.md` 스킬을 활용하여 기획·디자인 검토 수행.

**UI 확인 체크리스트 예시** (UI 변경 시 반드시 이 형식으로 제시):
```
확인 페이지: http://localhost:3000/admin/meal
- [ ] 테이블 렌더링 정상
- [ ] 필터 클릭 시 데이터 갱신
- [ ] 모바일 뷰포트(375px)에서 레이아웃 깨짐 없음
```

추가 규칙:
- Supabase 스키마 변경 시 `supabase/migrations/`에 SQL 파일 추가
- 새 도메인 추가 시 `src/domains/CLAUDE.md`의 도메인 테이블도 업데이트
- 에러를 사용자에게 보고만 하지 말 것. 원인 분석 → 수정 → 재검증까지 완료

## Phase 진행 규칙
새 Phase → `dev/active/phase{N}-{name}/` 에 3개 파일 생성:
```
phase{N}-{name}-context.md  ← 결정 이력, 제약 사항
phase{N}-{name}-plan.md     ← 설계, 기술 결정
phase{N}-{name}-tasks.md    ← 작업 목록, 완료 기록
```

## 참조 문서
- `dev/active/PROJECT-STATUS.md` — 프로젝트 진행 현황
- `docs/plans/` — Phase별 계획 문서
- `.claude/skills/ui-ux-pro-max/SKILL.md` — UI/UX 기획·디자인 검토 스킬
- `src/components/CLAUDE.md` — UI/브랜드 패턴 (컬러, 타이포, 모달, CTA)
- `src/domains/CLAUDE.md` — DDD 3파일 패턴 + 도메인 목록
- `src/app/admin/CLAUDE.md` — 어드민 전용 규칙

## 유지보수
- **기능 추가/변경 후**: "CLAUDE.md에 이번 변경사항 반영할 게 있는지 확인해줘"
- **월 1회 정기 점검**: "CLAUDE.md 전체를 리뷰해줘. 코드베이스와 맞지 않는 규칙, 빠진 규칙, 중복 찾아줘"
- **같은 실수 2회 반복 시**: 해당 실수를 방지하는 규칙을 즉시 추가

## E2E 테스트

### 구조
```
e2e/
  fixtures/       auth.fixture.ts, test-data.fixture.ts
  helpers/        login.helper.ts, navigation.helper.ts, supabase.helper.ts
  global-setup.ts    계정 잠금 해제 → storageState 저장 (admin/mentor/assistant)
  global-teardown.ts 테스트 데이터 정리
  tests/
    public/       홈, 네비게이션, 상담 신청 (인증 불필요)
    auth/         스태프 로그인, 라우트 보호, 역할별 권한
    admin/        대시보드, 공지 CRUD, 질문 관리 (admin storageState)
    member/       공지, 질문, 마이페이지 (mentor storageState)
```

### 환경 설정
- `.env.local`: Supabase URL/Key (dev 서버용)
- `.env.test`: 테스트 계정 (TEST_ADMIN_*, TEST_MENTOR_*, TEST_ASSISTANT_*)
- `#` 포함 비밀번호는 `.env.test`에서 반드시 따옴표로 감싸기
- `e2e/.auth/`: storageState 파일 (gitignore됨, globalSetup에서 자동 생성)

### 실행 주의
- **dev 서버 먼저 실행** (`npm run dev`) → `npx playwright test`
- globalSetup에서 `unlock_account` RPC로 잠금 해제 후 로그인 (5회 실패 잠금 방지)
- CI에서는 webServer가 자동으로 빌드+서버 시작

## 변경 이력
<!-- 형식: YYYY-MM-DD: 변경 내용 (사유) -->
- 2026-06-24: 광고 랜딩페이지 동적 관리 — landing_pages 테이블 + landing 도메인(Space 패턴) + 어드민 CRUD(/admin/landings, HTML 파일 업로드) + `/landing/[slug]` Route Handler 서빙(`__LP_DATA__` 주입으로 slug→consultations.source 연결)
- 2026-06-24: 광고 랜딩 리드 수집 — consultations에 source/utm/marketing_consent 컬럼(마이그레이션 056), /api/webhook/lead 신규(랜딩 payload→submitConsultation 재사용), 어드민 상담관리 유입 컬럼/필터/utm 상세
- 2026-05-04: 재원생 매뉴얼(/manual) 비로그인 공개 — PROTECTED_ROUTES에서 /manual 제거, RLS public_read_manual 정책 추가(type='manual' + is_visible=true), Nav/MobileMenu 비로그인 메뉴에 매뉴얼 링크 추가
- 2026-03-31: 공지사항 공개/회원 공개 구분 — notices.visibility 컬럼(public/members_only), /notices 비로그인 접근 허용, 어드민 다중 선택 일괄 공개 범위 변경, Nav/MobileMenu 비로그인 공지사항 링크 추가
- 2026-03-31: Button 컴포넌트 텍스트 색상 수정 — cn()/twMerge의 text-* 색상·크기 충돌으로 ghost/primary/secondary variant 색상 누락. 내부 클래스 문자열 결합으로 전환 (16곳 자동 수정)
- 2026-03-27: @tailwindcss/typography 플러그인 추가 — prose 클래스 미작동으로 Tiptap HTML 콘텐츠(공지·가이드·블로그)에서 줄바꿈이 표시되지 않던 문제 수정
- 2026-03-25: Footer 하단 여백 — layout.tsx의 div#main-content에 `flex flex-col flex-1` 추가하여 flex 체인 연결
- 2026-03-25: 디자인 토큰 전체 일괄 교체 — text-sm/xs/xl/lg → text-body/caption/fluid-h2/subhead (46개 파일, shadcn·Tiptap prose 제외)
- 2026-03-25: MetaAttachmentList에 onSelect prop 추가 — 이미지 클릭 시 모달 오픈 일관성 확보 (6개 사용처 적용)
- 2026-03-25: 어드민 UX 개선 — /admin/guide 아코디언 목록+분리 편집 페이지, /admin/questions/[id] 질문 접기+답변 아코디언, /admin/notices/new 팝업·알림톡 접기/펼치기
- 2026-03-25: GuideSectionForm 공통 컴포넌트 추출 — 가이드 추가/수정 폼 공유 (RichTextEditor+FileAttachmentManager 통합)
- 2026-03-25: AdminSidebar 메뉴 그룹핑 — 12개 flat list → 5개 그룹(대시보드, 관리, 콘텐츠, 홈페이지, 운영) 구조화
- 2026-03-25: 공간 소개 어드민 동적 관리 — spaces 테이블 + space-images Storage + DDD 3파일(space 도메인) + 어드민 CRUD(/admin/spaces) + SpaceSlider 동적 데이터 전환
- 2026-03-25: E2E 테스트 인프라 구축 — Playwright 4개 프로젝트(public/auth/admin/member), globalSetup 계정 잠금 해제+storageState, 38개 테스트 케이스
- 2026-03-24: 질문/답변 첨부파일 메타데이터 전환 — image_urls TEXT[] → attachments JSONB (원본 파일명 보존), ImageUploader에 onFileUploaded 콜백 추가, MetaAttachmentList로 표시 통일
- 2026-03-24: 첨부파일 다운로드 시 원본 파일명 유지 — downloadWithName blob fetch 방식 도입
- 2026-03-24: 답변 삭제 기능 UI 추가 — 재원생 상세(canAccessAdmin 조건부) + 어드민 상세/스태프 카드(항상 표시)
- 2026-03-24: 첨부파일 컴팩트 UI 통일 — AttachmentList/MetaAttachmentList 공통 컴포넌트 추출, 이미지 64px 썸네일 + 파일 한 줄 리스트 (질문방·공지·프로그램·팝업 전체 적용)
- 2026-03-24: 첨부파일 PDF 지원 + 프로그램 첨부파일 + 팝업 공지 첨부표시 + 감사 이슈 일괄 수정 (외부 브랜드 컬러 토큰화, text-[Npx] 토큰 교체, 접근성 aria-live/aria-label 보강, FAQ 애니메이션 CSS grid-rows 전환)
- 2026-03-24: 매뉴얼/온보딩 Nav 통합 — `/manual` 페이지 내 스태프 전용 탭으로 변경, `/guide`→리다이렉트, Nav에서 온보딩·조교 관리 링크 제거
- 2026-03-23: 전체 권한 검토 — 재원생/스태프 전용 라우트 분리, assistant 권한 제한, 질문 답변/고정 canAccessAdmin 적용
- 2026-03-19: CLAUDE.md 재설계 — 모듈 분리, 검증 루프 추가, 도메인 용어 정의, 중복 제거
