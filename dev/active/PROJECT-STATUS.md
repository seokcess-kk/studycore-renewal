# STUDYCORE 프로젝트 상태 요약

**최종 업데이트: 2026-03-18**

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
| - | UX-Fix | ✅ 완료 | 역할별 메뉴 권한, 로그아웃 수정 |
| - | Auth-Security | ✅ 완료 | 리다이렉트 검증, OAuth 분기 통합, 서버 보호 |
| - | Enhancements v2 | ✅ 완료 | 12개 기능 개선 (Phase 0~7) |
| - | Auth-Persist | ✅ 완료 | Zustand sessionStorage persist |
| - | Question UX | ✅ 완료 | 질문방 CRUD 권한 보완 + 멘토 UX 개선 |
| - | Role Separation | ✅ 완료 | 온보딩/매뉴얼 분리, 스태프 계정 생성 API |
| - | OAuth Fix | ✅ 완료 | 카카오 PKCE 에러 수정 (route handler) |
| 12 | UI Polish | ✅ 완료 | UI 세부 폴리싱 — 반응형, 버튼, 터치 영역, 일관성 |

---

## 배포 전 필수 작업

### SQL 마이그레이션 (Supabase)
- [x] `015_add_guide_sections.sql` ✅
- [x] `017_add_question_visibility.sql` ✅
- [x] `018_add_staff_credentials.sql` ✅
- [x] `019_add_login_attempts.sql` ✅
- [x] `020_add_audit_logs.sql` ✅
- [ ] `021_add_change_password_rpc.sql` (비밀번호 변경 RPC)
- [ ] `022_add_search_indexes.sql` (full-text 검색 인덱스)
- [ ] `023_cleanup_test_accounts.sql` (테스트 계정 정리)
- [ ] `024_add_question_pinned_and_fix_storage.sql` (질문 고정 + 이미지 RLS)
- [ ] `025_fix_question_rls.sql` (질문/답변 DELETE 정책)
- [ ] `026_add_guide_section_type.sql` (온보딩/매뉴얼 type 컬럼)
- [ ] `038_enhance_guide_sections.sql` (category, icon, content_html 컬럼)

### 환경변수 설정
- [x] `NEXT_PUBLIC_SUPABASE_URL` ✅
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (스태프 계정 생성 API용)
- [ ] `NEXT_PUBLIC_KAKAO_MAP_API_KEY` (카카오맵)
- [ ] `SOLAPI_API_KEY`, `SOLAPI_API_SECRET` (SMS)
- [ ] `KAKAO_ALIMTALK_*` 관련 변수들

### 외부 서비스 등록
- [ ] 카카오 개발자 콘솔 앱 등록 (OAuth + 카카오맵)
- [ ] Solapi 계정 설정
- [ ] 카카오 알림톡 채널 등록

---

## 구현된 주요 기능

### 공개 페이지
- `/` 홈 (Hero, Features, SpaceSlider, FAQ, CTA)
- `/about` 소개 (카카오맵 연동)
- `/system` 시스템 안내
- `/blog` 블로그 목록/상세 (OG 이미지 자동 생성)
- `/consult` 상담 신청
- `/reviews` 후기 목록/작성

### 재원생 페이지 (로그인 필요)
- `/login` 로그인 (카카오 OAuth / Staff 아이디)
- `/register` 회원가입 (카카오 추가 정보)
- `/manual` 이용 매뉴얼 (DB 기반)
- `/notices` 공지사항 목록/상세
- `/questions` 질문방 목록/상세/작성 (공개/비공개, 고정)
- `/meal` 도시락 신청
- `/my` 마이페이지 (프로필, 내 질문, 도시락)

### 스태프 페이지
- `/guide` 조교 온보딩 가이드 (DB 기반)
- `/questions` 질문 관리 (스태프 컴팩트 뷰, 인라인 답변)
- `/questions/[id]` 질문 상세 + 답변 작성 + 고정/해제
- `/my` 마이페이지 (비밀번호 변경, 질문방 관리 바로가기)

### 관리자 페이지 (admin + mentor)
- `/admin` 대시보드
- `/admin/members` 회원 관리/상세/상담 기록
- `/admin/members/new` 스태프 계정 생성 (API 연동)
- `/admin/notices` 공지사항 CRUD (리치텍스트 에디터)
- `/admin/questions` 질문 관리 (뱃지, 고정)
- `/admin/blog` 블로그 CRUD
- `/admin/meal` 도시락 관리
- `/admin/guide` 온보딩/매뉴얼 CRUD (탭 전환)
- `/admin/kakao` 알림톡 발송/이력
- `/admin/settings` 사이트 설정

---

## 역할별 메뉴

| 역할 | Nav 메뉴 |
|------|---------|
| 비로그인 | 특징, 시설, FAQ, 로그인, 무료 상담 신청 |
| 재원생 (active) | 공지사항, 질문방, 도시락, **매뉴얼**, 마이페이지 |
| 조교 | 공지사항, 질문방, **온보딩**, 마이페이지 |
| 멘토 | 공지사항, 질문방, **온보딩**, 마이페이지, 관리자 |
| 관리자 | 공지사항, 질문방, **온보딩**, 마이페이지, 관리자 |

