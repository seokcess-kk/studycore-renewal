# Implementation Plan: 기능 개선 v2 (12개 기능)

**Status**: ⏳ Pending
**Started**: 2026-03-16
**Last Updated**: 2026-03-16
**Estimated Completion**: -

---

**CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ **DO NOT skip quality gates or proceed with failing checks**

---

## 📋 Overview

### Feature List
| ID | 기능 | 우선순위 | Phase |
|----|------|---------|-------|
| BUG-1 | 로그아웃 동작 불량 수정 | **긴급** | Phase 0 ✅ |
| SEC-1 | 리다이렉트 경로 검증 (오픈 리다이렉트 취약점) | **긴급** | Phase 0.1 |
| SEC-2 | OAuth 콜백 상태 분기 통합 + 로그아웃 타임아웃 | **긴급** | Phase 0.2 |
| SEC-3 | 상태 안내 페이지 서버 보호 강화 | 중간 | Phase 0.3 |
| A-1 | 모바일 햄버거 메뉴 | 높음 | Phase 1 |
| A-3 | 질문 알림 뱃지 (Nav) | 높음 | Phase 2 |
| B-9 | Admin Sidebar 미답변 카운트 뱃지 | 중간 | Phase 2 |
| A-4 | 스태프 비밀번호 변경 | 높음 | Phase 3 |
| B-6 | 공지 리치텍스트 에디터 | 중간 | Phase 4 |
| B-7 | 블로그 OG 이미지 자동 생성 | 중간 | Phase 5 |
| B-8 | 공개 페이지 통합 검색 | 중간 | Phase 6 |
| C-12 | E2E 테스트 (Playwright) | 낮음 | Phase 7 |

### Success Criteria
- [ ] 모바일에서 모든 메뉴 접근 가능
- [ ] admin/mentor에게 미답변 질문 수 실시간 표시
- [ ] 스태프가 마이페이지에서 비밀번호 변경 가능
- [ ] 공지 작성 시 서식 있는 콘텐츠 작성 가능
- [ ] 블로그 SNS 공유 시 OG 이미지 자동 생성
- [ ] 공개 페이지에서 블로그·공지 통합 검색 가능
- [ ] 핵심 사용자 플로우 E2E 테스트 자동화

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| 모바일 메뉴: Framer Motion 슬라이드 | 이미 프로젝트에 Framer Motion 사용 중, 추가 의존성 없음 | CSS-only보다 번들 약간 증가 (이미 포함됨) |
| 알림 뱃지: Zustand store + 폴링 | 실시간 WebSocket 대비 구현 간단, Supabase Realtime 추후 전환 가능 | 최대 60초 지연 |
| 비밀번호 변경: Supabase RPC 확장 | 기존 `verify_staff_password` RPC 패턴 활용, 서버사이드 bcrypt 유지 | 마이그레이션 추가 필요 |
| 리치텍스트: Tiptap 에디터 | 오픈소스, headless UI(Tailwind 호환), 커스텀 쉬움, React 지원 최고 | Quill 대비 초기 설정 복잡 |
| OG 이미지: Next.js ImageResponse API | 빌트인 기능, 외부 서비스 불필요, Vercel Edge 최적화 | 복잡한 디자인 한계 |
| 통합 검색: Supabase full-text search | PostgreSQL tsvector 활용, 추가 인프라 불필요 | Algolia/Meilisearch 대비 정확도 낮음 |
| E2E: Playwright | 최신 표준, 다중 브라우저, 안정적, MS 지원 | Cypress 대비 커뮤니티 작음 |

---

## 📦 Dependencies

### External Dependencies (신규 설치)
| 패키지 | 버전 | 용도 | Phase |
|--------|------|------|-------|
| `@tiptap/react` | ^2.x | 리치텍스트 에디터 코어 | Phase 4 |
| `@tiptap/starter-kit` | ^2.x | 기본 확장 번들 | Phase 4 |
| `@tiptap/extension-image` | ^2.x | 이미지 삽입 | Phase 4 |
| `@tiptap/extension-link` | ^2.x | 링크 삽입 | Phase 4 |
| `@playwright/test` | ^1.x | E2E 테스트 프레임워크 | Phase 7 |

### DB Migrations (신규)
| 번호 | 파일 | 내용 | Phase |
|------|------|------|-------|
| 021 | `add_change_password_rpc.sql` | `change_staff_password` RPC 함수 | Phase 3 |
| 022 | `add_search_indexes.sql` | notices/blog_posts full-text 인덱스 | Phase 6 |

---

## 🧪 Test Strategy

### Test Pyramid
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | 도메인 서비스, 유틸리티 함수 |
| **Integration Tests** | Critical paths | 컴포넌트 상호작용, API 호출 |
| **E2E Tests** | 핵심 5개 플로우 | 전체 사용자 여정 검증 |

### Validation Commands
```bash
npm run build          # 빌드 확인
npm run lint           # ESLint
npx tsc --noEmit       # TypeScript 타입 체크
npx playwright test    # E2E 테스트 (Phase 7 이후)
```

---

## 🚀 Implementation Phases

---

### Phase 0: 로그아웃 동작 불량 수정
**Goal**: 로그아웃 시 세션·쿠키·상태가 완전히 정리되고, 모든 경로에서 일관되게 동작
**Estimated Time**: 2시간
**Status**: ⏳ Pending
**Priority**: 긴급 (다른 Phase보다 먼저 수행)

#### 발견된 문제점

| # | 문제 | 위치 | 영향 |
|---|------|------|------|
| 1 | **CSR 라우팅으로 로그아웃** | Nav.tsx, MyPage | `router.push()`는 서버 미들웨어를 재실행하지 않아 캐시된 인증 상태가 남을 수 있음 |
| 2 | **3곳의 불일치 로그아웃 패턴** | Nav, AdminSidebar, MyPage | Nav/MyPage는 `signOut()` 서비스 경유, AdminSidebar는 직접 호출. 리다이렉트 방식도 다름 |
| 3 | **AdminSidebar 에러 처리 없음** | AdminSidebar.tsx | `supabase.auth.signOut()` 실패 시 무시하고 진행 |
| 4 | **세션 만료 시 자동 로그아웃 없음** | SessionWarning.tsx | 경고만 표시, 만료 후 조용히 실패 (API 호출 401) |
| 5 | **AuthInitializer SIGNED_OUT 처리** | Providers.tsx | `onAuthStateChange(SIGNED_OUT)` → `setUser(null)+setProfile(null)` 호출하지만 `logout()` 미호출로 isStaff 등 파생 상태 잔존 가능 |

