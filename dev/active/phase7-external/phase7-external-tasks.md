# Phase 7 External - Tasks

**상태: 코드 구현 완료**
**기간: 2025-03-15**

---

## 1단계: 카카오맵 연동 ✅ 완료

### 패키지 설치
- [x] `npm install react-kakao-maps-sdk`

### 코드 구현
- [x] src/lib/constants.ts - KAKAO, LOCATION 상수 추가
- [x] src/types/kakao.d.ts - window.kakao 타입 선언
- [x] src/components/about/LocationSection.tsx
  - [x] 카카오맵 SDK 동적 로드
  - [x] Map, MapMarker 컴포넌트 구현
  - [x] 로딩/에러 상태 처리
  - [x] API 키 없을 때 플레이스홀더
  - [x] isMounted 패턴으로 메모리 누수 방지

### 코드 리뷰 반영
- [x] useEffect 클린업 개선 (isMounted 플래그)
- [x] KAKAO.CHANNEL_URL 중복 제거 (CONTACT.kakaoChannel 참조)

### 대기 중 (외부 의존성)
- [ ] 카카오 개발자 콘솔 앱 등록
- [ ] NEXT_PUBLIC_KAKAO_MAP_API_KEY 환경변수 설정

---

## 2단계: 알림톡 연동 ⏳ 대기

### 외부 의존성 (운영팀)
- [ ] 카카오 비즈니스 채널 개설
- [ ] 알림톡 발송 권한 신청
- [ ] 템플릿 5개 심사 신청
  - [ ] SC_CONSULT_ADMIN
  - [ ] SC_CONSULT_CUSTOMER
  - [ ] SC_QUESTION_MENTOR
  - [ ] SC_ANSWER_STUDENT
  - [ ] SC_NOTICE_STUDENT
- [ ] KAKAO_CHANNEL_ID, KAKAO_ALIMTALK_KEY 환경변수 설정

### 코드 수정 (템플릿 승인 후)
- [ ] supabase/functions/_shared/alimtalk.ts 실제 API 연동

---

## 3단계: About 콘텐츠 ⏳ 대기

### 콘텐츠 수집 (운영팀)
- [ ] 시설 사진 4장 수령
- [ ] 강사 프로필 사진 4장 수령
- [ ] 강사 소개글 수령

### 코드 수정 (콘텐츠 수령 후)
- [ ] public/images/ 폴더에 이미지 배치
- [ ] FacilitySection, TeamSection 업데이트

---

## 4단계: Reviews 이미지 ✅ 완료

### SQL 마이그레이션
- [x] supabase/migrations/012_add_review_images_bucket.sql
  - [x] review-images 버킷 생성 (3MB, jpeg/png/webp)
  - [x] RLS: 공개 읽기
  - [x] RLS: 본인 폴더 업로드
  - [x] RLS: 본인 폴더 수정
  - [x] RLS: 본인 폴더 삭제

### 코드 구현
- [x] src/app/(member)/reviews/write/page.tsx
  - [x] ImageUploader import
  - [x] images state 추가
  - [x] ImageUploader 컴포넌트 (maxFiles: 3, maxSizeMB: 1)
  - [x] createReview에 images 전달

- [x] src/app/(public)/reviews/page.tsx
  - [x] next/image import
  - [x] 이미지 갤러리 (3열 그리드)
  - [x] Image 컴포넌트 (fill, sizes 속성)

### 코드 리뷰 반영
- [x] `<img>` → `<Image>` (next/image) 변경

### 대기 중
- [ ] SQL 마이그레이션 실행 (배포 시)

---

## 5단계: PWA 설정 ✅ 완료

### 패키지 설치
- [x] `npm install next-pwa`

### 파일 생성/수정
- [x] public/manifest.json
  - [x] name: "스터디코어 1.0"
  - [x] short_name: "스터디코어"
  - [x] theme_color: "#103050"
  - [x] background_color: "#F4F2EE"
  - [x] icons 설정

- [x] next.config.js (ts → js 변환)
  - [x] withPWA 래퍼 적용
  - [x] development 모드 비활성화
  - [x] register: true, skipWaiting: true

- [x] src/app/layout.tsx
  - [x] Viewport import 추가
  - [x] viewport export (themeColor, width, initialScale)
  - [x] metadata.manifest 추가
  - [x] metadata.appleWebApp 설정

- [x] package.json
  - [x] build 스크립트에 --webpack 플래그 추가

### 대기 중
- [ ] 아이콘 파일 생성 (icon-192x192.png, icon-512x512.png)

---

## 6단계: 코드 리뷰 ✅ 완료

### 리뷰 항목
- [x] 기능 완성도 검토
- [x] 코드 품질 검토
- [x] 성능 최적화 검토
- [x] 보안 검토

### 권장 수정사항 반영
- [x] reviews/page.tsx: `<img>` → `<Image>` (next/image)
- [x] LocationSection.tsx: useEffect isMounted 패턴 적용
- [x] constants.ts: CHANNEL_URL 중복 제거

---

## 7단계: 빌드 검증 ✅ 완료

### 빌드 결과
- [x] `npm run build` 성공 (0 에러)
- [x] 34개 라우트 생성
- [x] themeColor 경고 해결 (viewport export)

---

## 진행 상태 요약

| 영역 | 상태 | 비고 |
|------|------|------|
| 카카오맵 연동 | ✅ 완료 | API 키 설정 필요 |
| 알림톡 연동 | ⏳ 대기 | 템플릿 심사 필요 |
| About 콘텐츠 | ⏳ 대기 | 콘텐츠 수집 필요 |
| Reviews 이미지 | ✅ 완료 | SQL 실행 필요 |
| PWA 설정 | ✅ 완료 | 아이콘 생성 필요 |
| 코드 리뷰 | ✅ 완료 | 권장 수정 반영 |
| 빌드 검증 | ✅ 완료 | 0 에러 |

---

## 구현된 파일 목록

### 신규 파일 (4개)
```
src/types/kakao.d.ts
supabase/migrations/012_add_review_images_bucket.sql
public/manifest.json
next.config.js
```

### 수정 파일 (6개)
```
src/lib/constants.ts                            (KAKAO, LOCATION, 중복 제거)
src/components/about/LocationSection.tsx        (카카오맵, isMounted)
src/app/(member)/reviews/write/page.tsx         (ImageUploader)
src/app/(public)/reviews/page.tsx               (next/image 갤러리)
src/app/layout.tsx                              (viewport export)
package.json                                    (build --webpack)
```

### 삭제 파일 (1개)
```
next.config.ts                                  (js로 대체)
```

---

## 배포 전 체크리스트

### 환경변수 설정
- [ ] Vercel: NEXT_PUBLIC_KAKAO_MAP_API_KEY

### SQL 실행
- [ ] 012_add_review_images_bucket.sql

### 콘텐츠 준비
- [ ] PWA 아이콘 (192x192, 512x512)

---

## 설치된 패키지

```json
{
  "react-kakao-maps-sdk": "^1.2.1",
  "next-pwa": "^5.6.0"
}
```

---

## 다음 단계 (Phase 8 예고)

### 우선순위 높음
- 알림톡 실제 연동 (템플릿 승인 후)
- About 페이지 콘텐츠 (시설/강사 정보)

### 우선순위 중간
- 도시락 신청 시스템
- 출석 체크 시스템

### 우선순위 낮음
- 학부모 연동
- 성적 관리
