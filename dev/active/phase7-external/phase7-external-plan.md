# Phase 7 External - Plan

**버전: 1.1**
**최종 수정: 2025-03-15**

---

## 1. 개요

Phase 7은 STUDYCORE 서비스의 **외부 API 연동 및 기능 완성** 단계입니다.

### 목표 (완료)
1. ✅ 카카오맵 API 연동 (About 페이지 지도)
2. ⏳ 알림톡 실제 연동 (템플릿 심사 대기)
3. ⏳ About 페이지 콘텐츠 완성 (콘텐츠 수집 대기)
4. ✅ Reviews 이미지 첨부 기능
5. ✅ PWA 설정

---

## 2. 아키텍처

### 2.1 카카오맵 연동

```
LocationSection.tsx
    │
    ├─► useEffect (SDK 동적 로드)
    │       │
    │       ├─► window.kakao 존재 확인
    │       │
    │       ├─► Script 태그 생성 + head 추가
    │       │       src="//dapi.kakao.com/v2/maps/sdk.js"
    │       │
    │       ├─► onload → kakao.maps.load()
    │       │       └─► isMounted 체크 후 setIsLoaded(true)
    │       │
    │       └─► onerror → setIsError(true)
    │
    └─► 렌더링
            ├─► !hasApiKey → MapFallback
            ├─► isError → MapFallback
            ├─► !isLoaded → MapLoading
            └─► isLoaded → <Map> + <MapMarker>
```

### 2.2 Reviews 이미지 흐름

```
/reviews/write
    │
    ├─► [ImageUploader]
    │       │
    │       ├─► 이미지 선택 (최대 3장)
    │       │
    │       ├─► browser-image-compression
    │       │       └─► maxWidth: 1920, maxSizeMB: 1
    │       │
    │       └─► Supabase Storage 업로드
    │               └─► review-images/{user_id}/{uuid}.ext
    │
    ├─► createReview({ ..., images: [url1, url2, ...] })
    │
    └─► 저장 완료 → /reviews 리다이렉트

/reviews (목록)
    │
    └─► review.images.map()
            └─► <Image fill sizes="..." /> (next/image)
```

### 2.3 PWA 구조

```
public/
├── manifest.json
├── icon-192x192.png  (⏳ 생성 필요)
├── icon-512x512.png  (⏳ 생성 필요)
└── sw.js (빌드 시 자동 생성)

next.config.js
    └─► withPWA({
            dest: 'public',
            disable: development,
            register: true,
            skipWaiting: true
        })

layout.tsx
    ├─► metadata.manifest = "/manifest.json"
    └─► viewport.themeColor = "#103050"
```

---

## 3. 구현 완료 내역

### 3.1 카카오맵 연동

| 항목 | 파일 | 설명 |
|------|------|------|
| 상수 | constants.ts | KAKAO, LOCATION 추가 |
| 타입 | src/types/kakao.d.ts | window.kakao 타입 선언 |
| 컴포넌트 | LocationSection.tsx | Map, MapMarker, 로딩/에러 상태 |

### 3.2 Reviews 이미지

| 항목 | 파일 | 설명 |
|------|------|------|
| SQL | 012_add_review_images_bucket.sql | 버킷 + RLS 4개 |
| 작성 | reviews/write/page.tsx | ImageUploader 연동 |
| 목록 | reviews/page.tsx | next/image 갤러리 |

### 3.3 PWA 설정

| 항목 | 파일 | 설명 |
|------|------|------|
| Manifest | public/manifest.json | 앱 정보, 테마 색상 |
| Config | next.config.js | withPWA 설정 |
| Viewport | layout.tsx | themeColor, appleWebApp |
| Build | package.json | --webpack 플래그 |

---

## 4. 파일 목록

### 신규 파일
```
src/types/kakao.d.ts
supabase/migrations/012_add_review_images_bucket.sql
public/manifest.json
next.config.js
```

### 수정 파일
```
src/lib/constants.ts                            (KAKAO, LOCATION 추가)
src/components/about/LocationSection.tsx        (카카오맵 연동)
src/app/(member)/reviews/write/page.tsx         (ImageUploader)
src/app/(public)/reviews/page.tsx               (next/image 갤러리)
src/app/layout.tsx                              (viewport export)
package.json                                    (build --webpack)
```

### 삭제 파일
```
next.config.ts                                  (js로 대체)
```

---

## 5. 검증 결과

```bash
$ npm run build

✓ Compiled successfully in 40s
✓ Generating static pages (34/34)
✓ 0 errors, 0 warnings
```

**라우트 (34개):**
- 정적: 26개 (○)
- 동적: 8개 (ƒ)

---

## 6. 배포 체크리스트

### 환경변수 설정
- [ ] Vercel: NEXT_PUBLIC_KAKAO_MAP_API_KEY
- [ ] Supabase Secrets: KAKAO_CHANNEL_ID (알림톡 승인 후)
- [ ] Supabase Secrets: KAKAO_ALIMTALK_KEY (알림톡 승인 후)

### SQL 마이그레이션
- [ ] 012_add_review_images_bucket.sql 실행

### 콘텐츠 준비
- [ ] PWA 아이콘 (192x192, 512x512)
- [ ] 시설 사진 4장
- [ ] 강사 프로필 4장

### 카카오 개발자 콘솔
- [ ] 앱 등록
- [ ] 플랫폼 > Web > 도메인 등록

---

## 7. 추후 작업 (Phase 8)

| 항목 | 우선순위 | 설명 |
|------|---------|------|
| 알림톡 실제 연동 | 높음 | 템플릿 심사 승인 후 |
| About 콘텐츠 | 높음 | 시설/강사 정보 입력 |
| 도시락 신청 시스템 | 중간 | 메뉴 관리, 신청, 정산 |
| 출석 체크 시스템 | 중간 | QR/NFC 출석, 리포트 |
| 학부모 연동 | 낮음 | 자녀 연결, 알림 수신 |
