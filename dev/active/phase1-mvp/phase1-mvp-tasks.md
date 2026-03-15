# Phase 1 MVP 작업 목록

## 인프라

- [x] Next.js 프로젝트 생성
- [x] 의존성 설치
- [x] shadcn/ui 초기화
- [x] CLAUDE.md 작성
- [x] .env.local 설정
- [x] .claude/skills/ 생성
- [x] .claude/agents/ 생성
- [x] .claude/settings.json 생성
- [x] dev/active/phase1-mvp/ 생성
- [x] globals.css — 브랜드 컬러 토큰 + border-radius:0 override 추가
- [x] next/font — Noto Serif KR + Noto Sans KR + IBM Plex Mono 로드
- [x] Supabase 클라이언트 설정 (client.ts, server.ts, middleware.ts)
- [x] src/lib/constants.ts — 상수 정의
- [x] src/middleware.ts — 라우트 보호 설정

## 도메인 레이어 (DDD)

- [x] src/domains/consultation/ 수동 작성 (model.ts + repository.ts + service.ts)
      → 이후 모든 도메인의 기준 패턴

## 공통 컴포넌트

- [x] <Nav /> — sticky, 스크롤 전환, 로고 색상 변경
- [x] <Footer />
- [x] <Button /> — 3 variant, border-radius:0
- [x] <Toast /> — ToastProvider + useToast 훅

## 홈페이지 섹션

- [x] layout.tsx — 폰트, 메타데이터, Providers
- [x] / 홈 — Hero 섹션
- [x] / 홈 — 차별점 섹션 (6개, VerB 번호 스택)
- [x] / 홈 — 시설 슬라이더 (4슬라이드)
- [x] / 홈 — FAQ 아코디언
- [x] / 홈 — 상담 신청 CTA

## 정적 페이지

- [x] /system — 운영 시스템 (교시제, 생활 규정, 벌점 제도)
- [x] /terms — 이용약관
- [x] /privacy — 개인정보처리방침

## 상담 신청 기능

- [x] /consult 페이지 (폼: 이름, 연락처, 유형, 내용)
- [x] POST /api/consult Route Handler
- [x] consultations 테이블 저장 로직 (DDD 서비스 연동)
- [x] Rate limiting 구현 (3 requests/min per IP)

## 에러 처리 및 로딩

- [x] src/app/error.tsx — 에러 바운더리
- [x] src/app/global-error.tsx — 전역 에러 처리
- [x] src/app/not-found.tsx — 404 페이지
- [x] src/components/common/Skeleton.tsx — 스켈레톤 컴포넌트
- [x] 각 페이지 loading.tsx 추가

## 검증

- [x] npm run build 0 에러
- [x] npm run lint 통과
- [x] 브랜드 규칙 준수 확인 (radius 없음, shadow 없음)
- [x] 코드 리뷰 완료

---

## ✅ Phase 1 MVP 완료 (2025-03-15)

### 빌드 결과
```
Route (app)
├ ○ /
├ ○ /_not-found
├ ƒ /api/consult
├ ○ /consult
├ ○ /privacy
├ ○ /system
└ ○ /terms
```

### 완료된 페이지
- `/` — 홈페이지 (5개 섹션)
- `/system` — 운영 시스템
- `/terms` — 이용약관
- `/privacy` — 개인정보처리방침
- `/consult` — 상담 신청

### 완료된 API
- `POST /api/consult` — 상담 신청 처리 (rate limiting 적용)

### 코드 리뷰 이슈 해결 (2025-03-15)

| 우선순위 | 이슈 | 해결 |
|---------|------|------|
| 높음 | Rate limiting 없음 | in-memory rate limiter 구현 |
| 높음 | API 응답 타입 미정의 | ConsultationApiResponse 타입 추가 |
| 중간 | 에러 바운더리 없음 | error.tsx, global-error.tsx, not-found.tsx 추가 |
| 중간 | 로딩 상태 없음 | Skeleton 컴포넌트 + 각 페이지 loading.tsx |
| 낮음 | Nav 앵커 링크 이슈 | usePathname으로 조건부 처리 |
| 낮음 | 공통 상수 정의 없음 | lib/constants.ts에 정의 완료 |

---

## 다음 단계 → Phase 2 완료
