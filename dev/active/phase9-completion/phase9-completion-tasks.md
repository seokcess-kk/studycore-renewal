# Phase 9 Completion - Tasks

**상태: 코드 구현 완료**
**작성일: 2025-03-15**
**완료일: 2025-03-15**

---

## Stage 1: 관리자 답변 기능 ✅ 완료

### 페이지 생성
- [x] src/app/admin/questions/[id]/page.tsx
  - [x] 질문 상세 정보 표시 (제목, 내용, 작성자, 시간)
  - [x] 첨부 이미지 갤러리 (직접 구현)
  - [x] 답변 목록 표시 (작성자 역할 뱃지)
  - [x] 답변 작성 폼 (react-hook-form + zod)
  - [x] 이미지 첨부 (ImageUploader)
  - [x] 등록 버튼 → createAnswer() 호출
  - [x] 성공 시 토스트 + 목록 새로고침
  - [x] 뒤로가기 버튼

### 페이지 수정
- [x] src/app/admin/questions/page.tsx
  - [x] 링크 href: `/questions?id=${id}` → `/admin/questions/${id}`

### 테스트
- [ ] 질문 상세 조회 확인
- [ ] 답변 작성 확인
- [ ] 이미지 첨부 확인
- [ ] 상태 변경 확인 (pending → answered)

---

## Stage 2: 조교 온보딩 CRUD ✅ 완료

### DB 마이그레이션
- [x] supabase/migrations/015_add_guide_sections.sql
  - [x] guide_sections 테이블 생성
  - [x] order_index 인덱스
  - [x] RLS 활성화
  - [x] staff_read_guide 정책 (관리자/조교/멘토 조회)
  - [x] admin_manage_guide 정책 (관리자 CRUD)
  - [x] updated_at 트리거
  - [x] 초기 데이터 시드

### 도메인 코드
- [x] src/domains/guide/model.ts
  - [x] GuideSection 타입
  - [x] CreateGuideSectionInput 타입
  - [x] UpdateGuideSectionInput 타입
  - [x] Zod 스키마
  - [x] 서비스 결과 타입

- [x] src/domains/guide/repository.ts
  - [x] getSections()
  - [x] getVisibleSections()
  - [x] getSectionById()
  - [x] createSection()
  - [x] updateSection()
  - [x] deleteSection()
  - [x] updateSectionOrders()

- [x] src/domains/guide/service.ts
  - [x] getSectionList()
  - [x] getVisibleSectionList()
  - [x] createSection()
  - [x] updateSection()
  - [x] deleteSection()
  - [x] updateSectionOrders()

### 페이지 수정
- [x] src/app/admin/guide/page.tsx
  - [x] mock 데이터 제거
  - [x] useEffect로 DB 조회
  - [x] handleAdd → createSection() 호출
  - [x] handleSaveEdit → updateSection() 호출
  - [x] handleDelete → deleteSection() 호출
  - [x] 로딩 상태 처리
  - [x] 에러 상태 처리
  - [x] 토스트 피드백

### 테스트
- [ ] 섹션 목록 조회 확인
- [ ] 섹션 추가 확인
- [ ] 섹션 수정 확인
- [ ] 섹션 삭제 확인

---

## 진행 상태 요약

| Stage | 기능 | 상태 | 비고 |
|-------|------|------|------|
| 1 | 관리자 답변 기능 | ✅ 완료 | 2025-03-15 |
| 2 | 조교 온보딩 CRUD | ✅ 완료 | 2025-03-15 |

---

## 빌드 결과

```
✓ Compiled successfully
✓ Generating static pages (35/35)

새로 추가된 라우트:
├ ƒ /admin/questions/[id]  ← NEW

빌드 성공: 2025-03-15
```

---

## 배포 체크리스트

### Stage 1 배포
- [x] 빌드 테스트
- [ ] /admin/questions/[id] 접근 확인

### Stage 2 배포
- [ ] SQL 마이그레이션 실행 (`015_add_guide_sections.sql`)
- [ ] /admin/guide DB 연동 확인

---

## 생성된 파일

```
신규 파일:
├── src/app/admin/questions/[id]/page.tsx
├── src/domains/guide/model.ts
├── src/domains/guide/repository.ts
├── src/domains/guide/service.ts
└── supabase/migrations/015_add_guide_sections.sql

수정된 파일:
├── src/app/admin/questions/page.tsx (링크 수정)
└── src/app/admin/guide/page.tsx (DB 연동)
```

---

## 코드 리뷰 수정 (2025-03-15)

- [x] 미사용 `createAnswerSchema` import 제거
- [x] 이미지 key prop 개선 (`url` → `question-img-${index}`)
- [x] 이미지 모달 클릭 이벤트 전파 방지 (stopPropagation)
- [x] `is_admin()` 함수 확인 완료 (002_rls_policies.sql에 존재)
