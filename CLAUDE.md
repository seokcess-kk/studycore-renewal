# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 서비스 목적
관리형 독서실 홈페이지 (studycore-web).
학부모·학생 유입을 위한 공개 홈페이지 +
재원생 전용 서비스 (공지, 질문방, 도시락 신청) +
어드민 패널.

## 빌드 명령어
```bash
npm run dev            # 개발 서버 (localhost:3000, webpack 모드)
npm run build          # 프로덕션 빌드
npm run lint           # ESLint
npx tsc --noEmit       # TypeScript 타입 체크
npm run test:e2e       # Playwright E2E 테스트
npm run test:e2e:ui    # Playwright UI 모드
npx playwright test tests/foo.spec.ts  # 단일 E2E 테스트 실행
```

## 기술 스택
- Next.js 16 (App Router, TypeScript strict mode) — `@/*` → `./src/*` path alias
- Tailwind CSS v4 + shadcn/ui (border-radius:0 전체 적용 — shadcn 기본값 override)
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Zustand — 전역 상태 (유저 세션, 역할, 메뉴 노출 여부)
- TanStack Query v5 — 서버 상태
- react-hook-form + zod v4 — 모든 폼
- Tiptap — 리치 텍스트 에디터 (어드민 블로그/공지 작성)
- Framer Motion — 애니메이션
- Playwright — E2E 테스트 (`e2e/` 디렉토리)
- 배포: Vercel

## 아키텍처 개요

### 라우트 그룹 (3계층)
- `src/app/(public)/` — 공개 페이지 (홈, 블로그, 상담 신청, 소개, 후기 등)
- `src/app/(member)/` + `src/app/my/` — 로그인 필요 (공지, 질문방, 도시락, 마이페이지)
- `src/app/admin/` — 어드민 (admin/mentor 권한 필요)

### DDD 3파일 패턴
모든 도메인은 `src/domains/[도메인]/` 하위에 3개 파일로 구성:
```
model.ts      → 타입, Zod 스키마
repository.ts → Supabase 쿼리 (DB 접근 유일 경로)
service.ts    → 비즈니스 로직
```
도메인 (15개): user, notice, question, consultation, counseling, blog, meal, review, guide, notification, settings, popup, program, search

**도메인 간 호출 규칙**: service→service만 허용. repository→repository 직접 호출 금지.

### 인증 모델
- **재원생**: 카카오 OAuth (Supabase Auth) → `/auth/callback` → `/register`(추가 정보)
- **스태프(admin/mentor/assistant)**: 아이디 + 비밀번호
  - Supabase Auth는 이메일 기반 → username 조회 → 더미 이메일(`username@studycore.internal`) → signInWithPassword
  - 비밀번호 검증: `verify_staff_password` RPC (bcrypt, SECURITY DEFINER)
  - 계정 잠금: 5회 실패 시 15분 (`login_attempts` 테이블)

### 권한 모델
| 역할 | 접근 범위 | 코드 체크 |
|------|----------|----------|
| student | 공개 + 재원생 페이지 | `isStudent()` |
| assistant | 공개 + 재원생 + `/admin/guide` | `isStaffRole()` |
| mentor | 공개 + 재원생 + `/admin/*` | `hasAdminAccess()` |
| admin | 전체 | `hasAdminAccess()` |

계정 상태 (재원생만): pending → active → inactive
- middleware.ts에서 PROTECTED_ROUTES 접근 시 상태 체크
- pending/inactive → 안내 페이지로 리다이렉트

### 로그아웃 패턴 (3곳 통일)
```ts
const supabase = createClient();
await signOut(supabase);   // domains/user/service — Supabase 세션/쿠키 정리
logout();                  // Zustand store 완전 초기화
window.location.href = "/"; // 전체 리로드 (router.push 사용 금지 — 캐시 문제)
```

### API Routes
- `src/app/api/auth/staff-login/` — 스태프 로그인
- `src/app/api/admin/create-staff/` — 스태프 계정 생성
- `src/app/api/consult/` — 상담 신청 (Admin 클라이언트 사용)

### Supabase 클라이언트 사용 규칙
- Server Component / Route Handler → `createServerClient()` (`src/lib/supabase/server.ts`)
- Client Component → `createBrowserClient()` (`src/lib/supabase/client.ts`)
- Admin (Service Role) 클라이언트 → `createAdminClient()` (`src/lib/supabase/server.ts`) — RLS 우회 필요 시
- `createClient`와 `createBrowserClient`는 같은 함수 (별칭)

### 상태 관리
- `src/stores/useUserStore.ts` — Zustand + sessionStorage persist
  - sessionStorage: 페이지 리로드 시 즉시 복원, 탭 닫으면 삭제
  - 계산된 상태: `isStaff`, `isAdmin`, `isMentor`, `canAccessAdmin`, `isActive`
  - `isLoading`은 persist 제외 (항상 초기값 true에서 시작)
- `src/components/Providers.tsx` — `AuthInitializer`는 "검증" 역할만
  - persist된 store와 Supabase 세션 일치 여부 확인
  - 불일치 시에만 DB 재조회
  - SIGNED_OUT 시 store 초기화

