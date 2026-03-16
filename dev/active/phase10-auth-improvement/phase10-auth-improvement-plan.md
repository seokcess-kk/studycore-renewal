# Phase 10 — Staff 인증 개선 (Plan)

## 아키텍처

### 개선 후 Staff 로그인 플로우 (2회 네트워크 호출)
```
1. authenticate_staff RPC (단일 트랜잭션)
   ├── 계정 잠금 확인
   ├── 비밀번호 검증 (staff_credentials bcrypt)
   ├── Staff 역할 확인 (profiles)
   ├── 로그인 시도 기록
   └── 성공 시 프로필 데이터 반환

2. signInWithPassword (Auth 세션 생성)
   └── 더미 이메일 방식 유지 (RLS auth.uid() 용)
```

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `supabase/migrations/029_staff_auth_unification.sql` | `authenticate_staff` 통합 RPC 함수 |
| `src/domains/user/repository.ts` | `authenticateStaff()` 추가 |
| `src/domains/user/service.ts` | `staffLogin` 단순화 + `staffLoginLegacy` fallback |

## 기술 결정

### 통합 RPC (`authenticate_staff`)
- `SECURITY DEFINER` — 인증 전 사용자가 호출하므로 RLS 우회 필수
- `anon` 권한 부여 — 로그인 전 호출
- 프로필 전체를 `to_jsonb(p.*)` 로 반환 — 추가 쿼리 불필요
- 기존 개별 RPC는 유지 (하위 호환)

### 레거시 Fallback
- `authenticate_staff` RPC 미배포 환경을 위해 `staffLoginLegacy` 유지
- RPC 호출 시 42883 에러(함수 없음) → 자동 fallback
- 배포 확인 후 제거 예정

### 보류: 고정 Auth 비밀번호
- Auth 비밀번호를 고정값으로 통일하면 비밀번호 동기화 제거 가능
- 단, `signInWithPassword`가 클라이언트에서 호출되므로 고정값이 JS 번들에 노출
- 향후 서버 사이드 로그인 API 라우트 도입 시 재검토
