# Phase 6 Contents - Tasks

**상태: 완료 (PWA 제외)**
**기간: 2025-03-15**

---

## 1단계: 알림 이력 시스템 ✅ 완료

### SQL 마이그레이션
- [x] 009_notification_logs.sql
  - [x] notification_logs 테이블 생성
  - [x] 인덱스 추가 (created_at, type, status, sent_by)
  - [x] RLS 정책 (관리자 조회, 서비스롤 삽입)

### Edge Functions 수정
- [x] _shared/notification-logger.ts (신규)
  - [x] logNotification() 단일 로그 저장
  - [x] logNotificationsBatch() 배치 로그 저장
  - [x] createSMSLogEntries() 헬퍼 함수
- [x] notify-consult/index.ts - 로깅 추가
- [x] notify-question/index.ts - 로깅 추가
- [x] notify-answer/index.ts - 로깅 추가
- [x] send-kakao-alimtalk/index.ts - 로깅 추가

### 이력 조회 UI
- [x] src/app/admin/kakao/history/page.tsx
  - [x] 날짜 범위 필터 (시작일, 종료일)
  - [x] 유형 필터 (SMS/알림톡)
  - [x] 상태 필터 (성공/실패/대기)
  - [x] 페이지네이션 (20건 단위)
  - [x] 통계 카드 (전체/성공/실패/대기)
  - [x] 테이블 레이아웃

### 도메인 레이어
- [x] src/domains/notification/model.ts
  - [x] NotificationLogDB 타입
  - [x] CreateNotificationLogInput 타입
  - [x] NotificationLogFilter 타입
  - [x] NotificationStats 타입
- [x] src/domains/notification/repository.ts
  - [x] getNotificationLogs()
  - [x] getNotificationStats()
  - [x] createNotificationLog()
  - [x] createNotificationLogsBatch()

### UI 연동
- [x] src/app/admin/kakao/page.tsx
  - [x] 발송 이력 링크 추가

---

## 2단계: 프로필 이미지 ✅ 완료

### SQL 마이그레이션
- [x] 010_add_avatars_bucket.sql
  - [x] avatars 버킷 생성 (공개, 2MB)
  - [x] RLS: 본인 폴더 업로드/삭제
  - [x] RLS: 공개 조회

### 컴포넌트
- [x] src/components/common/AvatarUploader.tsx
  - [x] Props: userId, currentUrl, onUpload, size
  - [x] 원형 미리보기 (sm/md/lg)
  - [x] 512x512 압축 (browser-image-compression)
  - [x] 기존 이미지 삭제 후 교체
  - [x] 업로드 진행률 표시
  - [x] 삭제 버튼

### 페이지 연동
- [x] src/app/my/page.tsx
  - [x] AvatarUploader 추가
  - [x] handleAvatarUpload 핸들러
  - [x] Zustand store 갱신

### 도메인 레이어
- [x] src/domains/user/service.ts
  - [x] updateAvatar() 함수 추가

### export
- [x] src/components/common/index.ts
  - [x] AvatarUploader export

---

## 3단계: About 페이지 ✅ 완료

### 컴포넌트
- [x] src/components/about/IntroSection.tsx
  - [x] 학원 미션/비전
  - [x] 4개 특징 카드 (목표 중심, 1:1 관리, 질문 해결, 시간 관리)
- [x] src/components/about/FacilitySection.tsx
  - [x] 이미지 슬라이더 (좌우 버튼)
  - [x] 캡션/설명 표시
  - [x] 인디케이터
- [x] src/components/about/TeamSection.tsx
  - [x] 강사 프로필 카드 그리드
  - [x] 이름, 역할, 담당 과목, 소개
- [x] src/components/about/LocationSection.tsx
  - [x] 주소, 전화, 운영시간, 대중교통
  - [x] 지도 플레이스홀더 (카카오맵 연동 예정)
  - [x] 카카오톡 상담 CTA

### 페이지
- [x] src/app/(public)/about/page.tsx
  - [x] 4개 섹션 조합
  - [x] SEO 메타데이터

### export
- [x] src/components/about/index.ts

---

## 4단계: Reviews 페이지 ✅ 완료

### SQL 마이그레이션
- [x] 011_add_reviews.sql
  - [x] reviews 테이블 생성
  - [x] 카테고리 CHECK (student, parent, alumni)
  - [x] 별점 CHECK (1-5)
  - [x] 인덱스 4개
  - [x] RLS: 공개 조회 (is_visible=true)
  - [x] RLS: 작성자 본인 조회
  - [x] RLS: 관리자 전체 조회
  - [x] RLS: 활성 재원생 작성
  - [x] RLS: 작성자/관리자 수정
  - [x] RLS: 관리자 삭제
  - [x] updated_at 트리거