#### 해결 방향

```
문제 1+2 해결: 모든 로그아웃을 단일 함수로 통일
─────────────────────────────────────────────
src/domains/user/service.ts → signOut()는 유지 (Supabase API 호출)

3곳 모두 동일 패턴으로 변경:
  1. signOut(supabase)     → Supabase 세션 종료 + 쿠키 정리
  2. logout()              → Zustand 상태 완전 초기화
  3. window.location.href = "/"  → 전체 페이지 리로드 (미들웨어 재실행)
     (router.push 대신 — 캐시 문제 원천 차단)

문제 3 해결: AdminSidebar에 try-catch + Toast 추가

문제 4 해결: SessionWarning에 만료 시 자동 로그아웃 추가
─────────────────────────────────────────────
remaining <= 0 일 때:
  → signOut(supabase) + logout() + window.location.href = "/login"

문제 5 해결: AuthInitializer SIGNED_OUT 이벤트에서 logout() 호출
─────────────────────────────────────────────
onAuthStateChange("SIGNED_OUT") → store.logout() 호출
(setUser(null) + setProfile(null) 개별 호출 대신)
```

#### Tasks

**🟢 구현**
- [ ] **Task 0.1**: `Nav.tsx` — 로그아웃 패턴 수정
  - `router.push(ROUTES.HOME)` → `window.location.href = "/"`
  - `isLoggingOut` 상태 유지 (중복 클릭 방지)
  - 에러 시 Toast 알림 추가

- [ ] **Task 0.2**: `AdminSidebar.tsx` — 로그아웃 패턴 통일
  - `supabase.auth.signOut()` 직접 호출 → `signOut(supabase)` 서비스 경유
  - try-catch 추가 + 에러 시 Toast 알림
  - `import { signOut } from "@/domains/user/service"` 추가

- [ ] **Task 0.3**: `MyPage (my/page.tsx)` — 로그아웃 패턴 수정
  - `router.push(ROUTES.HOME)` → `window.location.href = "/"`
  - 기존 `signOut()` 서비스 경유 패턴 유지

- [ ] **Task 0.4**: `SessionWarning.tsx` — 세션 만료 시 자동 로그아웃
  - `checkSession()`에 만료 감지 로직 추가:
    ```ts
    if (remaining <= 0) {
      // 세션 만료됨 — 자동 로그아웃
      const supabase = createClient();
      await signOut(supabase);
      logout();
      window.location.href = "/login";
      return;
    }
    ```
  - `useUserStore`에서 `logout` 액션 가져오기
  - `signOut` 서비스 import 추가

- [ ] **Task 0.5**: `Providers.tsx` — SIGNED_OUT 이벤트 처리 개선
  - `AuthInitializer`에서 `logout` 액션 가져오기
  - `handleSession(null)` 내부:
    - 기존: `setUser(null)` + `setProfile(null)` (파생 상태 누락 가능)
    - 변경: `logout()` 호출 (모든 상태 한번에 초기화)
  - SIGNED_OUT 이벤트 시 `setLoading(false)` 보장

- [ ] **Task 0.6**: 로그아웃 후 뒤로가기 방지
  - `signOut` 성공 후 `window.location.replace("/")` 사용 검토
    (replace는 히스토리에 남지 않아 뒤로가기 시 로그인 페이지가 아닌 현재 페이지로 돌아가지 않음)
  - 또는 미들웨어가 이미 보호 페이지를 차단하므로 `href`로 충분한지 판단

#### 변경 파일 요약

| 파일 | 변경 내용 |
|------|----------|
| `src/components/common/Nav.tsx` | `router.push` → `window.location.href`, 에러 Toast |
| `src/components/admin/AdminSidebar.tsx` | `signOut` 서비스 경유, try-catch, Toast |
| `src/app/my/page.tsx` | `router.push` → `window.location.href` |
| `src/components/common/SessionWarning.tsx` | 만료 시 자동 로그아웃, `signOut`+`logout` 추가 |
| `src/components/Providers.tsx` | SIGNED_OUT → `logout()` 호출로 변경 |

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] Nav에서 로그아웃 → 홈으로 이동, 쿠키 삭제 확인
- [ ] AdminSidebar에서 로그아웃 → 홈으로 이동, 쿠키 삭제 확인
- [ ] MyPage에서 로그아웃 → 홈으로 이동, 쿠키 삭제 확인
- [ ] 로그아웃 후 `/notices` 접근 → `/login`으로 리다이렉트
- [ ] 로그아웃 후 브라우저 뒤로가기 → 보호 페이지 접근 불가
- [ ] 세션 만료 시 자동 로그아웃 동작 확인
- [ ] 로그아웃 실패 시 에러 Toast 표시
- [ ] 3곳 모두 동일한 패턴으로 동작 확인

---

### Phase 0.1: 리다이렉트 경로 검증 (오픈 리다이렉트 취약점 수정)
**Goal**: redirect/next 파라미터를 내부 경로로 강제 검증하여 오픈 리다이렉트 공격 차단
**Estimated Time**: 1시간
**Status**: ⏳ Pending
**Priority**: 긴급 (보안 취약점)

#### 현재 문제
- `login/page.tsx:20` — `searchParams.get("redirect")` 무검증 사용
- `auth/callback/page.tsx:33` — `searchParams.get("next")` 무검증 사용
- `/login?redirect=https://evil.com` 입력 시 로그인 후 외부 사이트로 이동 가능

#### Tasks

