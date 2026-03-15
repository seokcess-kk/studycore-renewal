# Phase 8 Features - Tasks

**상태: 완료**
**기간: 2025-03-15**

---

## Stage 1: 도시락 재원생 페이지 ✅ 완료

### 패키지 확인
- [x] xlsx 패키지 확인 (이미 설치됨)

### 페이지 생성
- [x] src/app/(member)/meal/page.tsx
  - [x] 활성 기간 조회 (getStudentMealPlan)
  - [x] 기존 신청 조회 (getStudentMealPlan)
  - [x] 요일별 선택 UI (WeekdaySelector)
  - [x] 날짜별 선택 UI (DateSelector)
  - [x] 신청/수정 버튼
  - [x] 로딩/에러 상태
  - [x] 비활성 사용자 차단

### 컴포넌트 생성
- [x] src/components/meal/WeekdaySelector.tsx
- [x] src/components/meal/DateSelector.tsx
- [x] src/components/meal/index.ts

### 서비스 확인
- [x] 기존 서비스 코드 활용 (getStudentMealPlan, submitApplication)

### 라우트 설정
- [x] constants.ts - ROUTES.MEAL 추가
- [x] constants.ts - PROTECTED_ROUTES에 /meal 추가

### 빌드 검증
- [x] npm run build 성공 (35개 라우트)

### 테스트 필요
- [ ] student_test 로그인 → /meal 접근
- [ ] 신청 생성 테스트
- [ ] 신청 수정 테스트

---

## Stage 2: 출석 DB + 관리자

### DB 마이그레이션
- [ ] supabase/migrations/015_add_attendance_system.sql
  - [ ] attendance_codes 테이블
  - [ ] attendance_records 테이블
  - [ ] 인덱스 생성
  - [ ] RLS 정책

### 도메인 코드
- [ ] src/domains/attendance/model.ts
  - [ ] AttendanceCode 타입
  - [ ] AttendanceRecord 타입
  - [ ] Zod 스키마
- [ ] src/domains/attendance/repository.ts
  - [ ] getTodayCode
  - [ ] createCode
  - [ ] getTodayRecords
  - [ ] createRecord
  - [ ] getRecordsByStudent
- [ ] src/domains/attendance/service.ts
  - [ ] generateDailyCode
  - [ ] checkIn / checkOut
  - [ ] getAttendanceStatus

### 관리자 페이지
- [ ] src/app/admin/attendance/page.tsx
  - [ ] QR 코드 표시 (qrcode.react)
  - [ ] PIN 코드 표시
  - [ ] 코드 재생성 버튼
  - [ ] 오늘 출석 현황 테이블
  - [ ] 수동 출석 처리 모달

### 컴포넌트
- [ ] src/components/attendance/AttendanceQR.tsx
- [ ] src/components/attendance/AttendanceTable.tsx
- [ ] src/components/attendance/ManualCheckInModal.tsx

### 패키지 설치
- [ ] npm install qrcode.react

### 네비게이션
- [ ] 관리자 사이드바에 "출석 관리" 추가

---

## Stage 3: 출석 재원생 페이지

### 패키지 설치
- [ ] npm install html5-qrcode (또는 @yudiel/react-qr-scanner)

### 체크인 페이지
- [ ] src/app/(member)/checkin/page.tsx
  - [ ] QR 스캔 모드
  - [ ] PIN 입력 모드
  - [ ] 출석 성공/실패 피드백
  - [ ] 오늘 출석 상태 표시

### 출석 이력 페이지
- [ ] src/app/(member)/attendance/page.tsx
  - [ ] 월별 달력 뷰
  - [ ] 일별 상세 (출석/퇴실 시간)
  - [ ] 월 이동 버튼

### 컴포넌트
- [ ] src/components/attendance/QRScanner.tsx
- [ ] src/components/attendance/PINInput.tsx
- [ ] src/components/attendance/AttendanceCalendar.tsx
- [ ] src/components/attendance/AttendanceStatus.tsx

### 네비게이션
- [ ] 재원생 메뉴에 "출석" 추가
- [ ] 홈 화면에 출석 바로가기 (선택)

### 테스트
- [ ] QR 스캔 테스트 (모바일)
- [ ] PIN 입력 테스트
- [ ] 중복 출석 방지 테스트
- [ ] 출석 이력 조회 테스트

---

## Stage 4: 출석 통계 (선택)

### 관리자 통계
- [ ] /admin/attendance/stats 또는 탭
  - [ ] 일별 출석률 차트
  - [ ] 주별/월별 통계
  - [ ] 학생별 출석률
  - [ ] 엑셀 다운로드

### 컴포넌트
- [ ] src/components/attendance/AttendanceChart.tsx
- [ ] src/components/attendance/AttendanceStats.tsx

---

## Stage 5: 질문방 게시판 기능 (공개/비공개) ✅ 완료

