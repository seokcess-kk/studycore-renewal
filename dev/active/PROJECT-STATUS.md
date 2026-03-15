# STUDYCORE 프로젝트 상태 요약

**최종 업데이트: 2026-03-16**

---

## Phase 진행 현황

| Phase | 이름 | 상태 | 비고 |
|-------|------|------|------|
| 1 | MVP | ✅ 완료 | 인프라, 공통 컴포넌트, 홈페이지 |
| 2 | Auth | ✅ 완료 | 인증, DB 스키마, 도메인 레이어 |
| 3 | Admin | ✅ 완료 | 어드민 레이아웃, 회원 관리 |
| 4 | Content | ✅ 완료 | 블로그, 도시락 도메인 |
| 5 | Functions | ✅ 완료 | Storage, 이미지 업로드, Edge Functions |
| 6 | Contents | ✅ 완료 | 알림 이력, 리뷰, PWA (PWA 제외) |
| 7 | External | ✅ 코드 완료 | 카카오맵 (API 키 대기) |
| 8 | Features | ✅ 완료 | 도시락 재원생 페이지 (출석 취소) |
| 9 | Completion | ✅ 완료 | 관리자 답변, 온보딩 CRUD |
| - | Auth-Fix | ✅ 완료 | 인증 시스템 보안 강화 |

---

## 배포 전 필수 작업

### SQL 마이그레이션 (Supabase)
- [x] `015_add_guide_sections.sql` 실행 ✅
- [x] `017_add_question_visibility.sql` 실행 ✅
- [x] `018_add_staff_credentials.sql` 실행 ✅ (Staff bcrypt 인증)
- [x] `019_add_login_attempts.sql` 실행 ✅ (계정 잠금)
- [x] `020_add_audit_logs.sql` 실행 ✅ (감사 로그)

### 환경변수 설정
- [ ] `NEXT_PUBLIC_KAKAO_MAP_API_KEY` (카카오맵)
- [ ] `SOLAPI_API_KEY`, `SOLAPI_API_SECRET` (SMS)
- [ ] `KAKAO_ALIMTALK_*` 관련 변수들

### 외부 서비스 등록
- [ ] 카카오 개발자 콘솔 앱 등록
- [ ] Solapi 계정 설정
- [ ] 카카오 알림톡 채널 등록

---

## 구현된 주요 기능

### 공개 페이지
- `/` 홈 (Hero, 시스템 소개, 후기, 상담 신청)
- `/about` 소개 (카카오맵 연동)
- `/system` 시스템 안내
- `/blog` 블로그 목록/상세
- `/consult` 상담 신청
- `/reviews` 후기 목록/작성

### 재원생 페이지 (로그인 필요)
- `/login` 로그인 (카카오/아이디)
- `/register` 회원가입
- `/guide` 조교 온보딩 가이드
- `/notices` 공지사항 목록/상세
- `/questions` 질문방 목록/상세/작성 (공개/비공개 설정)
- `/meal` 도시락 신청
- `/my` 마이페이지

### 관리자 페이지 (admin 권한)
- `/admin` 대시보드
- `/admin/members` 회원 관리/상세/상담 기록
- `/admin/notices` 공지사항 CRUD
- `/admin/questions` 질문 관리
- `/admin/questions/[id]` 질문 상세/답변 작성
- `/admin/blog` 블로그 CRUD
- `/admin/meal` 도시락 관리
- `/admin/guide` 온보딩 CRUD
- `/admin/kakao` 알림톡 발송
- `/admin/kakao/history` 발송 이력
- `/admin/settings` 사이트 설정

---

## 도메인 구조

```
src/domains/
├── user/          ← 사용자, 프로필
├── notice/        ← 공지사항
├── question/      ← 질문/답변
├── consultation/  ← 상담 신청
├── counseling/    ← 상담 기록
├── blog/          ← 블로그
├── meal/          ← 도시락 (구 lunch)
├── notification/  ← 알림
├── settings/      ← 사이트 설정
└── guide/         ← 온보딩 가이드 (NEW)
```

---

## 최근 변경사항

### 2026-03-16
- **인증 시스템 보안 강화 (Phase Auth-Fix)**
  - Staff 로그인 bcrypt RPC 기반 보안 강화
  - Race condition 방지 (AbortController)
  - 로그아웃 기능 구현 (Nav.tsx)
  - 상태별 안내 페이지 (`/pending-approval`, `/account-inactive`)
  - 역할 상수 통합 및 헬퍼 함수 (`isStaffRole`, `hasAdminAccess` 등)
  - 구조화된 로깅 시스템 (`src/lib/logger.ts`)
  - 계정 잠금 (5회 실패 시 15분)
  - 세션 만료 경고 (10분 전 알림, `SessionWarning.tsx`)
  - 감사 로그 기본 구조 (`src/lib/audit.ts`)
  - register 페이지 DDD 패턴 적용

- **세션 및 네비게이션 개선**
  - 클라이언트-서버 세션 쿠키 동기화 문제 수정 (storageKey 제거)
  - 로그인 상태에 따른 Nav 메뉴 분기 (재원생 메뉴 / 홈페이지 메뉴)
  - 로그인 후 리다이렉트 기본값 홈 화면으로 변경
  - 코드 리뷰 개선: console → logger, computeRoleState 헬퍼 추출

### 2026-03-15
- **질문방 공개/비공개 기능 (Phase 8 Stage 5)**
  - DB: `questions.is_public` 컬럼 추가
  - RLS: 공개 질문/답변 열람 정책 추가
  - 질문 작성 시 공개 설정 체크박스
  - `/questions`: "전체 공개" / "내 질문" 탭 추가
  - `/my`: "내 질문" 탭 추가
  - 질문 카드에 공개/비공개 뱃지 표시
  - `017_add_question_visibility.sql` 마이그레이션

### 2025-03-15
- **Phase 9 완료**
  - 관리자 질문 상세/답변 페이지 (`/admin/questions/[id]`)
  - 온보딩 CRUD DB 연동 (`/admin/guide`)
  - guide 도메인 생성 (model, repository, service)
  - `015_add_guide_sections.sql` 마이그레이션

- **리팩토링**
  - lunch 도메인 → meal 도메인으로 이름 변경
  - 타임존 안전 날짜 처리 (`getLocalToday()`)

---

## 다음 단계

### 즉시 가능
1. ~~기존 Staff 계정 비밀번호 마이그레이션~~ ✅ 완료 (admin, mentor, assistant)
2. 기능 테스트 (인증, 관리자 답변, 온보딩 CRUD, 질문방 공개/비공개)
3. Vercel 배포

### 외부 의존성 대기
1. 카카오 API 키 발급 → 카카오맵 활성화
2. Solapi 설정 → SMS/알림톡 활성화
3. 카카오 채널 등록 → 알림톡 템플릿 등록

### 선택적 개선
1. PWA 매니페스트 설정
2. 드래그앤드롭 순서 변경 (온보딩)
3. 성능 최적화 (이미지 lazy loading 등)
