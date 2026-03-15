# Phase 7 External - Context

**시작일: 2025-03-15**
**상태: 코드 구현 완료**

---

## 1. 배경

Phase 6에서 콘텐츠 완성 및 UX 개선을 완료했으나, 다음 외부 연동 및 기능이 미완성:

1. **카카오맵 API** - About 페이지 지도가 플레이스홀더 → ✅ 연동 완료
2. **알림톡 실제 연동** - SMS Fallback만 동작 → ⏳ 템플릿 심사 필요
3. **Reviews 이미지** - 텍스트만 지원 → ✅ ImageUploader 연동 완료
4. **PWA** - 앱 설치 지원 없음 → ✅ next-pwa 설정 완료
5. **About 콘텐츠** - 시설/강사진 플레이스홀더 → ⏳ 콘텐츠 수집 필요

---

## 2. 현재 상태

### 2.1 구현 완료

| 영역 | 상태 | 파일 |
|------|------|------|
| 카카오맵 연동 | ✅ | LocationSection.tsx |
| 카카오 타입 선언 | ✅ | src/types/kakao.d.ts |
| 위치 상수 | ✅ | constants.ts (KAKAO, LOCATION) |
| Reviews 이미지 버킷 | ✅ | 012_add_review_images_bucket.sql |
| Reviews 이미지 업로드 | ✅ | reviews/write/page.tsx |
| Reviews 이미지 갤러리 | ✅ | reviews/page.tsx (next/image) |
| PWA manifest | ✅ | public/manifest.json |
| PWA 설정 | ✅ | next.config.js |
| Viewport 설정 | ✅ | layout.tsx |

### 2.2 대기 중

| 항목 | 상태 | 비고 |
|------|------|------|
| 카카오맵 API 키 | ⏳ | 개발자 콘솔 앱 등록 필요 |
| 알림톡 템플릿 | ⏳ | 비즈니스 채널 심사 필요 |
| About 콘텐츠 | ⏳ | 시설 사진, 강사 정보 필요 |
| PWA 아이콘 | ⏳ | 192x192, 512x512 생성 필요 |
| SQL 마이그레이션 실행 | ⏳ | 배포 시 실행 |

---

## 3. 기술 결정

### 3.1 카카오맵 연동

**라이브러리: `react-kakao-maps-sdk`**

선택 이유:
- React 공식 카카오맵 라이브러리
- TypeScript 완전 지원
- 선언적 API (JSX)

**구현 방식:**
```tsx
// SDK 동적 로드 + isMounted 패턴으로 메모리 누수 방지
useEffect(() => {
  let isMounted = true;

  script.onload = () => {
    window.kakao.maps.load(() => {
      if (isMounted) setIsLoaded(true);
    });
  };

  return () => { isMounted = false; };
}, []);
```

**좌표:**
```
lat: 35.1595454
lng: 126.8526021
주소: 광주광역시 광산구 임방울대로 330 애플타워 10층
```

### 3.2 Reviews 이미지

**버킷 설정:**
- 이름: `review-images`
- 공개 여부: `true`
- 크기 제한: 3MB
- MIME: jpeg, png, webp
- 최대 개수: 3장/리뷰

**이미지 최적화:**
- `next/image` 사용 (fill, sizes 속성)
- browser-image-compression (1MB, 1920px)
- lazy loading 자동 적용

### 3.3 PWA 설정

**next-pwa 설정:**
```js
withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})
```

**주의사항:**
- Next.js 16+ Turbopack과 호환성 이슈
- `--webpack` 플래그로 빌드 필요
- 프로덕션 테스트 권장

### 3.4 상수 관리

**중복 제거:**
```typescript
// KAKAO.CHANNEL_URL이 CONTACT.kakaoChannel 참조
export const KAKAO = {
  MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "",
  CHANNEL_URL: CONTACT.kakaoChannel,  // 중복 제거
} as const;
```

---

## 4. 의존성

### 4.1 외부 서비스

| 서비스 | 용도 | 상태 | 필요 작업 |
|--------|------|------|----------|
| 카카오맵 API | About 지도 | ⏳ | API 키 발급 |
| 카카오 알림톡 | 알림 발송 | ⏳ | 채널 개설, 템플릿 심사 |
| Solapi SMS | Fallback | ✅ 운영 중 | - |
| Supabase Storage | 이미지 저장 | ✅ | 버킷 생성 (SQL) |

### 4.2 NPM 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react-kakao-maps-sdk | ^1.2.1 | 카카오맵 |
| next-pwa | ^5.6.0 | PWA |

### 4.3 환경변수

**현재 설정된 변수:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SMS_API_KEY, SMS_API_SECRET, SMS_SENDER_PHONE
```

**Phase 7 추가 필요:**
```
NEXT_PUBLIC_KAKAO_MAP_API_KEY    # 카카오맵 JavaScript API 키
KAKAO_CHANNEL_ID                  # 카카오 비즈니스 채널 ID (알림톡)
KAKAO_ALIMTALK_KEY               # 카카오 알림톡 발송 키 (알림톡)
```

---

## 5. 코드 리뷰 결과

### 5.1 수정 완료

| 파일 | 이슈 | 해결 |
|------|------|------|
| reviews/page.tsx | `<img>` 태그 사용 | `next/image` Image 컴포넌트로 변경 |
| LocationSection.tsx | useEffect 메모리 누수 | isMounted 플래그 추가 |
| constants.ts | CHANNEL_URL 중복 | CONTACT.kakaoChannel 참조로 변경 |

### 5.2 코드 품질

| 영역 | 점수 | 비고 |
|------|------|------|
| 기능 완성도 | ⭐⭐⭐⭐⭐ | 모든 기능 구현 + 리뷰 반영 |
| 코드 품질 | ⭐⭐⭐⭐⭐ | 메모리 누수 방지, 중복 제거 |
| 타입 안전성 | ⭐⭐⭐⭐ | TypeScript 활용 양호 |
| 성능 최적화 | ⭐⭐⭐⭐ | next/image 사용 |
| 보안 | ⭐⭐⭐⭐ | RLS 정책 적절 |

---

## 6. 알려진 제약

### 6.1 카카오맵 API
- JavaScript API 키 필요 (REST API 키와 별도)
- 도메인 등록 필수 (localhost + production URL)
- API 키 없으면 플레이스홀더 표시 (Graceful degradation)

### 6.2 카카오 알림톡
- 템플릿 심사 3-5 영업일 소요
- 비용: 건당 8원 (SMS 대비 저렴)
- 야간 발송 제한 (21:00-08:00)

### 6.3 next-pwa
- deprecated 의존성 경고 다수
- Next.js 16 Turbopack과 호환 안됨 → --webpack 필요
- 프로덕션 배포 전 철저한 테스트 권장

### 6.4 이미지 업로드
- 리뷰 작성 취소 시 업로드된 이미지 잔류 가능
- 추후 관리자 배치 삭제 또는 제출 시점 업로드 고려

---

## 7. 참고 자료

- [react-kakao-maps-sdk 문서](https://react-kakao-maps-sdk.jaeseokim.dev/)
- [카카오맵 API 개발 가이드](https://apis.map.kakao.com/web/guide/)
- [카카오 비즈니스 채널 API](https://business.kakao.com/)
- [next-pwa 문서](https://github.com/shadowwalker/next-pwa)
- [Next.js Image 최적화](https://nextjs.org/docs/app/building-your-application/optimizing/images)
