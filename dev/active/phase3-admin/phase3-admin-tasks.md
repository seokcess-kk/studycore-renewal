# Phase 3 Admin 작업 목록

**상태: 완료 (90%)**
**기간: 2025-03-15**

---

## 데이터베이스

- [x] counseling_records 테이블 생성 (004_add_counseling_records.sql)
- [x] site_settings 테이블 생성 (005_add_site_settings.sql)
- [x] 초기 설정값 삽입
- [x] RLS 정책 설정
- [ ] Storage 버킷 생성 → Phase 4

## 도메인 레이어

- [x] src/domains/counseling/ (model + repository + service)
- [x] src/domains/settings/ (model + repository + service)

## 어드민 레이아웃

- [x] /admin/layout.tsx — 사이드바 + 헤더 + 에러 바운더리
- [x] `<AdminSidebar />` — 네비게이션 메뉴
- [x] `<AdminHeader />` — 브레드크럼
- [x] `<AdminErrorBoundary />` — 에러 바운더리

## 어드민 공통 컴포넌트

- [x] `<AdminCard />` — 통계 카드
- [x] `<ConfirmModal />` — 확인 모달
- [x] `<StatusBadge />` — 상태 뱃지
- [x] `<RoleBadge />` — 역할 뱃지
- [ ] `<AdminTable />` — TanStack Table 래퍼 → 필요시 구현
- [ ] `<ImageUploader />` — 이미지 업로드 → 추후
- [ ] `<FileAttachment />` — 파일 첨부 → 추후

## 대시보드

- [x] /admin/page.tsx — 대시보드 메인
- [x] 통계 카드 (상담, 승인대기, 질문, 재원생)
- [x] 최근 활동 목록 (상담, 질문, 가입)

## 회원 관리

- [x] /admin/members/page.tsx — 회원 목록
- [x] 테이블 + 검색 + 필터 구현
- [x] 역할/상태 필터
- [x] /admin/members/[id]/page.tsx — 회원 상세
- [x] 상태 변경 기능 (pending → active → inactive)
- [x] /admin/members/[id]/consult/page.tsx — 상담 기록
- [x] 상담 기록 작성 폼
- [x] /admin/members/new/page.tsx — 스태프 계정 생성 UI

## 공지 관리

- [x] /admin/notices/page.tsx — 공지 목록
- [x] /admin/notices/new/page.tsx — 공지 작성
- [x] /admin/notices/[id]/edit/page.tsx — 공지 수정
- [x] 카테고리 선택 (general, urgent, material, schedule, event)
- [x] 상단 고정 옵션
- [x] 알림톡 발송 옵션 UI

## 질문 관리

- [x] /admin/questions/page.tsx — 질문 목록
- [x] 미답변 필터
- [ ] 관리자 답변 기능 → 질문 상세 페이지와 함께 추후

## 사이트 설정

- [x] /admin/settings/page.tsx — 설정 페이지
- [x] 메뉴 노출 토글 (about, blog, reviews, system)
- [x] SMS 템플릿 편집

## 조교 온보딩

- [x] /admin/guide/page.tsx — 온보딩 문서 페이지
- [ ] 문서 섹션 CRUD → 추후
- [ ] 파일 첨부 → 추후

## 신규 가입 페이지

- [x] /register/page.tsx — 카카오 신규 가입 추가 정보
- [x] 폼 구현 (이름, 전화번호, 학교, 학년, 학부모 연락처)
- [x] /auth/callback 리다이렉트 로직 (middleware)
- [x] 승인 대기 안내 페이지

## Edge Functions → Phase 4

- [ ] send-kakao-alimtalk/ — 공통 알림톡 발송
- [ ] notify-consult/ — 상담 신청 알림
- [ ] notify-question/ — 질문 등록 알림
- [ ] notify-answer/ — 답변 등록 알림

## 검증

