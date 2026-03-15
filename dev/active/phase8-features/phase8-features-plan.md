# Phase 8 Features - Plan

**버전: 1.0**
**작성일: 2025-03-15**

---

## 1. 개요

Phase 8은 재원생 일상 서비스 구현 단계입니다.

### 목표
1. 도시락 신청 시스템 완성 (재원생 페이지)
2. 출석 체크 시스템 구현 (QR/PIN)

### 예상 산출물
- 신규 페이지 4개
- DB 마이그레이션 1개
- 도메인 코드 1세트 (attendance)

---

## 2. 아키텍처

### 2.1 도시락 신청 플로우

```
재원생 → /lunch
    │
    ├─► 활성 기간 조회 (lunch_periods)
    │       └─► is_active = true, 날짜 범위 내
    │
    ├─► 기존 신청 조회 (lunch_applications)
    │       └─► period_id + student_id
    │
    ├─► 선택 UI 렌더링
    │       ├─► weekday: 월~금 체크박스
    │       └─► date: 달력 선택
    │
    └─► 신청/수정 (upsert)
            └─► UNIQUE(period_id, student_id)
```

### 2.2 출석 체크 플로우

```
관리자 → /admin/attendance
    │
    ├─► 오늘의 QR 코드 표시 (daily_code)
    │       └─► 자정에 자동 갱신 또는 수동 생성
    │
    ├─► 실시간 출석 현황
    │       └─► attendance_records JOIN profiles
    │
    └─► 수동 출석 처리
            └─► 관리자가 직접 출석/퇴실 기록

재원생 → /checkin
    │
    ├─► QR 스캔 버튼
    │       └─► 카메라로 QR 스캔 → daily_code 추출
    │
    ├─► PIN 입력 (대안)
    │       └─► 4자리 숫자 입력
    │
    └─► 출석 기록 생성
            └─► attendance_records INSERT

재원생 → /my (또는 /attendance)
    │
    └─► 본인 출석 이력 조회
            └─► 월별 달력 뷰
```

### 2.3 DB 스키마

```sql
-- attendance_codes: 일일 출석 코드
CREATE TABLE attendance_codes (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,       -- QR용 6자리 코드
  pin TEXT NOT NULL,               -- PIN용 4자리 숫자
  valid_date DATE NOT NULL UNIQUE, -- 유효 날짜
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- attendance_records: 출석 기록
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  check_type TEXT CHECK (check_type IN ('check_in', 'check_out')),
  check_time TIMESTAMPTZ DEFAULT NOW(),
  method TEXT CHECK (method IN ('qr', 'pin', 'manual')),
  code_id UUID REFERENCES attendance_codes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, check_type, DATE(check_time))
);
```

---

## 3. 파일 구조

### 신규 파일

```
src/
├── app/
│   ├── (member)/
│   │   ├── lunch/page.tsx              ← 도시락 신청
│   │   ├── checkin/page.tsx            ← QR/PIN 출석
│   │   └── attendance/page.tsx         ← 출석 이력
│   └── admin/
│       └── attendance/page.tsx         ← 출석 관리
├── domains/
│   └── attendance/
│       ├── model.ts
│       ├── repository.ts
│       └── service.ts
├── components/
│   ├── lunch/
│   │   ├── LunchPeriodCard.tsx
│   │   ├── WeekdaySelector.tsx
│   │   └── DateSelector.tsx
│   └── attendance/
│       ├── QRScanner.tsx
│       ├── PINInput.tsx
│       ├── AttendanceCalendar.tsx
│       └── AttendanceTable.tsx
└── supabase/
    └── migrations/
        └── 015_add_attendance_system.sql
```

---

## 4. 구현 단계

### Stage 1: 도시락 재원생 페이지 (1단계)

**목표:** 재원생이 도시락 신청 가능

**작업:**
1. `/lunch` 페이지 생성
2. 활성 기간 조회 + 기존 신청 로드
3. 요일별/날짜별 선택 UI
4. 신청/수정 기능 (upsert)
5. 신청 완료 토스트

### Stage 2: 출석 DB + 관리자 (2단계)

**목표:** 출석 데이터 저장 및 관리

**작업:**
1. `015_add_attendance_system.sql` 마이그레이션
2. `attendance` 도메인 코드 (model, repository, service)
3. `/admin/attendance` 페이지
   - QR 코드 생성/표시
   - PIN 코드 표시
   - 오늘 출석 현황
   - 수동 출석 처리

### Stage 3: 출석 재원생 페이지 (3단계)

**목표:** 재원생이 QR/PIN으로 출석

**작업:**
1. `/checkin` 페이지
   - QR 스캔 컴포넌트
   - PIN 입력 폼
   - 출석 완료 피드백
2. `/attendance` 페이지 (또는 /my 탭)
   - 월별 달력 뷰
   - 출석/퇴실 시간 표시

### Stage 4: 출석 통계 (4단계, 선택)

**목표:** 관리자용 출석 리포트

**작업:**
1. 일별/주별/월별 출석률
2. 학생별 출석 현황
3. 엑셀 다운로드

---

## 5. 컴포넌트 설계

### 5.1 도시락 선택 UI

```tsx
// WeekdaySelector.tsx
interface Props {
  mealTypes: ("lunch" | "dinner")[];
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
  disabled?: boolean;
}

// 월~금 행, 중식/석식 열 체크박스 그리드
```

### 5.2 QR 스캐너

```tsx
// QRScanner.tsx
interface Props {
  onScan: (code: string) => void;
  onError: (error: Error) => void;
}

// html5-qrcode 또는 @yudiel/react-qr-scanner 사용
```

### 5.3 출석 달력

```tsx
// AttendanceCalendar.tsx
interface Props {
  records: AttendanceRecord[];
  month: Date;
  onMonthChange: (date: Date) => void;
}

// 달력 형태로 출석/퇴실 표시
```

---

## 6. RLS 정책

### attendance_codes

```sql
-- 관리자만 생성/수정
-- 활성 사용자 조회 가능 (유효 날짜만)
```

### attendance_records

```sql
-- 재원생: 본인 기록만 조회, 당일만 생성
-- 관리자: 모든 기록 조회/생성
```

---

## 7. 패키지 설치

```bash
# QR 코드 생성 (관리자용)
npm install qrcode.react

# QR 코드 스캔 (재원생용)
npm install html5-qrcode
# 또는
npm install @yudiel/react-qr-scanner
```

---

## 8. 예상 일정

| 단계 | 기능 | 예상 규모 |
|------|------|----------|
| Stage 1 | 도시락 신청 페이지 | 소 |
| Stage 2 | 출석 DB + 관리자 | 중 |
| Stage 3 | 출석 재원생 | 중 |
| Stage 4 | 출석 통계 | 소 (선택) |

---

## 9. 검증 체크리스트

### Stage 1 완료 조건
- [ ] 재원생 로그인 → /lunch 접근 가능
- [ ] 활성 기간 표시
- [ ] 요일별/날짜별 선택 동작
- [ ] 신청 저장 및 수정
- [ ] 비활성 사용자 접근 차단

### Stage 2 완료 조건
- [ ] QR 코드 생성 및 표시
- [ ] PIN 코드 표시
- [ ] 출석 현황 실시간 조회
- [ ] 수동 출석 처리

### Stage 3 완료 조건
- [ ] QR 스캔 동작 (모바일)
- [ ] PIN 입력 동작
- [ ] 출석 성공 피드백
- [ ] 본인 출석 이력 조회
