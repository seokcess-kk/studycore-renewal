# DDD 3파일 패턴 — src/domains/

## 파일 구조
모든 도메인은 3개 파일로 구성:
```
model.ts      → 타입 정의, Zod 스키마
repository.ts → Supabase 쿼리 (DB 접근 유일 경로)
service.ts    → 비즈니스 로직
```

## 호출 규칙
- 컴포넌트 → service (직접 repository 호출 금지)
- service → service (크로스 도메인 허용)
- repository → repository 직접 호출 금지
- repository는 Supabase 쿼리만 담당. 비즈니스 로직 금지

## Supabase 클라이언트
- Server 측: `createServerClient()` (lib/supabase/server.ts)
- Client 측: `createBrowserClient()` (lib/supabase/client.ts)
- RLS 우회: `createAdminClient()` (lib/supabase/server.ts)

## 도메인 목록 (14개)
| 도메인 | 핵심 엔티티 | 비고 |
|--------|------------|------|
| user | UserProfile, UserRole, UserStatus | 인증/권한 중심 |
| notice | Notice, NoticeCategory | is_pinned, is_published |
| question | Question, Answer | pending→answered |
| consultation | Consultation | 외부 상담 신청 (new→contacted→done) |
| counseling | CounselingRecord | 내부 상담 기록 (**Consultation과 별개**) |
| blog | BlogPost | slug 기반 라우팅 |
| meal | MealPeriod, MealApplication | weekday/date 선택 |
| review | Review | 재원생 후기 |
| guide | GuideSection | onboarding/manual |
| notification | Notification | 알림 이력 |
| settings | SiteSettings | 사이트 설정 |
| popup | Popup | 프로모션 팝업 |
| program | Program | 프로그램 관리 |
| search | — | 통합 검색 |

## 새 도메인 추가 시
1. `src/domains/[name]/` 하위에 model.ts, repository.ts, service.ts 생성
2. model.ts에 Zod 스키마 + 타입 export
3. 이 파일의 도메인 목록 테이블에 추가
