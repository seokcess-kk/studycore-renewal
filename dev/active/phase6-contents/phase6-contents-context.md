# Phase 6 Contents - Context

**시작일: 2025-03-15**
**상태: 완료 (PWA 제외)**

---

## 1. 배경

Phase 5에서 Storage, Edge Functions, 질문방 이미지 업로드, 수동 알림톡 페이지를 완성했으나, 다음 항목들이 미완성:

1. **알림 발송 이력** - 발송 기록 추적 불가 → ✅ 해결
2. **프로필 이미지** - avatar_url 필드는 있으나 업로드 기능 없음 → ✅ 해결
3. **콘텐츠 페이지** - /about, /reviews 미구현 → ✅ 해결
4. **PWA** - 앱 설치, 오프라인 지원 없음 → ⏳ 대기

---

## 2. 현재 상태

### 2.1 구현 완료

| 영역 | 상태 | 파일 |
|------|------|------|
| notification_logs 테이블 | ✅ | 009_notification_logs.sql |
| 이력 조회 UI | ✅ | /admin/kakao/history |
| Edge Functions 로깅 | ✅ | notification-logger.ts + 4개 함수 |
| avatars 버킷 | ✅ | 010_add_avatars_bucket.sql |
| AvatarUploader | ✅ | 원형, 압축, 삭제 |
| /my 연동 | ✅ | 프로필 헤더 아바타 |
| About 페이지 | ✅ | 4개 섹션 |
| reviews 테이블 | ✅ | 011_add_reviews.sql |
| review 도메인 | ✅ | model, repository, service |
| /reviews 페이지 | ✅ | 목록 + 통계 + 필터 |
| /reviews/write | ✅ | 작성 폼 |

### 2.2 대기 중

| 항목 | 상태 | 비고 |
|------|------|------|
| PWA | ⏳ | 우선순위 낮음 |
| 카카오맵 연동 | ⏳ | About 페이지 |
| Reviews 이미지 | ⏳ | 추후 구현 |

---

## 3. 기술 결정

### 3.1 알림 이력 테이블 설계

```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('sms', 'alimtalk')),
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  message TEXT NOT NULL,
  template_code TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**설계 포인트:**
- `metadata` JSONB로 확장성 확보 (trigger, questionId, userId 등)
- `sent_by`로 수동 발송자 추적
- 인덱스 4개: created_at(DESC), type, status, sent_by

### 3.2 Edge Function 로깅 전략

```typescript
// _shared/notification-logger.ts
export async function logNotification(entry: NotificationLogEntry): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("notification_logs").insert({...});
  } catch (error) {
    // 로그 저장 실패는 무시 (발송 성공이 우선)
    console.error("알림 로그 저장 실패:", error);
  }
}
```

**원칙:**
- 로그 저장 실패 ≠ 발송 실패
- Silent fail로 처리

### 3.3 프로필 이미지 전략

**버킷 설정:**
- 이름: `avatars`
- 공개 여부: `true` (다른 사용자 프로필 표시용)
- 크기 제한: 2MB
- MIME: jpeg, png, webp

**파일 경로:**
```
avatars/{user_id}/avatar.{ext}
```

**압축:**
```typescript
const options = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 512,
  useWebWorker: true,
};
```

### 3.4 Review 도메인

```
src/domains/review/
├── model.ts       # 타입, Zod 스키마, 상수
├── repository.ts  # CRUD + 통계 쿼리
└── service.ts     # 비즈니스 로직, 권한 검사
```

**카테고리:**
| 값 | 라벨 |
|----|----|
| student | 재원생 |
| parent | 학부모 |
| alumni | 졸업생 |

**RLS 요약:**
- SELECT: 공개(is_visible) OR 본인 OR 관리자
- INSERT: 활성 재원생만
- UPDATE: 본인 OR 관리자
- DELETE: 관리자만

---

## 4. 의존성

### 4.1 외부 서비스

| 서비스 | 용도 | 상태 |
|--------|------|------|
| Solapi | SMS 발송 | ✅ API 구현 완료 |
| 카카오 알림톡 | 알림 발송 | ⏳ 템플릿 심사 필요 |
| 카카오맵 | About 페이지 | ⏳ API 키 발급 필요 |

### 4.2 내부 의존성

- AvatarUploader → browser-image-compression
- notification 도메인 → notification_logs 테이블
- review 도메인 → reviews 테이블
- About 컴포넌트 → CONTACT 상수

---

## 5. 알려진 제약

### 5.1 About 페이지 콘텐츠

현재 상태:
- 시설 이미지: 플레이스홀더 (실제 이미지 필요)
- 강사진: 임시 데이터 (실제 정보 필요)
- 지도: 플레이스홀더 (카카오맵 API 연동 필요)

### 5.2 Reviews 이미지

- 현재 텍스트만 지원
- `images TEXT[]` 컬럼은 준비됨
- ImageUploader 연동은 추후 구현

### 5.3 알림 로그 조회 성능

- 대량 로그 시 페이지네이션 필수
- 날짜 범위 필터 권장
- 인덱스로 최적화됨

---

## 6. 참고 자료

- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security)
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
- [카카오맵 API](https://apis.map.kakao.com/)
- [next-pwa](https://github.com/shadowwalker/next-pwa)