- [ ] **Task 0.1.1**: `src/lib/auth-redirect.ts` 생성 — `sanitizeRedirectPath()` 유틸
  ```ts
  export function sanitizeRedirectPath(input: string | null, fallback = "/"): string {
    if (!input) return fallback;
    // /로 시작하지 않으면 거부
    if (!input.startsWith("/")) return fallback;
    // //, http, javascript: 등 외부/위험 패턴 차단
    if (/^\/\/|^\/\\|https?:|javascript:|data:/i.test(input)) return fallback;
    return input;
  }
  ```

- [ ] **Task 0.1.2**: `src/app/login/page.tsx` 수정
  - `searchParams.get("redirect") || ROUTES.HOME` → `sanitizeRedirectPath(searchParams.get("redirect"), ROUTES.HOME)`

- [ ] **Task 0.1.3**: `src/app/auth/callback/page.tsx` 수정
  - `searchParams.get("next") ?? ROUTES.HOME` → `sanitizeRedirectPath(searchParams.get("next"), ROUTES.HOME)`

- [ ] **Task 0.1.4**: `src/middleware.ts` 수정
  - `url.searchParams.set("redirect", pathname)` — pathname은 이미 내부 경로이므로 안전, 변경 불필요

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] `/login?redirect=/admin` → 로그인 후 `/admin` 이동 (정상)
- [ ] `/login?redirect=https://evil.com` → 로그인 후 `/` 이동 (차단)
- [ ] `/login?redirect=//evil.com` → `/` 이동 (차단)
- [ ] `/login?redirect=javascript:alert(1)` → `/` 이동 (차단)
- [ ] OAuth 콜백의 `next` 파라미터도 동일하게 검증됨

---

### Phase 0.2: OAuth 콜백 상태 분기 통합 + 로그아웃 타임아웃
**Goal**: 인증 후 상태별 라우팅을 단일 함수로 통합, 로그아웃에 타임아웃 적용
**Estimated Time**: 1.5시간
**Status**: ⏳ Pending

#### 현재 문제
1. `auth/callback/page.tsx:73` — pending 사용자를 `/register`로 보냄
2. `middleware.ts:79` — pending 사용자를 `/pending-approval`로 보냄
3. 프로필이 존재 + pending = 이미 가입 완료, 승인 대기 → `/pending-approval`이 맞음
4. `signOut()`이 fire-and-forget으로 서버 세션 무효화 보장 없음

#### Tasks

- [ ] **Task 0.2.1**: `src/lib/auth-redirect.ts`에 `getPostAuthDestination()` 추가
  ```ts
  export function getPostAuthDestination(
    profile: { role?: string; status?: string } | null,
    fallbackNext: string = "/"
  ): string {
    // 프로필 없음 → 회원가입
    if (!profile) return "/register";
    // 재원생 + pending → 승인 대기
    if (profile.role === "student" && profile.status === "pending") return "/pending-approval";
    // 재원생 + inactive → 비활성 안내
    if (profile.role === "student" && profile.status === "inactive") return "/account-inactive";
    // 그 외 → 목적지
    return fallbackNext;
  }
  ```

- [ ] **Task 0.2.2**: `src/app/auth/callback/page.tsx` 수정
  - 직접 문자열 분기 → `getPostAuthDestination(profile, next)` 사용
  ```ts
  // Before:
  if (!profile) router.replace("/register");
  else if (profile.status === "pending") router.replace("/register");  // ← 잘못됨
  else router.replace(next);

  // After:
  const destination = getPostAuthDestination(profile, next);
  router.replace(destination);
  ```

- [ ] **Task 0.2.3**: `src/domains/user/service.ts` — signOut에 타임아웃 적용
  ```ts
  export async function signOut(supabase: SupabaseClient): Promise<void> {
    clearSupabaseCookies();

    // 서버 세션 무효화 (최대 2초 대기, 실패해도 진행)
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
      ]);
    } catch {
      logger.warn("signOut 서버 요청 실패/타임아웃 (쿠키는 이미 삭제됨)", { context: "signOut" });
    }
  }
  ```

- [ ] **Task 0.2.4**: 호출부 3곳(Nav, AdminSidebar, MyPage) `await signOut()` + `async` 복원
  - 최대 2초만 대기하고, 이후 `logout()` + `window.location.href = "/"` 실행

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] 카카오 OAuth 신규 가입 → `/register` 이동
- [ ] 카카오 OAuth 기존 가입 + pending → `/pending-approval` 이동 (기존: `/register`)
- [ ] 카카오 OAuth 기존 가입 + active → 홈 이동
- [ ] 로그아웃 클릭 시 2초 내 페이지 이동 보장
- [ ] 네트워크 끊긴 상태에서도 로그아웃 동작 (쿠키 삭제 + 2초 타임아웃)

---

### Phase 0.3: 상태 안내 페이지 서버 보호 강화
**Goal**: pending-approval, account-inactive 페이지 접근을 middleware에서 서버 판정
**Estimated Time**: 1시간
**Status**: ⏳ Pending

#### 현재 문제
- 두 페이지가 클라이언트 `useEffect`로 Zustand 상태를 확인 후 리다이렉트
- hydration 전 잘못된 화면이 잠깐 노출 가능

#### Tasks

- [ ] **Task 0.3.1**: `src/middleware.ts` — 상태 안내 페이지 접근 정책 추가
  ```ts
  // /pending-approval, /account-inactive 접근 제어
  if (pathname === "/pending-approval" || pathname === "/account-inactive") {
    if (!user) {
      // 비로그인 → 로그인 페이지
      url.pathname = ROUTES.LOGIN;
      return NextResponse.redirect(url);
    }
    // 프로필 조회 후 상태 불일치 시 홈으로
    const { data: profile } = await supabase.from("profiles")...
    if (pathname === "/pending-approval" && profile?.status !== "pending") {
      url.pathname = ROUTES.HOME;
      return NextResponse.redirect(url);
    }
    if (pathname === "/account-inactive" && profile?.status !== "inactive") {
      url.pathname = ROUTES.HOME;
      return NextResponse.redirect(url);
    }
  }
  ```

- [ ] **Task 0.3.2**: `pending-approval/page.tsx` — 클라이언트 리다이렉트 로직 제거
  - `useEffect` 리다이렉트 삭제 (middleware가 처리)
  - 표시 전용 컴포넌트로 단순화

