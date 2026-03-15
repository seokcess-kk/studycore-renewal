# Phase 1 MVP 아키텍처 계획

## 개요
스터디코어 1.0 공개 홈페이지 + 상담 신청 기능 MVP 구현

## 기술 스택 결정

| 영역 | 선택 | 버전 |
|------|------|------|
| 프레임워크 | Next.js | 14.x (App Router) |
| 언어 | TypeScript | strict mode |
| 스타일링 | Tailwind CSS + shadcn/ui | v4 |
| 상태 관리 | Zustand | 전역 상태 |
| 서버 상태 | TanStack Query | v5 |
| 폼 | react-hook-form + zod | |
| 애니메이션 | Framer Motion | |
| 백엔드 | Supabase | PostgreSQL + Auth |

## 디렉토리 구조 결정

```
src/
├── app/
│   ├── (public)/          ← Phase 1 집중
│   │   ├── page.tsx       ← 홈
│   │   ├── system/
│   │   ├── consult/
│   │   ├── terms/
│   │   └── privacy/
│   └── layout.tsx
├── components/
│   ├── ui/                ← shadcn (수정 금지)
│   ├── common/            ← Nav, Footer, Button
│   └── home/              ← Hero, Features, Slider, FAQ, CTA
├── domains/
│   └── consultation/      ← 상담 신청 도메인
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
└── types/
```

## 브랜드 규칙 적용

1. **globals.css**
   - `* { border-radius: 0 !important; }`
   - shadow 클래스 무효화

2. **tailwind.config.ts**
   - 브랜드 컬러 토큰 추가
   - 폰트 패밀리 설정

3. **shadcn 컴포넌트**
   - 생성 후 rounded 제거 불필요 (globals.css에서 override)

## 컴포넌트 계층

```
layout.tsx
├── Nav (sticky, 스크롤 전환)
├── children
└── Footer

page.tsx (홈)
├── HeroSection
├── FeaturesSection (6개 차별점)
├── SpaceSlider (4슬라이드)
├── FAQSection
└── CTASection
```

## 상담 신청 플로우

```
1. 사용자: /consult 폼 작성 제출
2. Route Handler: POST /api/consult
3. consultation repository: consultations 테이블 저장
4. Supabase Edge Function: notify-consult 호출
   ├── 관리자: 카카오 알림톡
   └── 신청자: SMS
5. 응답: 성공 메시지
```

## 인증 없이 시작

Phase 1은 공개 페이지만 구현하므로 인증 설정은 Phase 2에서 진행.
단, Supabase 클라이언트 설정은 미리 완료.
