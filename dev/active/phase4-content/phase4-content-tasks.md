# Phase 4 Content 작업 목록

**상태: 완료**
**기간: 2025-03-15**

---

## 1단계: 데이터베이스 + 도메인

### SQL 마이그레이션
- [x] 006_add_blog_posts.sql
  - [x] blog_posts 테이블
  - [x] 인덱스 (slug, published)
  - [x] RLS 정책
- [x] 007_add_lunch_system.sql
  - [x] lunch_periods 테이블
  - [x] lunch_applications 테이블
  - [x] RLS 정책

### Blog 도메인
- [x] src/domains/blog/model.ts
- [x] src/domains/blog/repository.ts
- [x] src/domains/blog/service.ts

### Lunch 도메인
- [x] src/domains/lunch/model.ts
- [x] src/domains/lunch/repository.ts
- [x] src/domains/lunch/service.ts

### Notification 도메인
- [x] src/domains/notification/model.ts
- [x] src/domains/notification/repository.ts
- [x] src/domains/notification/service.ts

---

## 2단계: 블로그 시스템

### 공개 페이지
- [x] /blog/page.tsx — 목록
  - [x] 썸네일, 제목, 요약, 날짜
  - [x] 태그 필터
  - [x] 페이지네이션
- [x] /blog/[slug]/page.tsx — 상세
  - [x] Markdown 렌더링 (react-markdown)
  - [x] 이전/다음 포스트

### 어드민 페이지
- [x] /admin/blog/page.tsx — 포스트 목록
  - [x] 발행/임시저장 필터
  - [x] 수정/삭제
- [x] /admin/blog/new/page.tsx — 포스트 작성
  - [x] Markdown 에디터
  - [x] 슬러그 자동 생성
  - [x] 태그 입력
- [x] /admin/blog/[id]/edit/page.tsx — 포스트 수정
  - [x] 네이버 복사 버튼

---

## 3단계: 도시락 관리

### 어드민 페이지
- [x] /admin/lunch/page.tsx
  - [x] 기간 목록
  - [x] 기간 생성/수정 모달
  - [x] 신청 현황 테이블
  - [x] 엑셀 다운로드

### 마이페이지 탭
- [x] /my 도시락 신청 탭
  - [x] 활성 기간 확인
  - [x] 요일별 선택 UI
  - [x] 날짜별 선택 UI
  - [x] 중식/석식 토글
  - [x] 신청/수정 저장

---

## 4단계: 알림 시스템

### Edge Functions (구조만)
- [x] 도메인 레이어 구현 (notification/)
  - [x] 수신자 조회 로직
  - [x] Edge Function 호출 인터페이스

### 어드민 페이지
- [ ] /admin/kakao/page.tsx → Phase 5 (알림톡 템플릿 심사 후)

---

## 5단계: 콘텐츠 페이지

### 신입생 안내
- [x] /guide/page.tsx
  - [x] 아코디언 섹션
  - [x] 다운로드 섹션 (placeholder)

### 소개/후기
- [ ] /about/page.tsx — 콘텐츠 준비 후
- [ ] /reviews/page.tsx — 콘텐츠 준비 후

---

## 6단계: 마무리

### 기능 완성
- [ ] Storage 버킷 생성 → Phase 5
- [ ] 질문 답변 기능 → Phase 5
- [ ] Edge Functions 배포 → Phase 5

### 검증
- [x] npm run build 0 에러
- [x] npm run lint 0 에러 (2 경고 - React Hook Form 호환성)

---

## 진행 상태

| 영역 | 상태 | 비고 |
|------|------|------|
| 데이터베이스 | ✅ 완료 | SQL 마이그레이션 2개 |
| 도메인 레이어 | ✅ 완료 | blog, lunch, notification |
| 블로그 | ✅ 완료 | /blog, /admin/blog |
| 도시락 | ✅ 완료 | /admin/lunch, /my 탭 |
| 알림 시스템 | ⚠️ 부분 완료 | 도메인만, Edge Functions는 Phase 5 |
| 콘텐츠 페이지 | ⚠️ 부분 완료 | /guide만, about/reviews는 추후 |
| Storage | ⏸️ 대기 | Phase 5 |

---

## 구현된 파일 목록

### SQL Migrations
- `supabase/migrations/006_add_blog_posts.sql`
- `supabase/migrations/007_add_lunch_system.sql`

### Domain Layer
- `src/domains/blog/model.ts`
- `src/domains/blog/repository.ts`
- `src/domains/blog/service.ts`
- `src/domains/lunch/model.ts`
- `src/domains/lunch/repository.ts`
- `src/domains/lunch/service.ts`
- `src/domains/notification/model.ts`
- `src/domains/notification/repository.ts`
- `src/domains/notification/service.ts`

### Pages
- `src/app/blog/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/app/admin/blog/page.tsx`
- `src/app/admin/blog/new/page.tsx`
- `src/app/admin/blog/[id]/edit/page.tsx`
- `src/app/admin/lunch/page.tsx`
- `src/app/guide/page.tsx`

### Modified Files
- `src/app/my/page.tsx` (도시락 신청 탭 추가)
- `src/components/admin/AdminHeader.tsx` (props 지원)
- `src/components/admin/StatusBadge.tsx` (labels prop)
- `src/components/admin/ConfirmModal.tsx` (message 별칭)
- `src/components/common/Toast.tsx` (showToast 추가)

### NPM Packages Added
- `react-markdown`
- `remark-gfm`
- `xlsx`

---

## 다음 단계 (Phase 5)

### 우선순위 높음
- Storage 버킷 설정 (blog-thumbnails 등)
- Edge Functions 배포 (알림톡/SMS)
- 질문 답변 기능 완성

### 우선순위 중간
- /admin/kakao — 수동 알림톡 (템플릿 심사 후)
- 블로그 SEO 최적화 (SSG → ISR)

### 우선순위 낮음
- /about, /reviews — 콘텐츠 준비 후
- 실제 알림 발송 테스트