- [ ] **Task 0.3.3**: `account-inactive/page.tsx` — 동일하게 클라이언트 리다이렉트 제거

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] 비로그인 사용자 `/pending-approval` 접근 → `/login` 리다이렉트
- [ ] active 사용자 `/pending-approval` 접근 → `/` 리다이렉트
- [ ] pending 사용자 `/pending-approval` 접근 → 페이지 정상 표시
- [ ] 페이지 로드 시 깜빡임 없음

---

### Phase 1: 모바일 햄버거 메뉴
**Goal**: 모바일에서 햄버거 아이콘 클릭 → 풀스크린 슬라이드 메뉴 열림/닫힘
**Estimated Time**: 2~3시간
**Status**: ⏳ Pending

#### 현재 상태
- `Nav.tsx` 162줄, 데스크톱 링크에 `hidden md:block` 적용
- 모바일에서 로고만 보이고 메뉴 접근 불가
- Framer Motion 이미 설치됨

#### 설계
```
Nav.tsx 수정:
├── 햄버거 버튼 (md:hidden) — Menu/X 아이콘 토글
├── <MobileMenu /> 컴포넌트 (새 파일)
│   ├── Framer Motion AnimatePresence + slide-in
│   ├── 전체 화면 오버레이 (bg-navy-dark)
│   ├── 인증 상태별 메뉴 항목 (Nav.tsx 로직 재사용)
│   ├── 로그아웃 버튼
│   └── 페이지 이동 시 자동 닫힘 (pathname 감시)
└── body scroll lock (메뉴 열릴 때)
```

#### Tasks

**🟢 구현**
- [ ] **Task 1.1**: `src/components/common/MobileMenu.tsx` 생성
  - Framer Motion `motion.div` + `AnimatePresence` 슬라이드 애니메이션
  - 전체 화면 오버레이: `fixed inset-0 z-[400] bg-navy-dark`
  - 메뉴 항목: 비로그인(특징/시설/FAQ/로그인/상담신청) / 로그인(공지/질문/도시락/마이페이지/관리자/로그아웃)
  - 역할 분기: `isStaff` → 도시락 숨김, `canAccessAdmin` → 관리자 표시
  - 현재 페이지 하이라이트 (pathname 비교)
  - 링크 클릭 or 닫기 버튼 → 메뉴 닫힘
  - `useEffect`로 pathname 변경 시 자동 닫힘

- [ ] **Task 1.2**: `Nav.tsx` 수정 — 햄버거 버튼 추가
  - 로고 옆 우측에 `<button className="md:hidden">` 추가
  - `Menu` / `X` 아이콘 토글 (lucide-react)
  - `isScrolled` 상태에 따라 아이콘 색상 전환 (white ↔ ink)
  - `isMenuOpen` 상태 관리
  - `<MobileMenu isOpen={isMenuOpen} onClose={...} />`  렌더링

- [ ] **Task 1.3**: body scroll lock 처리
  - 메뉴 열릴 때 `document.body.style.overflow = 'hidden'`
  - 닫힐 때 복원
  - cleanup 함수로 언마운트 시 복원 보장

#### Quality Gate ✋
- [ ] 빌드 성공 (`npm run build`)
- [ ] 타입 체크 통과 (`npx tsc --noEmit`)
- [ ] 린트 통과 (`npm run lint`)
- [ ] 모바일 뷰포트(375px)에서 햄버거 아이콘 표시
- [ ] 데스크톱(1024px+)에서 햄버거 아이콘 숨김, 기존 메뉴 정상
- [ ] 메뉴 열기/닫기 애니메이션 동작
- [ ] 비로그인/로그인/admin 역할별 메뉴 항목 정확
- [ ] 페이지 이동 시 메뉴 자동 닫힘
- [ ] body 스크롤 잠금/해제 정상

---

### Phase 2: 질문 알림 뱃지 (Nav + Admin Sidebar)
**Goal**: admin/mentor에게 미답변 질문 수를 Nav와 Admin Sidebar에 뱃지로 표시
**Estimated Time**: 2시간
**Status**: ⏳ Pending
**Dependencies**: Phase 1 완료 (MobileMenu에도 뱃지 반영 필요)

#### 설계
```
데이터 흐름:
1. question/repository.ts → getUnansweredCount() 함수 추가
2. question/service.ts → fetchUnansweredCount() 서비스 함수
3. useUserStore.ts → unansweredCount 상태 + fetchUnansweredCount 액션
4. Nav.tsx / MobileMenu.tsx → "질문방" 옆 뱃지 (canAccessAdmin일 때만)
5. AdminSidebar.tsx → "질문 관리" 옆 뱃지
6. 폴링: 60초 간격 자동 갱신 (admin/mentor만)
```

#### Tasks

**🟢 구현**
- [ ] **Task 2.1**: `src/domains/question/repository.ts` — `getUnansweredCount()` 추가
  ```ts
  // supabase.from("questions").select("*", { count: "exact", head: true }).eq("status", "pending")
  ```

- [ ] **Task 2.2**: `src/domains/question/service.ts` — `fetchUnansweredCount()` 추가

- [ ] **Task 2.3**: `src/stores/useUserStore.ts` 확장
  - 상태: `unansweredQuestionCount: number`
  - 액션: `setUnansweredQuestionCount(count: number)`

- [ ] **Task 2.4**: `src/hooks/useUnansweredCount.ts` 생성 (커스텀 훅)
  - `canAccessAdmin`일 때만 활성화
  - 마운트 시 즉시 조회 + 60초 `setInterval` 폴링
  - `useUserStore.setUnansweredQuestionCount()` 업데이트
  - 클린업: interval 해제

- [ ] **Task 2.5**: `Nav.tsx` 수정 — "질문방" 링크 옆 뱃지
  - `canAccessAdmin && unansweredQuestionCount > 0`일 때 표시
  - 뱃지 스타일: `bg-teal text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center`
  - 99+ 처리

- [ ] **Task 2.6**: `MobileMenu.tsx` 수정 — 모바일 메뉴 질문방 뱃지

