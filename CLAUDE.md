# CLAUDE.md — STUDYCORE 1.0

## 서비스 목적
관리형 독서실 홈페이지 (studycore-web).
학부모·학생 유입을 위한 공개 홈페이지 +
재원생 전용 서비스 (공지, 질문방, 도시락 신청) +
어드민 패널.

## 기술 스택
- Next.js 14.x (App Router, TypeScript strict mode)
- Tailwind CSS + shadcn/ui (border-radius:0 전체 적용 — shadcn 기본값 override)
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Zustand — 전역 상태 (유저 세션, 역할, 메뉴 노출 여부)
- TanStack Query v5 — 서버 상태
- react-hook-form + zod — 모든 폼
- Framer Motion — 애니메이션
- 배포: Vercel

## 디렉토리 구조
```
src/
├── app/
│   ├── (public)/             ← 공개 페이지 (SSG/ISR)
│   │   ├── page.tsx          ← / 홈
│   │   ├── system/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── consult/page.tsx
│   │   ├── about/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── terms/page.tsx
│   │   └── privacy/page.tsx
│   ├── (member)/             ← 로그인 필요 (CSR)
│   │   ├── login/page.tsx
│   │   ├── guide/page.tsx
│   │   ├── notices/page.tsx
│   │   ├── notices/[id]/page.tsx
│   │   ├── questions/page.tsx
│   │   └── my/page.tsx
│   └── admin/                ← 어드민 (CSR, role=admin 전용)
│       ├── page.tsx
│       ├── members/page.tsx
│       ├── members/[id]/page.tsx
│       ├── members/[id]/consult/page.tsx
│       ├── notices/page.tsx
│       ├── questions/page.tsx
│       ├── blog/page.tsx
│       ├── lunch/page.tsx
│       ├── kakao/page.tsx
│       ├── guide/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/                   ← shadcn/ui 기본 컴포넌트 (직접 수정 금지)
│   ├── common/               ← 공통 컴포넌트 (Nav, Footer, Button 등)
│   ├── home/                 ← 홈 섹션 컴포넌트
│   ├── notices/
│   ├── questions/
│   ├── my/
│   └── admin/
├── domains/                  ← DDD 도메인 레이어
│   ├── user/
│   │   ├── model.ts          ← 타입, Zod 스키마
│   │   ├── repository.ts     ← Supabase DB 접근
│   │   └── service.ts        ← 비즈니스 로직
│   ├── notice/
│   ├── question/
│   ├── consultation/
│   ├── counseling/
│   ├── blog/
│   └── lunch/
├── lib/
│   ├── supabase/
│   │   ├── client.ts         ← 브라우저: createBrowserClient()
│   │   ├── server.ts         ← 서버: createServerClient()
│   │   └── middleware.ts     ← Auth 미들웨어 헬퍼
│   ├── utils.ts
│   └── constants.ts
├── stores/
│   └── useUserStore.ts       ← Zustand: 유저 세션, 역할, 상태
├── hooks/
└── types/
    └── database.ts           ← Supabase 자동 생성 타입
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

## 인증 모델
- 재원생: 카카오 OAuth (Supabase Auth)
- 조교·멘토·관리자: 아이디 + 비밀번호
  ⚠️ Supabase Auth는 이메일 기반 — 아이디 로그인 우회:
  users.username(TEXT UNIQUE) 조회 → 더미 이메일(username@studycore.internal) → signInWithPassword

## 계정 상태 (재원생만)
- pending  → 승인 대기, 모든 기능 잠금
- active   → 전체 기능, 알림 ON
- inactive → 기능 잠금, 알림 OFF
  상태 변경 시 user_registrations에 이력 자동 기록

## 빌드 명령어
```bash
npm run dev          # 개발 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm run type-check   # tsc --noEmit (package.json에 추가 필요)
```

## Phase 진행 규칙
새로운 Phase 시작 시 반드시 `/dev/active/phase{N}-{name}/` 폴더에 3개 파일 생성:

```
dev/active/phase{N}-{name}/
├── phase{N}-{name}-context.md   ← 결정 이력, 참고 자료, 제약 사항
├── phase{N}-{name}-plan.md      ← 아키텍처 계획, 기술 결정, 설계
└── phase{N}-{name}-tasks.md     ← 작업 목록, 체크리스트, 완료 기록
```

### 파일별 역할
| 파일 | 내용 |
|------|------|
| context.md | 왜 이렇게 결정했는지, 대안 검토, 알려진 제약 |
| plan.md | 무엇을 어떻게 구현할지, 아키텍처, 플로우 |
| tasks.md | 작업 체크리스트, 진행 상태, 완료 기록 |

### Phase 완료 시
- tasks.md에 완료 날짜와 빌드 결과 기록
- `/dev/done/`으로 폴더 이동 (선택)

## 절대 위반 금지
1. 모든 요소 border-radius: 0 — globals.css에서 override
2. box-shadow 절대 금지
3. 모든 폼 react-hook-form + zod 필수
4. Server Component/Route Handler → createServerClient()
5. Client Component → createBrowserClient()
6. SUPABASE_SERVICE_ROLE_KEY 클라이언트 노출 금지
7. 알림 발송 → Supabase Edge Function에서만
8. 권한 검사 → middleware.ts에서 수행
9. DB 쿼리 → src/domains/[도메인]/repository.ts 경유

## DDD 3파일 패턴
```
model.ts → 타입, Zod 스키마
repository.ts → Supabase 쿼리
service.ts → 비즈니스 로직
```
도메인 간 호출: service→service만. repository→repository 직접 호출 금지.

## 알림 흐름
```
상담 신청 → notify-consult Edge Function
  └→ 관리자: 알림톡 / 신청자: SMS
재원생 질문 → notify-question → 멘토: 알림톡
멘토 답변 → notify-answer → 재원생: 알림톡 (active만)
공지 발행(선택) → send-kakao-alimtalk → 재원생/학부모
```

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
