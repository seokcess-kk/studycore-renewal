# Phase 4 Content 컨텍스트

## 현재 상태

**Phase 4 상태: 계획 수립**

## 의존성

### Phase 3에서 완료된 것
- [x] 어드민 레이아웃 및 컴포넌트
- [x] 권한 검사 (middleware + 클라이언트)
- [x] site_settings 테이블 (메뉴 노출 제어)
- [x] profiles 테이블 + RLS
- [x] 공지/질문 시스템
- [x] 에러 바운더리

### Phase 4에서 필요한 것
- [ ] blog_posts 테이블
- [ ] lunch_periods, lunch_applications 테이블
- [ ] Storage 버킷 (blog-thumbnails, question-images 등)
- [ ] Edge Functions (알림 발송)
- [ ] 카카오 알림톡 템플릿 심사

---

## 결정 이력

### 블로그 렌더링 전략

**결정:** SSG + ISR (Incremental Static Regeneration)

**이유:**
- SEO 최적화 (광산구 독서실 키워드 유입)
- 빠른 페이지 로드
- 발행 시 자동 재생성

**구현:**
```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // 1시간마다 재검증

export async function generateStaticParams() {
  // 모든 발행된 포스트 slug 반환
}
```

---

### 도시락 신청 방식

**결정:** 요일별/날짜별 선택 옵션 제공

**이유:**
- 월 단위: 요일별 선택 (월~일 반복)
- 특정 기간: 날짜별 선택 (캘린더 UI)
- 관리자가 기간 설정 시 선택

**구현:**
- `lunch_periods.selection_type`: 'weekday' | 'date'
- `lunch_applications.selections`: JSONB 형태로 저장

---

### Edge Functions 구조

**결정:** 기능별 분리 + 공통 발송 함수

**이유:**
- 관심사 분리
- 공통 로직 재사용
- 실패 시 SMS 폴백 일관성

**구현:**
```
supabase/functions/
├── _shared/
│   └── kakao-alimtalk.ts  ← 공통 발송 + SMS 폴백
├── notify-consult/        ← 상담 신청 알림
├── notify-question/       ← 질문 등록 알림
├── notify-answer/         ← 답변 등록 알림
└── revalidate-blog/       ← ISR 재생성 트리거
```

---

### 네이버 블로그 복사 기능

**결정:** 클립보드 API + HTML 형식

**이유:**
- 네이버 블로그 에디터가 HTML 붙여넣기 지원
- 이미지 포함 복사 가능
- 별도 연동 API 불필요

**구현:**
- Markdown → HTML 변환
- 이미지 URL 절대 경로 변환
- `navigator.clipboard.write()` 사용

---

## 참고 자료 위치

| 자료 | 경로 |
|------|------|
| SPEC 문서 | `/STUDYCORE_SPEC_v1.0.md` |
| 블로그 스키마 | SPEC 5.7장 |
| 도시락 스키마 | SPEC 5.8, 5.9장 |
| Edge Functions | SPEC 9.1장 |
| Storage 버킷 | SPEC 9.2장 |
| 알림톡 템플릿 | SPEC 9.5장 |

---

## 알려진 제약 사항

1. **카카오 알림톡**: 템플릿 사전 심사 필요 (1~2주 소요)
   - 상담 접수, 질문 등록, 답변 완료, 공지 발송 템플릿

2. **SMS API**: 서비스 선택 미정
   - 후보: 솔라피, NHN Cloud
   - 알림톡 실패 시 폴백용

3. **블로그 콘텐츠**: 초기 SEO를 위한 입시 정보 콘텐츠 필요

4. **도시락 신청 기간**: 초기 설정값 필요

5. **신입생 안내**: 콘텐츠 미정

---

## 외부 서비스 연동

### 카카오 알림톡
- 비즈니스 채널: http://pf.kakao.com/_execQn
- 템플릿 심사 필요
- 환경변수: `KAKAO_ALIMTALK_SENDER_KEY`, `KAKAO_ALIMTALK_API_KEY`

### SMS (폴백)
- 서비스 미정 (솔라피 등)
- 환경변수: `SMS_API_KEY`, `SMS_SENDER_NUMBER`

### Next.js ISR
- revalidate 엔드포인트 필요
- 환경변수: `REVALIDATE_SECRET`
