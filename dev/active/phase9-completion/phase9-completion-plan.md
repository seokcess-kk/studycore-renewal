# Phase 9 Completion - Plan

**버전: 1.0**
**작성일: 2025-03-15**

---

## 1. 개요

Phase 9는 미구현 기능 완성 단계입니다.

### 목표
1. 관리자 답변 기능 (질문 상세 + 답변 작성)
2. 조교 온보딩 CRUD (DB 연동)

### 예상 산출물
- SQL 마이그레이션 1개
- 도메인 코드 1세트 (guide)
- 신규 페이지 1개
- 페이지 수정 1개

---

## 2. 아키텍처

### 2.1 관리자 답변 기능

```
/admin/questions
    │
    └─► 클릭 → /admin/questions/[id]  (NEW)
              │
              ├─► 질문 정보 표시
              ├─► 첨부 이미지 갤러리
              ├─► 답변 목록 표시
              └─► 답변 작성 폼 (관리자/멘토만)
                  ├─► 내용 입력
                  ├─► 이미지 첨부 (ImageUploader)
                  └─► 등록 버튼 → createAnswer()
```

### 2.2 조교 온보딩 CRUD

```
/admin/guide
    │
    ├─► 섹션 목록 (DB에서 조회)
    │
    ├─► 섹션 추가
    │       └─► createSection() → INSERT
    │
    ├─► 섹션 수정
    │       └─► updateSection() → UPDATE
    │
    └─► 섹션 삭제
            └─► deleteSection() → DELETE
```

---

## 3. DB 스키마

### guide_sections 테이블

```sql
CREATE TABLE guide_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_guide_sections_order ON guide_sections(order_index);

-- RLS
ALTER TABLE guide_sections ENABLE ROW LEVEL SECURITY;

-- 정책: 관리자/조교/멘토 조회
CREATE POLICY "staff_read_guide" ON guide_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'assistant', 'mentor')
    )
  );

-- 정책: 관리자만 CRUD
CREATE POLICY "admin_manage_guide" ON guide_sections
  FOR ALL USING (is_admin());
```

---

## 4. 파일 구조

```
src/
├── app/
│   └── admin/
│       ├── questions/
│       │   └── [id]/
│       │       └── page.tsx      ← NEW: 관리자 질문 상세
│       └── guide/
│           └── page.tsx          ← MODIFY: DB 연동
│
├── domains/
│   └── guide/
│       ├── model.ts              ← NEW
│       ├── repository.ts         ← NEW
│       └── service.ts            ← NEW
│
└── supabase/
    └── migrations/
        └── 013_add_guide_sections.sql  ← NEW
```

---

## 5. 구현 단계

### Stage 1: 관리자 답변 기능

**작업:**
1. `/admin/questions/[id]/page.tsx` 생성
   - 질문 상세 표시
   - 첨부 이미지 갤러리
   - 답변 목록 표시
   - 답변 작성 폼 (react-hook-form + zod)
   - ImageUploader 연동
   - 답변 생성 시 `createAnswer()` 호출

2. `/admin/questions/page.tsx` 수정
   - 링크 경로 `/questions?id=` → `/admin/questions/`로 변경

### Stage 2: 조교 온보딩 CRUD

**작업:**
1. `013_add_guide_sections.sql` 마이그레이션
   - 테이블 생성
   - 인덱스
   - RLS 정책
   - updated_at 트리거

2. `src/domains/guide/` 도메인 코드
   - `model.ts`: GuideSection 타입, Zod 스키마
   - `repository.ts`: CRUD 쿼리
   - `service.ts`: 비즈니스 로직

3. `/admin/guide/page.tsx` 수정
   - mock 데이터 제거
   - DB 조회/생성/수정/삭제 연동
   - 로딩/에러 상태 처리

---

## 6. 검증 체크리스트

### Stage 1 완료 조건
- [ ] 관리자 질문 상세 페이지 표시
- [ ] 답변 작성 폼 동작
- [ ] 이미지 첨부 동작
- [ ] 답변 등록 시 상태 'answered'로 변경
- [ ] 답변 등록 시 알림 발송

### Stage 2 완료 조건
- [ ] SQL 마이그레이션 준비
- [ ] 섹션 목록 DB 조회
- [ ] 섹션 추가 동작
- [ ] 섹션 수정 동작
- [ ] 섹션 삭제 동작
- [ ] 빌드 성공

---

## 7. 예상 일정

| 단계 | 기능 | 규모 |
|------|------|------|
| Stage 1 | 관리자 답변 기능 | 중 |
| Stage 2 | 조교 온보딩 CRUD | 소 |
