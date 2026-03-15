# Phase 1 MVP 컨텍스트

## 결정 이력

### 2024-XX-XX: 프로젝트 초기화

**결정:** Next.js 14 App Router + TypeScript strict mode

**이유:**
- SPEC 문서에서 명시된 기술 스택
- SSG/ISR 지원으로 SEO 최적화
- Server/Client Component 분리로 성능 최적화

---

### 2024-XX-XX: 브랜드 규칙 적용 방식

**결정:** globals.css에서 `* { border-radius: 0 !important; }` 전역 적용

**이유:**
- shadcn 컴포넌트 개별 수정 불필요
- 실수로 rounded 클래스 사용해도 무효화됨
- 유지보수 용이

**대안 검토:**
- shadcn 컴포넌트 개별 수정 → 유지보수 어려움
- Tailwind 설정에서 rounded 제거 → 급진적, 필요 시 사용 불가

---

### 2024-XX-XX: 폰트 로딩 방식

**결정:** next/font/google 사용

**이유:**
- 자동 최적화
- FOUT/FOIT 방지
- 별도 CDN 불필요

**구현:**
```typescript
import { Noto_Serif_KR, Noto_Sans_KR, IBM_Plex_Mono } from 'next/font/google';
```

---

### 2024-XX-XX: 상담 신청 알림 방식

**결정:** Supabase Edge Function에서 알림 발송

**이유:**
- API 키 클라이언트 노출 방지
- 카카오 알림톡 + SMS 폴백 로직 서버에서 처리
- SPEC 문서 인프라 설계 준수

**플로우:**
1. Route Handler에서 DB 저장
2. Edge Function invoke
3. 알림 발송 결과 로깅

---

## 참고 자료 위치

| 자료 | 경로 |
|------|------|
| SPEC 문서 | `/STUDYCORE_SPEC_v1.0.md` |
| UI 레퍼런스 1 | `/UI_REF_01_Editorial_v2.html` |
| UI 레퍼런스 2 | `/UI_REF_02_Stack_VerB.html` |
| vibe-guideline | `/vibe-guideline.md` |
| 브랜드 스킬 | `/.claude/skills/brand-design-system/SKILL.md` |

---

## 알려진 제약 사항

1. **카카오 알림톡**: 템플릿 사전 심사 필요 (1~2주 소요)
2. **SMS API**: 서비스 선택 미정 (솔라피 등 검토)
3. **시설 사진**: 플레이스홀더 사용, 추후 실사 교체
4. **도메인**: 영문 도메인 미정 (studycore10.com 등)