- [ ] **Task 2.7**: `AdminSidebar.tsx` 수정 — "질문 관리" 옆 뱃지
  - navItems에 `badge` 속성 추가 (동적)
  - 뱃지 스타일: 사이드바에 맞게 조정 (작은 원형)

- [ ] **Task 2.8**: 훅 호출 위치
  - `Nav.tsx`에서 `useUnansweredCount()` 호출 (공통 Nav에서 1회)
  - `AdminSidebar.tsx`에서도 store에서 읽기만 (`useUserStore`)

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] admin 로그인 시 Nav "질문방"에 뱃지 표시
- [ ] student 로그인 시 뱃지 미표시
- [ ] Admin Sidebar "질문 관리"에 뱃지 표시
- [ ] 질문 답변 후 60초 내 뱃지 수 감소 확인
- [ ] 모바일 메뉴에도 뱃지 정상 표시
- [ ] 뱃지 0개일 때 숨김 처리

---

### Phase 3: 스태프 비밀번호 변경
**Goal**: 스태프(admin/mentor/assistant)가 마이페이지에서 비밀번호 변경 가능
**Estimated Time**: 3시간
**Status**: ⏳ Pending

#### 현재 상태
- `verify_staff_password` RPC 존재 (bcrypt 검증)
- `set_staff_password` RPC 존재 (admin용 초기 설정)
- 비밀번호 **변경** RPC 없음
- 마이페이지에 비밀번호 변경 UI 없음

#### 설계
```
1. DB Migration 021: change_staff_password RPC 함수
   - 입력: current_password, new_password
   - 현재 비밀번호 verify → 새 비밀번호 bcrypt hash → UPDATE
   - 보안: auth.uid() 기반 (본인만 변경 가능)

2. Domain Layer:
   - user/repository.ts → changeStaffPassword(currentPw, newPw)
   - user/service.ts → changePassword(supabase, currentPw, newPw)

3. UI:
   - src/components/my/PasswordChangeForm.tsx (신규)
   - src/app/(member)/my/page.tsx → isStaff일 때 폼 표시
```

#### Tasks

**🟢 구현**
- [ ] **Task 3.1**: DB Migration `021_add_change_password_rpc.sql`
  ```sql
  CREATE OR REPLACE FUNCTION change_staff_password(
    p_current_password TEXT,
    p_new_password TEXT
  ) RETURNS JSONB AS $$
  DECLARE
    v_user_id UUID;
    v_stored_hash TEXT;
  BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
    END IF;

    SELECT password_hash INTO v_stored_hash
    FROM staff_credentials WHERE user_id = v_user_id;

    IF v_stored_hash IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'NO_CREDENTIALS');
    END IF;

    IF NOT (v_stored_hash = crypt(p_current_password, v_stored_hash)) THEN
      RETURN jsonb_build_object('success', false, 'error', 'WRONG_PASSWORD');
    END IF;

    UPDATE staff_credentials
    SET password_hash = crypt(p_new_password, gen_salt('bf', 10)),
        updated_at = now()
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object('success', true);
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

- [ ] **Task 3.2**: `src/domains/user/repository.ts` — `changeStaffPassword()` 추가
  - Supabase RPC 호출: `supabase.rpc('change_staff_password', {...})`
  - 반환: `{ success: boolean; error?: string }`

- [ ] **Task 3.3**: `src/domains/user/service.ts` — `changePassword()` 추가
  - 입력 검증 (최소 8자, 현재와 다른 비밀번호)
  - repository 호출 + 에러 메시지 한글 매핑

- [ ] **Task 3.4**: `src/domains/user/model.ts` — Zod 스키마 추가
  ```ts
  export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });
  ```

- [ ] **Task 3.5**: `src/components/my/PasswordChangeForm.tsx` 생성
  - react-hook-form + zod resolver
  - 필드: 현재 비밀번호, 새 비밀번호, 비밀번호 확인
  - 비밀번호 표시/숨김 토글 (Eye/EyeOff 아이콘)
  - 제출 버튼 + 로딩 상태
  - 성공/실패 Toast 알림
  - 에러 매핑: WRONG_PASSWORD → "현재 비밀번호가 올바르지 않습니다"

- [ ] **Task 3.6**: `src/app/(member)/my/page.tsx` 수정
  - `isStaff`일 때 프로필 탭에 "비밀번호 변경" 섹션 추가
  - 접기/펼치기 토글 (기본: 접힌 상태)
  - `<PasswordChangeForm />` 렌더링

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] 마이그레이션 SQL 문법 검증
- [ ] 스태프 로그인 → 마이페이지 → 비밀번호 변경 섹션 표시
- [ ] 재원생 로그인 → 비밀번호 변경 섹션 미표시
- [ ] 올바른 현재 비밀번호 + 새 비밀번호 → 변경 성공
- [ ] 잘못된 현재 비밀번호 → 에러 메시지
- [ ] 새 비밀번호 ≠ 확인 → 폼 검증 에러
- [ ] 변경 후 새 비밀번호로 로그인 성공

---

### Phase 4: 공지 리치텍스트 에디터
**Goal**: 공지 작성/수정 시 Tiptap 리치텍스트 에디터로 서식 있는 콘텐츠 작성
**Estimated Time**: 3~4시간
**Status**: ⏳ Pending

#### 설계
```
패키지: @tiptap/react + @tiptap/starter-kit + @tiptap/extension-image + @tiptap/extension-link

컴포넌트:
├── src/components/admin/RichTextEditor.tsx (신규)
│   ├── 툴바: Bold, Italic, H2, H3, List, OrderedList, Blockquote, Link, Image, Divider
│   ├── 에디터 영역: Tiptap EditorContent
│   ├── HTML 출력: editor.getHTML()
│   └── 스타일: border-radius:0, no shadow, border-rule
│
├── 공지 작성 (notices/new) → textarea를 <RichTextEditor /> 교체
├── 공지 수정 (notices/[id]/edit) → textarea를 <RichTextEditor /> 교체
└── 공지 상세 (notices/[id]) → 기존 dangerouslySetInnerHTML 유지 (이미 HTML 렌더링)

