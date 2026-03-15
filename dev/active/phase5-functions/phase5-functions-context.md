# Phase 5 Functions - Context

**시작일: 2025-03-15**
**상태: 완료**

---

## 1. 배경

Phase 4에서 블로그, 도시락 관리, 알림 도메인 레이어를 구현했으나, 다음 항목들이 미완성:

1. **Storage 버킷** - 이미지 업로드 인프라 없음
2. **Edge Functions** - 알림톡/SMS 발송 로직 미구현
3. **질문방 이미지 업로드** - UI는 있으나 실제 업로드 미연동
4. **수동 알림톡 페이지** - /admin/kakao 미구현

---

## 2. 현재 상태 (Phase 5 완료 후)

### 2.1 구현 완료

| 영역 | 상태 | 파일 |
|------|------|------|
| Storage SQL | ✅ | 008_add_storage_buckets.sql |
| ImageUploader | ✅ | 재시도, 미리보기, 진행률 포함 |
| Edge Functions | ✅ | 4개 함수 + 3개 공통 유틸 |
| /questions/new | ✅ | 이미지 업로드 연동 |
| /questions/[id] | ✅ | 상세 + 답변 + 이미지 갤러리 |
| /admin/kakao | ✅ | 수신자 선택, 배치 발송 |

### 2.2 개선 완료

| 항목 | 구현 내용 |
|------|-----------|
| 업로드 재시도 | 최대 3회, 지수 백오프 (1초, 2초, 4초) |
| 로컬 미리보기 | blob URL 사용, 업로드 완료 전 미리 표시 |
| 진행률 표시 | 0% → 10% → 40% → 90% → 100% |
| SMS 배치 발송 | Solapi send-many API, 100건 단위 |
| next/image 설정 | Supabase Storage 패턴 허용 |

---

## 3. 기술 결정

### 3.1 Edge Functions 환경

- **런타임**: Deno (Supabase Edge Functions)
- **비밀 키**: Supabase Secrets로 관리
  - `SMS_API_KEY`
  - `SMS_API_SECRET`
  - `SMS_SENDER_PHONE`
  - `ADMIN_PHONE`
  - `KAKAO_CHANNEL_ID` (추후)
  - `KAKAO_ALIMTALK_KEY` (추후)
- **호출 방식**: `supabase.functions.invoke()`

### 3.2 Storage 정책

```sql
-- 버킷별 접근 권한
question-images: 학생(업로드), 멘토/관리자(조회)
blog-thumbnails: 관리자만 업로드, 공개 조회
```

### 3.3 SMS 배치 발송 전략

```typescript
// 100건 단위 배치
const BATCH_SIZE = 100;

// 동일 메시지 그룹화
const messageGroups = new Map<string, string[]>();

// 배치 간 200ms 딜레이 (Rate Limit)
await new Promise((resolve) => setTimeout(resolve, 200));
```

### 3.4 이미지 업로드 재시도 전략

```typescript
// 지수 백오프
const delay = Math.pow(2, retryCount) * 1000; // 1초, 2초, 4초
const MAX_RETRY_COUNT = 3;
```

---

## 4. 의존성

### 4.1 외부 서비스

| 서비스 | 용도 | 상태 |
|--------|------|------|
| Solapi | SMS 발송 | API 구현 완료, 키 발급 필요 |
| 카카오 알림톡 | 알림 발송 | 템플릿 심사 필요 |

### 4.2 내부 의존성

- notification/service.ts → Edge Functions 호출 인터페이스 완료
- question/service.ts → Edge Function 호출 연동 완료

---

## 5. 알려진 제약

### 5.1 알림톡 템플릿 심사

카카오 비즈니스 채널 심사 필요:
- SC_CONSULT_ADMIN: 상담 신청 알림 (관리자용)
- SC_CONSULT_CUSTOMER: 상담 접수 확인 (고객용)
- SC_QUESTION_MENTOR: 질문 알림 (멘토용)
- SC_ANSWER_STUDENT: 답변 알림 (학생용)
- SC_CUSTOM: 수동 발송

⚠️ 템플릿 심사 전까지 SMS 대체 발송

### 5.2 이미지 최적화

- ImageUploader에서 `<img>` 사용 (blob URL 호환성)
- 질문 상세 페이지에서 `<img>` 사용 (동적 URL)
- next/image 사용 가능하도록 next.config.ts 설정 완료
- 추후 Image 컴포넌트로 전환 가능

---

## 6. 참고 자료

- [Supabase Edge Functions 문서](https://supabase.com/docs/guides/functions)
- [Solapi SMS API 문서](https://docs.solapi.com/api-reference/message-api-v4)
- [카카오 알림톡 API 문서](https://developers.kakao.com/docs/latest/ko/message/rest-api)
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