### 알림 흐름
알림은 반드시 Supabase Edge Function 경유 (Next.js Route에서 직접 호출 금지):
```
상담 신청 → notify-consult → 관리자: 알림톡 / 신청자: SMS
재원생 질문 → notify-question → 멘토: 알림톡
멘토 답변 → notify-answer → 재원생: 알림톡 (active만)
공지 발행 → send-kakao-alimtalk → 재원생/학부모
```

## 홈페이지 섹션 구조
`src/app/page.tsx`에서 순서대로 렌더링:
```
HeroSection → TrustStrip → FeaturesSection → ProgramsSection
→ SpaceSlider → FAQSection → CTASection → PopupModal
```
각 섹션은 `src/components/home/`에 위치. 섹션 번호 라벨(01~05) 사용.

## 모달 패턴
프로젝트 내 모달은 다음 패턴을 따름:
- ESC 키 닫기 + 오버레이 클릭 닫기 + `document.body.style.overflow` 스크롤 방지
- Framer Motion `AnimatePresence` 사용
- `fixed inset-0 z-50` 오버레이 + `relative z-10` 모달 본체
- 기존 모달: `ConfirmModal` (확인/취소), `SearchModal` (검색), `ProgramDetailModal` (상세), `PopupModal` (프로모션)

## CTA 버튼 패턴
`globals.css`에 정의된 `cta-fill` 클래스 사용:
```html
<!-- 다크 배경: teal 채움 → hover 시 비움 -->
<Link className="cta-fill cta-fill-teal ... border-teal hover:text-teal">
<!-- 라이트 배경: navy 채움 → hover 시 비움 -->
<Link className="cta-fill cta-fill-navy ... border-navy hover:text-navy">
```

## 브랜드 컬러 토큰
```css
--navy:   #103050   /* 주색 — 버튼, 다크 섹션 */
--teal:   #57ADB1   /* 포인트 — 강조, CTA */
--teal-d: #3D8F94   /* teal hover 상태 */
--navy-d: #0A1F35   /* 다크 배경 — Hero, Footer */
--stone:  #F4F2EE   /* 라이트 배경 — 섹션 교차 */
--ink:    #111111   /* 본문 텍스트 */
--muted:  #888888   /* 보조 텍스트 */
--rule:   #E3E0DA   /* 구분선 */
```

## 타이포그래피
- 헤드라인: Noto Serif KR (next/font/google)
- 본문: Noto Sans KR
- 번호·레이블: IBM Plex Mono

## Phase 진행 규칙
새로운 Phase 시작 시 반드시 `/dev/active/phase{N}-{name}/` 폴더에 3개 파일 생성:
```
dev/active/phase{N}-{name}/
├── phase{N}-{name}-context.md   ← 결정 이력, 참고 자료, 제약 사항
├── phase{N}-{name}-plan.md      ← 아키텍처 계획, 기술 결정, 설계
└── phase{N}-{name}-tasks.md     ← 작업 목록, 체크리스트, 완료 기록
```

## 절대 위반 금지
1. 모든 요소 border-radius: 0 — globals.css에서 override. `rounded-*` 클래스 사용 금지.
2. box-shadow 절대 금지. `shadow-*` 클래스 사용 금지.
3. 모든 폼 react-hook-form + zod 필수
4. Server Component/Route Handler → createServerClient()
5. Client Component → createBrowserClient()
6. SUPABASE_SERVICE_ROLE_KEY 클라이언트 노출 금지
7. 알림 발송 → Supabase Edge Function에서만
8. 권한 검사 → middleware.ts에서 수행
9. DB 쿼리 → src/domains/[도메인]/repository.ts 경유
10. 로그아웃 시 `router.push()` 사용 금지 → `window.location.href` 사용 (전체 리로드 필수)
11. 모든 클릭 가능 요소에 `cursor-pointer` 필수 (버튼, 링크, 카드 등)
12. hover 상태에는 반드시 `transition-colors duration-200` 이상 적용

## 자주 하는 실수 방지
| 실수 | 올바른 방법 |
|------|------------|
| Server Component에서 `createClient()` 사용 | `@supabase/ssr`의 `createServerClient()` 사용 |
| Client Component에서 `createServerClient()` 사용 | `createBrowserClient()` 사용 |
| Next.js Route에서 알림톡/SMS 직접 호출 | Supabase Edge Function 경유 필수 |
| `rounded-*` Tailwind 클래스 추가 | 절대 금지 — border-radius는 항상 0 |
| `shadow-*` Tailwind 클래스 추가 | 절대 금지 |
| 컴포넌트에서 직접 DB 쿼리 | `src/domains/[도메인]/repository.ts` 경유 |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` 생성 | 절대 금지 — 서버 전용 |
| username으로 Supabase signIn 직접 호출 | username → 이메일 조회 → signInWithPassword |
| shadcn 기본 rounded 그대로 사용 | globals.css `* { border-radius: 0 !important }` 필수 |
| 로그아웃에서 `router.push()` 사용 | `window.location.href = "/"` 사용 (미들웨어 재실행 필요) |
| SIGNED_OUT에서 setUser(null)+setProfile(null) 개별 호출 | `logout()` 한 번 호출 (파생 상태 완전 초기화) |
| 클릭 가능 요소에 `cursor-pointer` 누락 | 버튼, 링크, 카드 등 모든 인터랙티브 요소에 필수 |
| hover에 transition 없음 | `transition-colors duration-200` 이상 적용 |