DB 변경: 없음 (notices.content 컬럼은 이미 TEXT, HTML 저장 가능)
```

#### Tasks

**🟢 구현**
- [ ] **Task 4.1**: Tiptap 패키지 설치
  ```bash
  npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/pm
  ```

- [ ] **Task 4.2**: `src/components/admin/RichTextEditor.tsx` 생성
  - Props: `content: string`, `onChange: (html: string) => void`, `placeholder?: string`
  - 툴바 버튼 그룹:
    - 텍스트: Bold(B), Italic(I)
    - 제목: H2, H3
    - 목록: BulletList, OrderedList
    - 블록: Blockquote, HorizontalRule
    - 인라인: Link(삽입/해제), Image(URL 입력)
  - 스타일 규칙:
    - 툴바: `border border-rule bg-stone p-2 flex flex-wrap gap-1`
    - 버튼: `p-1.5 text-muted hover:text-ink hover:bg-white` (active: `text-ink bg-white`)
    - 에디터: `border border-t-0 border-rule min-h-[300px] p-4 prose prose-sm`
    - border-radius: 0, box-shadow: 없음
  - 에디터 내 콘텐츠 스타일 (`globals.css` 또는 인라인):
    - h2: `font-serif text-xl font-bold`
    - h3: `font-serif text-lg font-bold`
    - blockquote: `border-l-2 border-teal pl-4 text-muted`

- [ ] **Task 4.3**: `src/app/admin/notices/new/page.tsx` 수정
  - `<textarea>` → `<RichTextEditor content={content} onChange={setContent} />`
  - react-hook-form `Controller` 또는 `setValue` 연동
  - 제출 시 `editor.getHTML()` 값 저장

- [ ] **Task 4.4**: `src/app/admin/notices/[id]/edit/page.tsx` 수정
  - 기존 content를 RichTextEditor의 초기값으로 전달
  - 동일한 Controller/setValue 패턴

- [ ] **Task 4.5**: 공지 상세 페이지 HTML 렌더링 스타일 보정
  - `src/app/(member)/notices/[id]/page.tsx` — `dangerouslySetInnerHTML` 영역에 prose 클래스 추가
  - Tiptap 출력 HTML과 호환되는 스타일 보장

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] 공지 작성 페이지에서 리치텍스트 에디터 렌더링
- [ ] Bold, Italic, 제목, 목록, 인용, 링크, 이미지 기능 동작
- [ ] 작성 → 저장 → 상세 페이지에서 서식 유지 확인
- [ ] 기존 공지(일반 텍스트) 수정 시 에디터에 정상 로드
- [ ] border-radius: 0, box-shadow 없음 준수
- [ ] 모바일에서 에디터 사용 가능

---

### Phase 5: 블로그 OG 이미지 자동 생성
**Goal**: 블로그 상세 페이지 공유 시 제목+태그가 포함된 OG 이미지 자동 생성
**Estimated Time**: 2~3시간
**Status**: ⏳ Pending

#### 설계
```
Next.js App Router의 opengraph-image.tsx 규약 활용:

src/app/(public)/blog/[slug]/
├── page.tsx                  ← 기존 (CSR → SSR generateMetadata 추가)
└── opengraph-image.tsx       ← 신규 (ImageResponse API)

OG 이미지 레이아웃 (1200x630):
┌──────────────────────────────────────┐
│  [navy-dark 배경]                      │
│                                       │
│  STUDYCORE 1.0          (로고 텍스트)   │
│                                       │
│  ┌─ 블로그 제목 (Noto Serif) ──────┐   │
│  │  최대 2줄, 말줄임 처리            │   │
│  └──────────────────────────────┘   │
│                                       │
│  #태그1  #태그2  #태그3    (teal 색상)  │
│                                       │
│  studycore.kr/blog/slug   (하단 URL)   │
└──────────────────────────────────────┘
```

#### Tasks

**🟢 구현**
- [ ] **Task 5.1**: 블로그 상세 페이지를 SSR 전환 + `generateMetadata` 추가
  - `src/app/(public)/blog/[slug]/page.tsx`
  - `generateMetadata({ params })` 함수:
    - Supabase server client로 블로그 데이터 조회
    - title, description(excerpt), openGraph(title, description, type:article, images), twitter card
  - 페이지 컴포넌트는 기존 CSR 유지 가능 (metadata만 서버)

- [ ] **Task 5.2**: `src/app/(public)/blog/[slug]/opengraph-image.tsx` 생성
  - `ImageResponse` (from `next/og`)
  - 사이즈: 1200x630
  - 레이아웃:
    - 배경: navy-dark (#0A1F35)
    - 상단: "STUDYCORE 1.0" 텍스트 (white, 24px)
    - 중앙: 블로그 제목 (white, 48px, 최대 2줄)
    - 하단: 태그 (teal, 20px) + URL (white/50, 16px)
  - 폰트: Google Fonts fetch (Noto Sans KR)

- [ ] **Task 5.3**: 블로그 목록 페이지에도 기본 OG 메타데이터 추가
  - `src/app/(public)/blog/page.tsx` → `generateMetadata` 또는 `metadata` export
  - 제목: "블로그 | 스터디코어 1.0"

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] `/blog/[slug]` 접속 시 HTML `<meta property="og:image">` 태그 확인
- [ ] OG 이미지 URL 접속 시 1200x630 이미지 정상 렌더링
- [ ] 제목이 길 때 말줄임 처리 정상
- [ ] SNS 공유 디버거(Facebook/Twitter)에서 미리보기 확인

---

### Phase 6: 공개 페이지 통합 검색
**Goal**: 공개 페이지 헤더에 검색 기능 추가, 블로그+공지를 통합 검색
**Estimated Time**: 3~4시간
**Status**: ⏳ Pending

#### 설계
```
검색 아키텍처:

1. DB: PostgreSQL full-text search (tsvector)
   - notices: title + content → tsvector 인덱스
   - blog_posts: title + content → tsvector 인덱스

2. Domain Layer:
   - src/domains/search/ (신규 도메인)
     ├── model.ts    → SearchResult 타입
     ├── repository.ts → Supabase textSearch 쿼리
     └── service.ts   → 통합 검색 + 정렬

