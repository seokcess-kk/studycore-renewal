# Phase 6 Contents - Plan

**버전: 1.2**
**최종 수정: 2025-03-15**

---

## 1. 개요

Phase 6는 STUDYCORE 서비스의 **콘텐츠 완성 및 UX 개선** 단계입니다.

### 목표 (완료)
1. ✅ 알림 발송 이력 관리 시스템 구축
2. ✅ 프로필 이미지 업로드 기능 추가
3. ✅ /about, /reviews 콘텐츠 페이지 구현
4. ⏳ PWA 설정 (우선순위 낮음, 대기)

---

## 2. 아키텍처

### 2.1 알림 이력 시스템

```
[Edge Function: notify-*]
    │
    ├─► [Solapi API] → SMS 발송
    │
    └─► [notification-logger.ts]
            │
            ▼
    [notification_logs 테이블]
            │
            ▼
    [/admin/kakao/history]
        ├─► 날짜/유형/상태 필터
        ├─► 통계 카드 (4개)
        └─► 페이지네이션 테이블
```

### 2.2 프로필 이미지 흐름

```
[마이페이지 /my]
    │
    ▼
[AvatarUploader]
    │
    ├─► URL.createObjectURL() → 원형 미리보기
    │
    ├─► browser-image-compression → 512x512 압축
    │
    ├─► 기존 파일 삭제 (있으면)
    │
    └─► Supabase Storage 업로드
            │
            ├─► avatars/{user_id}/avatar.{ext}
            │
            ▼
    [updateAvatar 서비스]
            │
            ├─► profiles.avatar_url 업데이트
            │
            └─► Zustand store 갱신
```

### 2.3 About 페이지 구조

```
/about
│
├── IntroSection
│   ├── 미션 문구
│   └── 특징 카드 x4
│
├── FacilitySection
│   ├── 이미지 슬라이더
│   └── 인디케이터
│
├── TeamSection
│   └── 강사 프로필 카드 x4
│
└── LocationSection
    ├── 지도 플레이스홀더
    ├── 연락처 정보 x4
    └── 카카오톡 CTA
```

### 2.4 Reviews 시스템

```
/reviews (공개)
│
├── 통계 카드
│   ├── 평균 별점
│   └── 분포 차트
│
├── 필터 버튼
│   └── 전체 / 재원생 / 학부모 / 졸업생
│
├── 리뷰 목록
│   ├── 작성자, 카테고리
│   ├── 별점, 날짜
│   └── 내용
│
└── 페이지네이션

/reviews/write (재원생만)
│
├── 카테고리 선택
├── 별점 입력 (hover 효과)
├── 내용 입력
└── 제출 버튼
```

---

## 3. 구현 완료 내역

### 3.1 알림 이력 시스템

| 항목 | 파일 | 설명 |
|------|------|------|
| SQL | 009_notification_logs.sql | 테이블 + 인덱스 + RLS |
| Logger | _shared/notification-logger.ts | logNotification, logNotificationsBatch |
| Repository | notification/repository.ts | getNotificationLogs, getNotificationStats |
| UI | /admin/kakao/history | 필터, 통계, 테이블 |

### 3.2 프로필 이미지

| 항목 | 파일 | 설명 |
|------|------|------|
| SQL | 010_add_avatars_bucket.sql | 버킷 + RLS |
| Component | AvatarUploader.tsx | 원형 미리보기, 압축, 삭제 |
| Service | user/service.ts | updateAvatar() |
| Page | /my | 프로필 헤더 연동 |

### 3.3 About 페이지

| 컴포넌트 | 내용 |
|---------|------|
| IntroSection | 미션, 특징 카드 4개 |
| FacilitySection | 이미지 슬라이더 |
| TeamSection | 강사 프로필 그리드 |
| LocationSection | 연락처, 지도 |

### 3.4 Reviews 시스템

| 항목 | 파일 | 설명 |
|------|------|------|
| SQL | 011_add_reviews.sql | 테이블 + RLS + 트리거 |
| Domain | review/* | model, repository, service |
| List | /reviews | 통계, 필터, 페이지네이션 |
| Write | /reviews/write | 작성 폼 |

---

## 4. 파일 목록

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
├── _shared/notification-logger.ts  (신규)
├── notify-consult/index.ts         (수정)
├── notify-question/index.ts        (수정)
├── notify-answer/index.ts          (수정)
└── send-kakao-alimtalk/index.ts    (수정)
```

### Components (7개)
```
src/components/
├── common/AvatarUploader.tsx
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

---

## 5. 검증 결과

```bash
$ npm run build

✓ Compiled successfully in 4.8s
✓ Generating static pages (34/34)
✓ 0 errors
```

**새로 추가된 라우트:**
- `/about` (○ Static)
- `/admin/kakao/history` (○ Static)
- `/reviews` (○ Static)
- `/reviews/write` (○ Static)

---

## 6. 배포 체크리스트

### Supabase
- [ ] 009_notification_logs.sql 실행
- [ ] 010_add_avatars_bucket.sql 실행 (또는 대시보드에서 버킷 생성)
- [ ] 011_add_reviews.sql 실행

### Edge Functions
```bash
supabase functions deploy notify-consult
supabase functions deploy notify-question
supabase functions deploy notify-answer
supabase functions deploy send-kakao-alimtalk
```

### 콘텐츠
- [ ] About 페이지 텍스트 확정
- [ ] 시설 이미지 촬영/업로드
- [ ] 강사진 정보 입력

---

## 7. 추후 작업 (Phase 7)

| 항목 | 우선순위 | 설명 |
|------|---------|------|
| 카카오맵 연동 | 높음 | About 페이지 지도 |
| 알림톡 연동 | 높음 | 템플릿 심사 후 |
| Reviews 이미지 | 중간 | ImageUploader 연동 |
| PWA 완성 | 낮음 | manifest, 아이콘, SW |
| CDN 최적화 | 낮음 | 이미지 성능 |