---

## 도메인 구조

```
src/domains/
├── user/          ← 사용자, 프로필, 로그인/로그아웃
├── notice/        ← 공지사항
├── question/      ← 질문/답변 (고정, 공개/비공개)
├── consultation/  ← 상담 신청
├── counseling/    ← 상담 기록
├── blog/          ← 블로그
├── meal/          ← 도시락
├── review/        ← 후기
├── notification/  ← 알림
├── settings/      ← 사이트 설정
├── guide/         ← 온보딩/매뉴얼 (type 구분)
└── search/        ← 통합 검색
```

---

## 최근 변경사항

### 2026-03-18
- **가이드/매뉴얼 UI 개선**
  - DB: guide_sections에 category, icon, content_html 컬럼 추가 (038 마이그레이션)
  - 공개 페이지: 사이드바 TOC + 검색 + 카테고리 그룹핑 + 이전/다음 네비게이션 (GuidePageLayout)
  - 관리자: textarea → Tiptap RichTextEditor, 카테고리/아이콘 선택 UI, 표시/숨김 토글
  - /guide, /manual 페이지를 GuidePageLayout 공용 컴포넌트로 통합
  - 하위 호환: content_html null이면 기존 content 플레인텍스트 fallback

- **Phase 12: UI 세부 폴리싱**
  - 질문방: 모바일 floating "질문하기" 버튼 추가, 필터 터치 영역 확대
  - 도시락: DateSelector sticky 첫 번째 열, 체크박스 크기 통일, "(전체)" 시각화
  - 어드민: 사이드바 반응형 (lg 미만 햄버거 + 오버레이 + scroll lock)
  - 어드민 헤더: 모바일 좌측 패딩 (햄버거 겹침 방지)
  - 마이페이지: 수정/저장 버튼 크기·스타일 개선, 로그아웃 여백 분리
  - 모바일 메뉴: CTA "무료 상담 신청" 상단 배치
  - 공지 상세: 첨부파일 패딩 대칭, 도시락 카드 패딩 통일
  - 아바타: 삭제/업로드 버튼 크기 통일 (w-7)

### 2026-03-16 (4차)
- **Zustand sessionStorage persist**
  - 페이지 리로드 시 store 즉시 복원 → 로그인 관련 타이밍 문제 근본 해결
  - AuthInitializer: "복원" → "검증" 역할로 단순화

- **질문방 CRUD 권한 보완**
  - DELETE RLS 정책 추가 (questions, question_answers)
  - 서비스에 소유자 확인 추가 (updateQuestion, deleteQuestion)
  - 공개 질문 이미지 조회 정책, 답변 삭제 시 상태 롤백
  - 관리자 목록 repository 경유로 변경

- **멘토 질문 관리 UX 개선**
  - 스태프 컴팩트 헤더 (Hero 제거, 미답변 통계)
  - 대기 시간 시각 강조 (1h 주황, 24h 빨강)
  - 인라인 아코디언 답변 (StaffQuestionCard)
  - AnswerForm 공유 컴포넌트 분리

- **온보딩/매뉴얼 분리**
  - guide_sections.type 컬럼 (onboarding/manual)
  - /guide: 조교 온보딩, /manual: 재원생 매뉴얼
  - /admin/guide: 탭으로 온보딩/매뉴얼 전환 관리

- **스태프 계정 생성 API**
  - /api/admin/create-staff (Service Role, RLS 우회)
  - 초기 비밀번호 1234, Auth + profiles + staff_credentials 동시 생성

- **카카오 OAuth PKCE 수정**
  - /auth/callback: page.tsx → route.ts (서버 Route Handler)

- **UI 개선**
  - Nav: 홈 외 페이지 어두운 텍스트 모드 (isDarkText)
  - MobileMenu: Framer Motion stagger 애니메이션
  - Hero, Features, SpaceSlider, 상담 페이지 스타일 개선

### 2026-03-16 (3차)
- 인증 보안 개선 (Auth-Security)
- 로그인 흐름 수정
- 테스트 계정 정리

### 2026-03-16 (2차)
- 역할별 메뉴 권한 분기
- 로그아웃 동작 통일

---

## 다음 단계

### 미실행 마이그레이션
- [ ] `021_add_change_password_rpc.sql`
- [ ] `022_add_search_indexes.sql`
- [ ] `023_cleanup_test_accounts.sql`
- [ ] `024_add_question_pinned_and_fix_storage.sql`
- [ ] `025_fix_question_rls.sql`
- [ ] `026_add_guide_section_type.sql`
- [ ] `038_enhance_guide_sections.sql`

### 즉시 가능
1. Vercel 환경변수 설정 (`SUPABASE_SERVICE_ROLE_KEY`)
2. 위 마이그레이션 실행
3. 기능 테스트 (카카오 로그인, 질문 CRUD, 계정 생성)

### 외부 의존성 대기
1. 카카오 API 키 발급 → OAuth + 카카오맵
2. Solapi 설정 → SMS/알림톡
3. 카카오 채널 등록 → 알림톡 템플릿