### DB 마이그레이션
- [x] supabase/migrations/017_add_question_visibility.sql
  - [x] questions.is_public 컬럼 추가 (BOOLEAN, DEFAULT FALSE)
  - [x] "Active users can read public questions" RLS 정책
  - [x] "Active users can read answers to public questions" RLS 정책
  - [x] 인덱스 추가 (idx_questions_is_public, idx_questions_is_public_created)

### 도메인 레이어
- [x] src/domains/question/model.ts
  - [x] questionSchema에 is_public 필드 추가
  - [x] createQuestionSchema에 is_public 필드 추가
- [x] src/domains/question/repository.ts
  - [x] getQuestions에 isPublic 필터 추가
  - [x] getPublicAndMyQuestions 함수 추가 (공개 질문 + 내 비공개 질문)
  - [x] createQuestion에 is_public 필드 포함
- [x] src/domains/question/service.ts
  - [x] getPublicQuestionList 함수 추가

### 질문 작성 페이지
- [x] src/app/questions/new/page.tsx
  - [x] 공개 설정 체크박스 추가
  - [x] 라벨: "다른 학생에게 공개"
  - [x] 설명 텍스트

### 질문 목록 페이지
- [x] src/app/questions/page.tsx
  - [x] 탭 추가: "전체 공개" / "내 질문"
  - [x] 상태 필터 유지: "전체" / "답변 대기" / "답변 완료"
  - [x] 질문 카드에 공개/비공개 뱃지 추가
  - [x] 공개 질문은 작성자 이름 표시
  - [x] 내 질문 표시 뱃지

### 질문 상세 페이지
- [x] src/app/questions/[id]/page.tsx
  - [x] 공개/비공개 뱃지 표시

### 마이페이지
- [x] src/app/my/page.tsx
  - [x] "내 질문" 탭 추가
  - [x] 내 질문 목록 표시 (공개/비공개 모두)
  - [x] 질문 상세로 이동 가능

### 어드민 페이지 수정
- [x] src/app/admin/questions/[id]/page.tsx
  - [x] TypeScript 에러 수정 (questionId undefined 처리)

### 빌드 검증
- [x] npm run build 성공

### 코드 리뷰 수정
- [x] repository.ts - updateQuestion에 is_public 필드 업데이트 로직 추가
- [x] new/page.tsx - 미사용 Lock import 제거

### 테스트 필요
- [ ] 비공개 질문: 작성자와 스태프만 열람 가능
- [ ] 공개 질문: 모든 활성 재원생 열람 가능
- [ ] 공개 질문의 답변: 모든 활성 재원생 열람 가능
- [ ] 질문 생성 시 기본값 비공개
- [ ] /questions: 공개 질문 + 내 비공개 질문 표시
- [ ] /my: 내 질문만 표시 (공개/비공개 모두)
- [ ] 비활성 사용자: 질문 열람 불가

---

## 진행 상태 요약

| Stage | 기능 | 상태 | 비고 |
|-------|------|------|------|
| 1 | 도시락 재원생 | ✅ 완료 | 2025-03-15 |
| 2 | 출석 DB + 관리자 | ❌ 취소 | 외부 솔루션 사용 |
| 3 | 출석 재원생 | ❌ 취소 | 외부 솔루션 사용 |
| 4 | 출석 통계 | ❌ 취소 | 외부 솔루션 사용 |
| 5 | 질문방 게시판 기능 | ✅ 완료 | 2026-03-15 |

---

## Phase 8 완료 요약

### 구현 완료
- 도시락 재원생 신청 페이지 (`/meal`)
- WeekdaySelector, DateSelector 컴포넌트
- 코드 리뷰 수정 (접근성, 에러 처리, 타임존)
- 질문방 공개/비공개 기능 (`/questions`)
  - DB: is_public 컬럼 + RLS 정책
  - 질문 작성 시 공개 설정 체크박스
  - 질문 목록: "전체 공개" / "내 질문" 탭
  - 마이페이지: "내 질문" 탭 추가

---

## 의존성

```
Stage 1 (도시락) ─────────────────────► 독립 진행 가능

Stage 2 (출석 DB) ──► Stage 3 (출석 재원생) ──► Stage 4 (통계)
```

---

## 배포 체크리스트

### Stage 1 배포
- [ ] 빌드 테스트
- [ ] /meal 페이지 접근 확인

### Stage 2 배포
- [ ] SQL 마이그레이션 실행
- [ ] qrcode.react 의존성 확인
- [ ] /admin/attendance 접근 확인

### Stage 3 배포
- [ ] html5-qrcode 의존성 확인
- [ ] HTTPS 환경 확인 (카메라 접근)
- [ ] 모바일 테스트

### Stage 5 배포
- [ ] SQL 마이그레이션 실행 (017_add_question_visibility.sql)
- [ ] /questions 페이지 탭 전환 확인
- [ ] 공개/비공개 질문 권한 테스트
- [ ] /my 내 질문 탭 확인