3. UI:
   - src/components/common/SearchModal.tsx (신규)
     ├── Cmd+K / Ctrl+K 단축키로 열기
     ├── 검색 입력 (debounce 300ms)
     ├── 결과 목록 (블로그/공지 탭 or 통합)
     ├── 키보드 네비게이션 (↑↓ Enter)
     └── ESC로 닫기

   - Nav.tsx → 검색 아이콘 버튼 추가 (Search 아이콘)

4. 검색 결과 페이지 (선택):
   - /search?q=... → 풀 결과 페이지 (향후 확장)
```

#### Tasks

**🟢 구현**
- [ ] **Task 6.1**: DB Migration `022_add_search_indexes.sql`
  ```sql
  -- 공지 full-text 인덱스
  ALTER TABLE notices ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('korean', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('korean', coalesce(content, '')), 'B')
    ) STORED;
  CREATE INDEX IF NOT EXISTS idx_notices_search ON notices USING gin(search_vector);

  -- 블로그 full-text 인덱스
  ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('korean', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('korean', coalesce(content, '')), 'B')
    ) STORED;
  CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(search_vector);
  ```

- [ ] **Task 6.2**: `src/domains/search/model.ts` 생성
  ```ts
  export type SearchResultType = "notice" | "blog";
  export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    excerpt: string;
    url: string;
    date: string;
    category?: string; // notice category
    tags?: string[];   // blog tags
  }
  ```

- [ ] **Task 6.3**: `src/domains/search/repository.ts` 생성
  - `searchNotices(query, limit)`: Supabase `.textSearch('search_vector', query)` + `is_published=true`
  - `searchBlogPosts(query, limit)`: 같은 패턴 + `status='published'`

- [ ] **Task 6.4**: `src/domains/search/service.ts` 생성
  - `search(supabase, query, limit=10)`: 두 repository 병렬 호출 → 합쳐서 날짜순 정렬
  - 빈 쿼리 → 빈 배열 반환

- [ ] **Task 6.5**: `src/components/common/SearchModal.tsx` 생성
  - Props: `isOpen, onClose`
  - 상단: 검색 입력 (`Search` 아이콘 + input + ESC 힌트)
  - 결과 영역: `SearchResult[]` 렌더링
    - 타입 뱃지 (공지/블로그)
    - 제목 (검색어 하이라이트)
    - 발행일
  - debounce 300ms
  - 키보드: ↑↓ 포커스 이동, Enter 이동, ESC 닫기
  - 빈 상태: "검색 결과가 없습니다"
  - 로딩: Skeleton

- [ ] **Task 6.6**: `Nav.tsx` 수정 — 검색 아이콘 추가
  - 비로그인: FAQ 왼쪽에 `Search` 아이콘 버튼
  - 로그인: 공지사항 왼쪽에 `Search` 아이콘 버튼
  - 클릭 → `SearchModal` 열기
  - `Cmd+K` / `Ctrl+K` 글로벌 단축키

- [ ] **Task 6.7**: `MobileMenu.tsx` 수정 — 검색 입력 추가
  - 메뉴 상단에 검색 입력 필드
  - 검색 실행 시 SearchModal 열기 or 인라인 결과 표시

#### Quality Gate ✋
- [ ] 빌드 & 타입 체크 통과
- [ ] 마이그레이션 SQL 문법 검증
- [ ] Nav에서 검색 아이콘 클릭 → 모달 열림
- [ ] Cmd+K 단축키로 모달 열림
- [ ] 블로그 제목 검색 → 결과 표시
- [ ] 공지 제목 검색 → 결과 표시
- [ ] 결과 클릭 → 해당 페이지 이동
- [ ] 빈 검색어 → 결과 없음
- [ ] 모바일에서 검색 사용 가능
- [ ] ESC로 모달 닫힘

---

### Phase 7: E2E 테스트 (Playwright)
**Goal**: 핵심 5개 사용자 플로우를 Playwright로 자동화
**Estimated Time**: 4~5시간
**Status**: ⏳ Pending

#### 설계
```
테스트 대상 플로우 (5개):
1. 비로그인: 홈 → 상담 신청 → 성공
2. 스태프 로그인 → 대시보드 접근 → 로그아웃
3. 로그인 → 공지사항 목록 → 상세 조회
4. 로그인 → 질문 작성 → 목록 확인
5. Admin → 공지 작성 → 발행 → 공개 페이지 확인

테스트 구조:
e2e/
├── playwright.config.ts
├── fixtures/
│   └── auth.ts          ← 로그인 헬퍼
├── tests/
│   ├── consult.spec.ts  ← 상담 신청
│   ├── auth.spec.ts     ← 스태프 로그인/로그아웃
│   ├── notices.spec.ts  ← 공지 조회
│   ├── questions.spec.ts ← 질문 작성
│   └── admin-notice.spec.ts ← 관리자 공지
└── .env.test            ← 테스트 환경 변수
```

#### Tasks

**🟢 구현**
- [ ] **Task 7.1**: Playwright 설치 및 설정
  ```bash
  npm init playwright@latest
  ```
  - `playwright.config.ts`:
    - baseURL: `http://localhost:3000`
    - webServer: `npm run dev` (자동 시작)
    - projects: chromium만 (초기)
    - retries: 1
    - screenshot: only-on-failure

- [ ] **Task 7.2**: 인증 fixture 생성 (`e2e/fixtures/auth.ts`)
  - `staffLogin(page, username, password)` 헬퍼
  - `studentLogin(page)` 헬퍼 (카카오 OAuth는 mock 필요)
  - 로그인 상태 저장 (storageState)

- [ ] **Task 7.3**: 상담 신청 테스트 (`e2e/tests/consult.spec.ts`)
  ```ts
  test('비로그인 사용자가 상담을 신청할 수 있다', async ({ page }) => {
    await page.goto('/consult');
    await page.fill('[name="name"]', '테스트');
    await page.fill('[name="phone"]', '010-1234-5678');
    await page.selectOption('[name="type"]', 'admission');
    await page.fill('[name="message"]', '테스트 문의입니다');
    await page.click('button[type="submit"]');
    await expect(page.getByText('신청이 완료')).toBeVisible();
  });
  ```

