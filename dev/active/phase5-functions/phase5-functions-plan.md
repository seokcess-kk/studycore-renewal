# Phase 5 Functions - Plan

**버전: 1.1**
**최종 수정: 2025-03-15**

---

## 1. 개요

Phase 5는 STUDYCORE 서비스의 **인프라 완성** 단계입니다.

### 목표 (완료)
1. ✅ Storage 버킷 설정 및 이미지 업로드 기능 완성
2. ✅ Edge Functions 구현 (알림톡/SMS)
3. ✅ 질문방 이미지 업로드 연동
4. ✅ 수동 알림톡 발송 페이지 구현
5. ✅ 코드 품질 개선 (재시도, 배치 발송, 진행률)

---

## 2. 아키텍처

### 2.1 Storage 구조

```
storage/
├── question-images/     ← 질문 첨부 이미지 (비공개)
│   └── {user_id}/{filename}
├── blog-thumbnails/     ← 블로그 썸네일 (공개)
│   └── {post_id}/{filename}
└── avatars/            ← (Phase 6) 프로필 이미지
    └── {user_id}/{filename}
```

### 2.2 Edge Functions 구조

```
supabase/functions/
├── _shared/
│   ├── sms.ts          ← SMS 발송 (단일 + 배치)
│   ├── alimtalk.ts     ← 알림톡 발송
│   └── cors.ts         ← CORS 헤더
├── notify-consult/
│   └── index.ts        ← 상담 신청 알림
├── notify-question/
│   └── index.ts        ← 질문 등록 알림 (배치)
├── notify-answer/
│   └── index.ts        ← 답변 등록 알림
└── send-kakao-alimtalk/
    └── index.ts        ← 수동 알림톡 (배치)
```

### 2.3 알림 발송 흐름

```
[클라이언트]
    │
    ▼
[question/service.ts]
    │ supabase.functions.invoke('notify-question')
    ▼
[Edge Function: notify-question]
    │
    ├─► [Solapi 배치 API] (/messages/v4/send-many)
    │       │
    │       ▼
    │   100건 단위 발송
    │   200ms 딜레이
    │       │
    │       ▼
    └─► 발송 결과 반환
```

### 2.4 이미지 업로드 흐름

```
[사용자 파일 선택]
    │
    ▼
[blob URL 생성] → 즉시 미리보기 표시
    │
    ▼
[browser-image-compression] → 1MB 이하로 압축
    │
    ▼
[Supabase Storage 업로드]
    │
    ├─► 성공 → publicUrl 반환
    │
    └─► 실패 → 재시도 (최대 3회, 지수 백오프)
            │
            └─► 최종 실패 → 재시도 버튼 표시
```

---

## 3. 구현 완료 내역

### 3.1 Storage 설정

**SQL 마이그레이션 (008_add_storage_buckets.sql)**
- question-images 버킷 (비공개, 5MB, 이미지만)
- blog-thumbnails 버킷 (공개, 2MB, 이미지만)
- RLS 정책: 폴더 기반 사용자 격리

### 3.2 ImageUploader 컴포넌트

| 기능 | 구현 |
|------|------|
| 드래그앤드롭 | onDrop/onDragOver/onDragLeave |
| 이미지 압축 | browser-image-compression (1MB, 1920px) |
| 로컬 미리보기 | URL.createObjectURL() |
| 진행률 표시 | 0% → 10% → 40% → 90% → 100% |
| 자동 재시도 | 최대 3회, 지수 백오프 |
| 수동 재시도 | 실패 시 재시도 버튼 |
| 메모리 관리 | URL.revokeObjectURL() |

### 3.3 SMS 배치 발송

| 기능 | 구현 |
|------|------|
| 배치 API | Solapi /messages/v4/send-many |
| 배치 크기 | 100건 단위 |
| 메시지 그룹화 | 동일 메시지 통합 |
| Rate Limit | 배치 간 200ms 딜레이 |
| 에러 추적 | 실패 건별 에러 수집 |

---

## 4. 파일 목록

### 4.1 SQL Migrations
- `supabase/migrations/008_add_storage_buckets.sql`

### 4.2 Edge Functions
- `supabase/functions/_shared/sms.ts`
- `supabase/functions/_shared/alimtalk.ts`
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/notify-consult/index.ts`
- `supabase/functions/notify-question/index.ts`
- `supabase/functions/notify-answer/index.ts`
- `supabase/functions/send-kakao-alimtalk/index.ts`

### 4.3 Components
- `src/components/common/ImageUploader.tsx`

### 4.4 Pages
- `src/app/questions/new/page.tsx`
- `src/app/questions/[id]/page.tsx`
- `src/app/admin/kakao/page.tsx`

### 4.5 Modified Files
- `src/domains/question/service.ts` (Edge Function 호출)
- `src/components/common/index.ts` (ImageUploader export)
- `tsconfig.json` (supabase/functions exclude)
- `next.config.ts` (remotePatterns 추가)

---

## 5. NPM 패키지

```bash
npm install browser-image-compression
```

---

## 6. 환경 변수 (Supabase Secrets)

```bash
# 필수 (SMS 발송)
supabase secrets set SMS_API_KEY=xxx
supabase secrets set SMS_API_SECRET=xxx
supabase secrets set SMS_SENDER_PHONE=01012345678
supabase secrets set ADMIN_PHONE=01012345678

# 추후 (알림톡)
supabase secrets set KAKAO_CHANNEL_ID=xxx
supabase secrets set KAKAO_ALIMTALK_KEY=xxx
```

---

## 7. Phase 6 예고

### 우선순위 높음
- 알림 발송 이력 테이블 + 조회 UI
- 프로필 이미지 (avatars 버킷)

### 우선순위 중간
- /about, /reviews 콘텐츠 페이지
- PWA 설정

### 우선순위 낮음
- 알림톡 연동 (템플릿 심사 후)
- 이미지 CDN 최적화
