# Implementation Plan: 멘토 질문 관리 UX 개선

**Status**: ⏳ Pending
**Started**: 2026-03-16
**Estimated Time**: 3~4시간

---

## 📋 Overview

### 목표
멘토가 재원생 질문을 빠르고 효율적으로 관리할 수 있도록 /questions 페이지 UX 개선

### 현재 문제점
1. Hero 섹션이 화면의 1/3 차지 (멘토에게 불필요)
2. 질문 클릭 → 상세 진입 → 하단 스크롤 → 답변 작성 → 목록 복귀 (왕복 과다)
3. 미답변 질문의 대기 시간이 한눈에 안 보임

### 개선 방향
1. 스태프용 컴팩트 헤더 + 미답변 통계
2. 인라인 아코디언 답변 (목록에서 바로 답변)
3. 대기 시간 시각적 강조

---

## 🚀 Implementation Phases

### Phase A: 스태프용 컴팩트 헤더
**Estimated Time**: 1시간

#### 현재
```
┌──────────────────────────────┐
│  bg-navy Hero 섹션 (py-16)    │  ← 멘토에게 불필요한 큰 영역
│  "수학 질문방" 타이틀           │
│  설명 텍스트                    │
└──────────────────────────────┘
```

#### 변경 (스태프일 때만)
```
┌──────────────────────────────┐
│  컴팩트 헤더 (py-6)            │
│  "질문 관리" + 미답변 N개 뱃지  │
│  필터: 전체 | 미답변 | 답변완료  │
└──────────────────────────────┘
```

#### Tasks
- [ ] `questions/page.tsx`: `isStaff` 분기 — Hero 대신 컴팩트 헤더 렌더링
  - 제목: "질문 관리"
  - 미답변 수 뱃지 (filteredQuestions에서 계산)
  - 탭 + 필터를 헤더 내부로 통합 (별도 섹션 X)
- [ ] 재원생 UI는 그대로 유지

---

### Phase B: 대기 시간 시각적 강조
**Estimated Time**: 30분

#### 규칙
| 경과 시간 | 색상 | 의미 |
|----------|------|------|
| 1시간 미만 | 기본 (muted) | 정상 |
| 1시간~24시간 | 주황 (orange) | 주의 |
| 24시간 초과 | 빨강 (red) | 긴급 |

#### Tasks
- [ ] `getElapsedLabel(createdAt)` 유틸 함수 생성
  - "방금 전", "3시간 전", "1일 전" 등 한글 표시
  - urgency 레벨 반환: `"normal" | "warning" | "urgent"`
- [ ] QuestionItem (재원생용): 날짜 옆에 경과 시간 표시
- [ ] 스태프 질문 카드: 미답변 질문에 urgency 색상 적용
  - warning: 좌측 border-l-2 border-orange-400
  - urgent: 좌측 border-l-2 border-red-400

---

### Phase C: 인라인 아코디언 답변
**Estimated Time**: 2시간

#### UX 흐름
```
[질문 카드 — 접힌 상태]
├── 상태 뱃지 + 제목 + 작성자 + 경과 시간
├── 내용 미리보기 (2줄)
└── [펼치기] 버튼

[질문 카드 — 펼친 상태]
├── 상태 뱃지 + 제목 + 작성자 + 경과 시간
├── 전체 내용 + 첨부 이미지
├── 기존 답변 목록
├── ─────────────────
├── 답변 작성 폼
│   ├── textarea (6줄)
│   ├── 이미지 업로드
│   └── [답변 등록] 버튼
└── [접기] 버튼
```

#### Tasks
- [ ] 스태프용 `StaffQuestionCard` 컴포넌트 생성
  - Props: `question`, `onAnswered` (답변 후 콜백)
  - 상태: `isExpanded` (아코디언)
  - 접힌 상태: 제목 + 내용 미리보기 2줄 + 경과 시간 + 펼치기 버튼
  - 펼친 상태:
    - 질문 전체 내용 + 첨부 이미지 갤러리
    - 기존 답변 목록 (AnswerCard 재사용)
    - 답변 작성 폼 (AnswerForm 재사용 또는 인라인)
    - 고정/해제 버튼
  - 답변 등록 성공 시: 질문 데이터 새로고침 + `onAnswered()` 호출
  - 클릭 영역: 카드 전체가 아닌 [펼치기/접기] 버튼만 토글
    (제목 클릭 → 상세 페이지 이동 유지)

- [ ] `questions/page.tsx` 수정
  - 스태프: `QuestionItem` 대신 `StaffQuestionCard` 사용
  - 재원생: 기존 `QuestionItem` 유지 (변경 없음)
  - 답변 등록 후 목록 자동 갱신 (`fetchQuestions` 재호출)

- [ ] 답변 폼 로직
  - `questions/[id]/page.tsx`의 `AnswerForm` 컴포넌트를
    `components/questions/AnswerForm.tsx`로 분리하여 재사용
  - 인라인 답변 시 이미지 업로드도 지원

---

## Quality Gate

- [ ] 빌드 & 타입 체크 통과
- [ ] 재원생 화면: 기존과 동일 (Hero + 탭 + 카드 목록)
- [ ] 멘토 화면: 컴팩트 헤더 + 인라인 답변
- [ ] 미답변 24시간 초과 질문에 빨간 강조 표시
- [ ] 인라인 답변 등록 후 질문 상태 즉시 갱신
- [ ] 상세 페이지 답변 폼도 정상 동작 (기존 유지)
- [ ] 모바일에서 인라인 답변 폼 사용 가능

---

## 롤백

- `StaffQuestionCard` 삭제, `isStaff` 분기 제거
- `AnswerForm` 컴포넌트를 `questions/[id]/page.tsx`로 복원
- Hero 섹션 분기 제거