- [x] npm run build 0 에러
- [x] npm run lint 통과 (0 에러, 0 경고)
- [x] 서버/클라이언트 권한 검사 구현 (middleware + layout)
- [ ] 실제 환경 테스트 (Supabase 연동)
- [ ] 알림톡 발송 테스트 → Phase 4

---

## 코드 개선 (2025-03-15)

- [x] middleware.ts - `users` → `profiles` 테이블 사용
- [x] middleware.ts - 멘토 역할 어드민 접근 허용
- [x] useUserStore.ts - `canAccessAdmin`, `isMentor` 속성 추가
- [x] admin/layout.tsx - `canAccessAdmin` 사용 + `AdminErrorBoundary` 적용
- [x] counseling/repository.ts - Supabase 조인 타입 캐스팅 통일
- [x] ErrorBoundary.tsx - 에러 바운더리 컴포넌트 추가

---

## 진행 상태

| 영역 | 상태 | 비고 |
|------|------|------|
| 데이터베이스 | ✅ 완료 | Storage 버킷 제외 |
| 도메인 레이어 | ✅ 완료 | counseling, settings |
| 어드민 레이아웃 | ✅ 완료 | 에러 바운더리 포함 |
| 대시보드 | ✅ 완료 | |
| 회원 관리 | ✅ 완료 | |
| 공지 관리 | ✅ 완료 | |
| 질문 관리 | ⚠️ 부분 완료 | 답변 기능 추후 |
| 설정 | ✅ 완료 | |
| 온보딩 | ⚠️ 부분 완료 | CRUD 추후 |
| /register | ✅ 완료 | |
| Edge Functions | ⏸️ 대기 | Phase 4 |

---

## 구현된 파일 목록

### SQL Migrations
- `supabase/migrations/004_add_counseling_records.sql`
- `supabase/migrations/005_add_site_settings.sql`

### Domain Layer
- `src/domains/counseling/model.ts`
- `src/domains/counseling/repository.ts`
- `src/domains/counseling/service.ts`
- `src/domains/settings/model.ts`
- `src/domains/settings/repository.ts`
- `src/domains/settings/service.ts`

### Admin Components
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/AdminHeader.tsx`
- `src/components/admin/AdminCard.tsx`
- `src/components/admin/StatusBadge.tsx`
- `src/components/admin/RoleBadge.tsx`
- `src/components/admin/ConfirmModal.tsx`

### Common Components
- `src/components/common/ErrorBoundary.tsx`

### Admin Pages
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/members/page.tsx`
- `src/app/admin/members/[id]/page.tsx`
- `src/app/admin/members/[id]/consult/page.tsx`
- `src/app/admin/members/new/page.tsx`
- `src/app/admin/notices/page.tsx`
- `src/app/admin/notices/new/page.tsx`
- `src/app/admin/notices/[id]/edit/page.tsx`
- `src/app/admin/questions/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/app/admin/guide/page.tsx`

### Other Pages
- `src/app/register/page.tsx`

### Modified Files
- `src/middleware.ts` (profiles 테이블, 멘토 역할 허용)
- `src/stores/useUserStore.ts` (canAccessAdmin, isMentor 추가)
- `src/lib/supabase/client.ts` (createBrowserClient 별칭 추가)
- `src/lib/utils.ts` (formatDistanceToNow, formatDate 등 추가)
- `src/components/common/Toast.tsx` (object 포맷 지원)
- `src/domains/notice/model.ts` (is_pinned/is_published optional 변경)

---

## 다음 단계 (Phase 4)

### 우선순위 높음
- Edge Functions (알림 발송)
- Storage 버킷 설정
- /blog — 블로그 SSG + ISR
- /admin/blog — 블로그 관리

### 우선순위 중간
- /admin/lunch — 도시락 관리
- /my 도시락 신청 탭
- /admin/kakao — 수동 알림톡

### 우선순위 낮음
- /guide — 신입생 안내
- /about, /reviews — 콘텐츠 준비 후
- 관리자 답변 기능
- 조교 온보딩 CRUD