### 도메인 레이어
- [x] src/domains/review/model.ts
  - [x] Review 타입
  - [x] ReviewCategory 상수
  - [x] createReviewSchema (zod)
  - [x] updateReviewSchema
  - [x] ReviewFilter 타입
  - [x] ReviewStats 타입
- [x] src/domains/review/repository.ts
  - [x] getReviews()
  - [x] getFeaturedReviews()
  - [x] getReviewById()
  - [x] getReviewStats()
  - [x] createReview()
  - [x] updateReview()
  - [x] deleteReview()
- [x] src/domains/review/service.ts
  - [x] 모든 repository 함수 래핑
  - [x] 유효성 검사
  - [x] 권한 검사

### 페이지
- [x] src/app/(public)/reviews/page.tsx
  - [x] 통계 카드 (평균 별점, 분포 차트)
  - [x] 카테고리 필터
  - [x] 리뷰 목록
  - [x] 페이지네이션
  - [x] 후기 작성 버튼 (재원생만)
- [x] src/app/(member)/reviews/write/page.tsx
  - [x] 카테고리 선택
  - [x] 별점 입력 (hover 효과)
  - [x] 내용 입력 (10자 이상)
  - [x] 비활성 사용자 차단

---

## 5단계: PWA 설정 ⏳ 대기

### 이유
- 우선순위 낮음
- 핵심 기능 아님
- Phase 7 또는 별도 작업으로 진행

### 예정 작업
- [ ] npm install next-pwa
- [ ] public/manifest.json
- [ ] 아이콘 세트 (192x192, 512x512)
- [ ] next.config.ts withPWA
- [ ] 캐싱 전략 설정

---

## 6단계: 검증 ✅ 완료

### 빌드 결과
- [x] `npm run build` 0 에러
- [x] 총 34개 라우트 생성

### 새로 추가된 라우트
- /about
- /admin/kakao/history
- /reviews
- /reviews/write

---

## 진행 상태

| 영역 | 상태 | 비고 |
|------|------|------|
| 알림 이력 시스템 | ✅ 완료 | SQL + Edge Functions + UI |
| 프로필 이미지 | ✅ 완료 | Storage + AvatarUploader + /my |
| About 페이지 | ✅ 완료 | 4개 섹션 컴포넌트 |
| Reviews 페이지 | ✅ 완료 | 도메인 + 목록 + 작성 |
| PWA 설정 | ⏳ 대기 | 우선순위 낮음 |
| 빌드 검증 | ✅ 완료 | 0 에러 |

---

## 구현된 파일 목록

### SQL Migrations (3개)
```
supabase/migrations/
├── 009_notification_logs.sql
├── 010_add_avatars_bucket.sql
└── 011_add_reviews.sql
```

### Edge Functions (5개)
```
supabase/functions/
├── _shared/notification-logger.ts    (신규)
├── notify-consult/index.ts           (수정)
├── notify-question/index.ts          (수정)
├── notify-answer/index.ts            (수정)
└── send-kakao-alimtalk/index.ts      (수정)
```

### Components (7개)
```
src/components/
├── common/
│   └── AvatarUploader.tsx
└── about/
    ├── IntroSection.tsx
    ├── FacilitySection.tsx
    ├── TeamSection.tsx
    ├── LocationSection.tsx
    └── index.ts
```

### Pages (4개)
```
src/app/
├── admin/kakao/history/page.tsx
├── (public)/about/page.tsx
├── (public)/reviews/page.tsx
└── (member)/reviews/write/page.tsx
```

### Domains (1개)
```
src/domains/review/
├── model.ts
├── repository.ts
└── service.ts
```

### Modified Files (6개)
```
src/domains/notification/model.ts
src/domains/notification/repository.ts
src/domains/user/service.ts
src/components/common/index.ts
src/app/my/page.tsx
src/app/admin/kakao/page.tsx
```

---

## 배포 전 필요 작업

### Supabase 설정
- [ ] SQL 마이그레이션 실행 (009, 010, 011)
- [ ] avatars 버킷 확인

### Edge Functions 배포
- [ ] `supabase functions deploy notify-consult`
- [ ] `supabase functions deploy notify-question`
- [ ] `supabase functions deploy notify-answer`
- [ ] `supabase functions deploy send-kakao-alimtalk`

### 콘텐츠 준비
- [ ] About 페이지 텍스트 확정
- [ ] 시설 이미지 촬영/업로드
- [ ] 강사진 정보 및 사진
- [ ] 카카오맵 API 키 발급 (선택)

---

## 다음 단계 (Phase 7 예고)

### 우선순위 높음
- 카카오맵 API 연동
- 알림톡 실제 연동 (템플릿 심사 후)

### 우선순위 중간
- Reviews 이미지 첨부 기능
- PWA 완성

### 우선순위 낮음
- 이미지 CDN 최적화
- 성능 모니터링