- [ ] **Task 7.4**: 스태프 로그인 테스트 (`e2e/tests/auth.spec.ts`)
  - 로그인 성공 → 대시보드 접근
  - 잘못된 비밀번호 → 에러 메시지
  - 로그아웃 → 홈으로 리다이렉트

- [ ] **Task 7.5**: 공지사항 조회 테스트 (`e2e/tests/notices.spec.ts`)
  - 로그인 → 공지 목록 → 첫 번째 공지 클릭 → 상세 페이지 확인

- [ ] **Task 7.6**: 질문 작성 테스트 (`e2e/tests/questions.spec.ts`)
  - 로그인 → 질문방 → 새 질문 → 제목/내용 입력 → 제출 → 목록에 표시

- [ ] **Task 7.7**: 관리자 공지 작성 테스트 (`e2e/tests/admin-notice.spec.ts`)
  - Admin 로그인 → 공지 관리 → 새 공지 → 제목/내용/카테고리 → 발행 → 공개 페이지 확인

- [ ] **Task 7.8**: package.json 스크립트 추가
  ```json
  "test:e2e": "npx playwright test",
  "test:e2e:ui": "npx playwright test --ui"
  ```

#### Quality Gate ✋
- [ ] `npx playwright test` 전체 통과
- [ ] 5개 테스트 시나리오 모두 성공
- [ ] CI에서 실행 가능 (headless 모드)
- [ ] 실패 시 스크린샷 자동 저장
- [ ] 테스트 실행 시간 < 3분

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Tiptap + shadcn 스타일 충돌 | Medium | Medium | globals.css에서 .tiptap 스코프 스타일 분리 |
| PostgreSQL 한국어 full-text 검색 정확도 | Medium | Low | unaccent + simple dictionary 대안, 향후 Meilisearch 전환 |
| OG 이미지 한글 폰트 로딩 실패 | Low | Medium | Google Fonts CDN fetch + fallback sans-serif |
| Playwright 카카오 OAuth 테스트 불가 | High | Low | 스태프 로그인만 E2E, 카카오는 수동 테스트 |
| 비밀번호 RPC 보안 취약점 | Low | High | SECURITY DEFINER + auth.uid() 검증, rate limiting 고려 |
| 모바일 메뉴 z-index 충돌 | Low | Low | z-[400]으로 Nav(z-[300]) 위에 배치 |

---

## 🔄 Rollback Strategy

### Phase별 롤백
| Phase | 롤백 방법 |
|-------|----------|
| Phase 1 (모바일 메뉴) | MobileMenu.tsx 삭제, Nav.tsx 변경 revert |
| Phase 2 (알림 뱃지) | 훅/store 변경 revert, 뱃지 UI 제거 |
| Phase 3 (비밀번호) | Migration DROP, repository/service/UI 변경 revert |
| Phase 4 (리치텍스트) | Tiptap 패키지 제거, textarea 복원 |
| Phase 5 (OG 이미지) | opengraph-image.tsx 삭제, metadata 함수 제거 |
| Phase 6 (검색) | search 도메인 삭제, Migration DROP, Nav/모달 변경 revert |
| Phase 7 (E2E) | e2e/ 폴더 삭제, Playwright 패키지 제거 |

모든 Phase는 독립적이며, 이전 Phase 완료 상태로 안전하게 롤백 가능합니다.
(예외: Phase 2는 Phase 1의 MobileMenu에 뱃지를 추가하므로, Phase 1이 먼저 완료되어야 합니다)

---

## 📊 Progress Tracking

### Completion Status
- **Phase 0** (로그아웃 수정): ✅ 100%
- **Phase 0.1** (리다이렉트 경로 검증): ⏳ 0%
- **Phase 0.2** (OAuth 분기 통합 + 로그아웃 타임아웃): ⏳ 0%
- **Phase 0.3** (상태 페이지 서버 보호): ⏳ 0%
- **Phase 1** (모바일 햄버거 메뉴): ⏳ 0%
- **Phase 2** (질문 알림 뱃지): ⏳ 0%
- **Phase 3** (비밀번호 변경): ⏳ 0%
- **Phase 4** (리치텍스트 에디터): ⏳ 0%
- **Phase 5** (OG 이미지): ⏳ 0%
- **Phase 6** (통합 검색): ⏳ 0%
- **Phase 7** (E2E 테스트): ⏳ 0%

**Overall Progress**: 0% complete

### Time Tracking
| Phase | Estimated | Actual | Variance |
|-------|-----------|--------|----------|
| Phase 0 | 2h | 완료 | - |
| Phase 0.1 | 1h | - | - |
| Phase 0.2 | 1.5h | - | - |
| Phase 0.3 | 1h | - | - |
| Phase 1 | 2~3h | - | - |
| Phase 2 | 2h | - | - |
| Phase 3 | 3h | - | - |
| Phase 4 | 3~4h | - | - |
| Phase 5 | 2~3h | - | - |
| Phase 6 | 3~4h | - | - |
| Phase 7 | 4~5h | - | - |
| **Total** | **24.5~29.5h** | - | - |

---

## 📝 Notes & Learnings

### Implementation Notes
- (구현 시 기록)

### Blockers Encountered
- (발생 시 기록)

---

## ✅ Final Checklist

**Before marking plan as COMPLETE**:
- [ ] 8개 Phase(0~7) 모두 완료 + Quality Gate 통과
- [ ] 전체 빌드 성공 (`npm run build`)
- [ ] 전체 E2E 테스트 통과 (`npx playwright test`)
- [ ] 모바일/데스크톱 크로스 디바이스 수동 테스트
- [ ] 보안 검토 (비밀번호 RPC, 검색 injection)
- [ ] border-radius:0, box-shadow 없음 전체 준수
- [ ] 접근성 기본 사항 충족 (ARIA labels on modals/menus)

---

**Plan Status**: ⏳ Pending Approval
**Next Action**: 사용자 승인 후 Phase 1부터 구현 시작
**Blocked By**: None
