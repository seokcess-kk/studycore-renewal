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
관리형 독서실 홈페이지. 공개 랜딩 + 재원생 서비스(공지·질문방·도시락) + 어드민 패널.

## 기술 스택
Next.js 16 (App Router, TS strict) · Tailwind v4 + shadcn/ui · Supabase (PG + Auth + Storage + Edge Functions) · Zustand · TanStack Query v5 · react-hook-form + zod v4 · Tiptap · Framer Motion · Playwright E2E · Vercel 배포. Path alias: `@/*` → `./src/*`

## 빌드 & 실행
```bash
npm install            # 의존성 설치
npm run dev            # localhost:3000 (webpack)
npm run build          # 프로덕션 빌드
npm run lint           # ESLint
npx tsc --noEmit       # 타입 체크
npm run test:e2e       # Playwright E2E
```

## 디렉터리 구조
```
src/app/(public)/      공개 페이지 (홈, 블로그, 상담, 소개, 후기)
src/app/(member)/      재원생 전용 (공지, 질문방, 도시락) + src/app/my/
src/app/admin/         어드민 (admin/mentor 권한)
src/app/api/           Route Handlers (staff-login, create-staff, consult)
src/domains/           DDD 3파일 패턴 — 상세: src/domains/CLAUDE.md
src/components/        UI 컴포넌트 — 브랜드/패턴: src/components/CLAUDE.md
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
9. `text-[Npx]` 직접 사용 → 디자인 토큰 (`text-label`~`text-subhead`, `text-fluid-*`) 사용 필수
10. `leading-[N]` / `tracking-[Nem]` 직접 사용 → 토큰 (`leading-heading`/`leading-ui`/`leading-prose`, `tracking-heading`/`tracking-cta`/`tracking-label`) 사용 필수

### 필수 패턴
- 모든 폼: react-hook-form + zod
- Server Component / Route Handler → `createServerClient()` (lib/supabase/server.ts)
- Client Component → `createBrowserClient()` (lib/supabase/client.ts)
- RLS 우회 → `createAdminClient()` (lib/supabase/server.ts)
- 권한 검사 → middleware.ts
- 클릭 가능 요소 → `cursor-pointer` 필수
- hover 상태 → `transition-colors duration-200` 이상
- 폰트 사이즈 → `text-label`~`text-subhead` / `text-fluid-*` 토큰 사용 (`text-[Npx]` 금지)
- 섹션 패딩 → `section-sm`/`section-md`/`section-lg` 사용
- 페이지 본문 → `page-body` 사용 (`pt-24 pb-20` 금지)
- 컨테이너 너비 → `container-narrow`/`container-content`/`container-wide`/`container-full` 사용
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
   - `PROTECTED_ROUTES`: 로그인 필수 (`/guide`, `/manual`, `/notices`, `/questions`, `/meal`, `/my`, `/reviews/write`)
   - `ADMIN_ROUTES`: admin/mentor 필수 (`/admin`)
   - `ASSISTANT_ROUTES`: staff 필수 (`/admin/guide`)
   - 재원생 전용 라우트: `/meal`, `/reviews/write`, `/questions/new` — 스태프 접근 차단
   - 스태프 전용 라우트: `/guide` — 학생 접근 차단
   - student status 체크 (pending→안내, inactive→안내)
2. **admin/layout.tsx** — 클라이언트 사이드 이중 체크
   - `/admin/guide`: `isStaff` 체크 (assistant 허용)
   - 그 외 `/admin/*`: `canAccessAdmin` 체크 (admin+mentor만)
3. **AdminSidebar.tsx** — 역할별 메뉴 필터링
   - assistant: `assistantVisible: true`인 메뉴만 표시
   - admin/mentor: 전체 메뉴 표시

**질문 관리 권한**: 질문 답변/고정은 `canAccessAdmin`(admin+mentor)만 가능. assistant는 불가.

### 상태 관리
- `useUserStore` (Zustand + sessionStorage persist). `isLoading`은 persist 제외
- `AuthInitializer`: 검증만 수행. persist↔Supabase 불일치 시만 DB 재조회

### 알림 흐름 (모두 Edge Function 경유)
```
상담 신청 → notify-consult     → 관리자 알림톡 + 신청자 SMS
재원생 질문 → notify-question  → 멘토 알림톡
멘토 답변 → notify-answer      → 재원생 알림톡 (active만)
공지 발행 → send-kakao-alimtalk → 재원생/학부모
```

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

## 변경 이력
<!-- 형식: YYYY-MM-DD: 변경 내용 (사유) -->
- 2026-03-23: 전체 권한 검토 — 재원생/스태프 전용 라우트 분리, assistant 권한 제한, 질문 답변/고정 canAccessAdmin 적용
- 2026-03-19: CLAUDE.md 재설계 — 모듈 분리, 검증 루프 추가, 도메인 용어 정의, 중복 제거
