# Phase 5 Functions - Tasks

**상태: 완료**
**기간: 2025-03-15**

---

## 1단계: Storage 설정

### SQL 마이그레이션
- [x] 008_add_storage_buckets.sql
  - [x] question-images 버킷 생성 (비공개, 5MB)
  - [x] blog-thumbnails 버킷 생성 (공개, 2MB)
  - [x] question-images RLS (학생 업로드, 멘토/관리자 조회)
  - [x] blog-thumbnails RLS (관리자 업로드, 공개 조회)

### 이미지 업로드 컴포넌트
- [x] src/components/common/ImageUploader.tsx
  - [x] Props 정의 (bucket, folder, maxFiles, maxSize, onUpload)
  - [x] 드래그앤드롭 UI
  - [x] 이미지 미리보기
  - [x] 삭제 버튼
  - [x] browser-image-compression 연동
  - [x] Supabase Storage 업로드

### NPM 패키지
- [x] `npm install browser-image-compression`

---

## 2단계: Edge Functions

### 공통 유틸
- [x] supabase/functions/_shared/sms.ts
  - [x] Solapi SMS API 연동
  - [x] HMAC-SHA256 서명 생성
  - [x] 단일 발송 함수
  - [x] 배치 발송 함수
- [x] supabase/functions/_shared/alimtalk.ts
  - [x] 카카오 알림톡 API 인터페이스
  - [x] 템플릿 코드 상수
- [x] supabase/functions/_shared/cors.ts
  - [x] CORS 헤더 설정

### Edge Functions
- [x] notify-consult (상담 신청 알림)
- [x] notify-question (질문 등록 알림, 배치)
- [x] notify-answer (답변 등록 알림)
- [x] send-kakao-alimtalk (수동 알림톡, 배치)

---

## 3단계: 질문방 완성

### 질문 작성 페이지
- [x] src/app/questions/new/page.tsx
  - [x] react-hook-form + zod 폼
  - [x] ImageUploader 연동 (최대 5개)
  - [x] 성공 시 /questions로 리다이렉트

### 질문 상세 페이지
- [x] src/app/questions/[id]/page.tsx
  - [x] 질문 정보 표시
  - [x] 첨부 이미지 갤러리
  - [x] 답변 목록 표시
  - [x] 이미지 확대 모달

### 서비스 연동
- [x] question/service.ts
  - [x] createQuestion에서 notify-question 호출
  - [x] createAnswer에서 notify-answer 호출

---

## 4단계: 수동 알림톡 페이지

- [x] src/app/admin/kakao/page.tsx
  - [x] 수신자 선택 (전체/선택/학부모만)
  - [x] 선택 모드: 학생 목록 + 체크박스
  - [x] 메시지 입력 (1000자 제한)
  - [x] 미리보기
  - [x] 발송 버튼 → send-kakao-alimtalk 호출
  - [x] 결과 토스트 (성공/실패 건수)

---

## 5단계: 코드 품질 개선

### ImageUploader 개선
- [x] 업로드 재시도 (최대 3회, 지수 백오프)
- [x] 로컬 blob URL 미리보기
- [x] 진행률 표시 (0% → 10% → 40% → 90% → 100%)
- [x] 실패 상태 UI + 재시도 버튼
- [x] blob URL 메모리 해제

### SMS 배치 발송 개선
- [x] Solapi 배치 API (/messages/v4/send-many)
- [x] 100건 단위 배치 분할
- [x] 동일 메시지 그룹화
- [x] Rate Limit 대응 (200ms 딜레이)
- [x] 에러 추적 (실패 건별)

### next/image 설정
- [x] next.config.ts remotePatterns 추가

---

## 6단계: 검증

### 빌드 검증
- [x] `npm run build` 0 에러
- [x] `npm run lint` 0 에러 (10 경고)
  - React Hook Form watch() 호환성 경고 (2개)
  - img 태그 사용 경고 (6개) - blob URL 호환성
  - Edge Functions 미사용 import (2개) - 추후 사용 예정

---

## 진행 상태

| 영역 | 상태 | 비고 |
|------|------|------|
| Storage 설정 | ✅ 완료 | SQL + RLS |
| Edge Functions | ✅ 완료 | 4개 함수 + 배치 최적화 |
| 질문방 완성 | ✅ 완료 | /new, /[id] |
| 수동 알림톡 | ✅ 완료 | /admin/kakao |
| 코드 품질 개선 | ✅ 완료 | 재시도, 배치, 진행률 |
| 빌드 검증 | ✅ 완료 | 0 에러 |

---

## 구현된 파일 목록

### SQL Migrations
- `supabase/migrations/008_add_storage_buckets.sql`

### Edge Functions (7개)
- `supabase/functions/_shared/sms.ts`
- `supabase/functions/_shared/alimtalk.ts`
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/notify-consult/index.ts`
- `supabase/functions/notify-question/index.ts`
- `supabase/functions/notify-answer/index.ts`
- `supabase/functions/send-kakao-alimtalk/index.ts`

### Components (1개)
- `src/components/common/ImageUploader.tsx`

### Pages (3개)
- `src/app/questions/new/page.tsx`
- `src/app/questions/[id]/page.tsx`
- `src/app/admin/kakao/page.tsx`

### Modified Files (4개)
- `src/domains/question/service.ts`
- `src/components/common/index.ts`
- `tsconfig.json`
- `next.config.ts`

### NPM Packages Added
- `browser-image-compression`

---

## 배포 전 필요 작업

### Supabase 설정
- [ ] Storage 버킷 생성 (Supabase 대시보드)
- [ ] Edge Functions 배포: `supabase functions deploy`
- [ ] Secrets 등록:
  ```bash
  supabase secrets set SMS_API_KEY=xxx
  supabase secrets set SMS_API_SECRET=xxx
  supabase secrets set SMS_SENDER_PHONE=xxx
  supabase secrets set ADMIN_PHONE=xxx
  ```

### 외부 서비스
- [ ] Solapi SMS API 계정 생성 및 키 발급
- [ ] 카카오 비즈니스 채널 설정 (추후)
- [ ] 알림톡 템플릿 등록 및 심사 (추후)

---

## 다음 단계 (Phase 6 예고)

### 우선순위 높음
- 알림 발송 이력 테이블 (notification_logs)
- 발송 이력 조회 UI (/admin/kakao/history)
- 프로필 이미지 (avatars 버킷)

### 우선순위 중간
- /about, /reviews 콘텐츠 페이지
- PWA 설정

### 우선순위 낮음
- 알림톡 연동 (템플릿 심사 후)
- 이미지 CDN 최적화
