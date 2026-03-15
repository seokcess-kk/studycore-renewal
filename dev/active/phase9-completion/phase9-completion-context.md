# Phase 9 Completion - Context

**버전: 1.0**
**작성일: 2025-03-15**

---

## 1. 배경

Phase 1-8에서 대부분의 기능이 구현되었습니다.
Phase 9에서는 남은 미구현 기능 2가지를 완성합니다.

### 목표
1. 관리자 답변 기능 완성
2. 조교 온보딩 CRUD 완성

---

## 2. 현재 상태 분석

### 2.1 관리자 답변 기능

**이미 구현됨:**
- `src/domains/question/` 도메인 전체 (model, repository, service)
- `createAnswer`, `updateAnswer`, `deleteAnswer` 서비스 함수
- `/questions/[id]` 재원생용 질문 상세 페이지
- 답변 알림 Edge Function (`notify-answer`)

**미구현:**
- `/admin/questions/[id]` 관리자용 질문 상세 페이지
- 관리자 답변 작성/수정/삭제 UI

**현재 문제:**
- `/admin/questions`에서 클릭 시 `/questions?id={id}`로 이동 (재원생 페이지)
- 관리자 전용 답변 작성 UI 없음

### 2.2 조교 온보딩 CRUD

**이미 구현됨:**
- `/admin/guide` 페이지 UI (추가/수정/삭제 폼)
- 로컬 state 기반 CRUD 동작

**미구현:**
- `guide_sections` DB 테이블
- `src/domains/guide/` 도메인 코드
- DB 연동

**현재 문제:**
- mock 데이터 사용 (하드코딩)
- 새로고침 시 데이터 사라짐

---

## 3. 기술적 결정

### 3.1 관리자 질문 상세 페이지

- 기존 `/questions/[id]` 컴포넌트 재사용
- 관리자 전용 답변 작성 폼 추가
- 이미지 첨부 지원 (ImageUploader 사용)

### 3.2 조교 온보딩 DB 구조

```sql
CREATE TABLE guide_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 RLS 정책

- `guide_sections`: 관리자/조교 조회, 관리자만 CRUD

---

## 4. 제약 사항

- 드래그앤드롭 순서 변경은 선택적 (복잡도 증가)
- 기존 UI 최대한 활용하여 구현 시간 최소화

---

## 5. 의존성

### 기존 코드
- `src/domains/question/` 도메인 전체
- `src/components/common/ImageUploader.tsx`
- `src/components/admin/` 공통 컴포넌트

### 신규 마이그레이션
- `013_add_guide_sections.sql`
