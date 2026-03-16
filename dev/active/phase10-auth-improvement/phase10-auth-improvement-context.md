# Phase 10 — Staff 인증 개선 (Context)

## 배경

Better Auth 전환을 검토했으나 RLS `auth.uid()` 의존성 때문에 비권장으로 결론.
대신 현재 Supabase Auth 프레임워크 내에서 Staff 인증 플로우를 개선합니다.

## 문제점

### 기존 Staff 로그인 플로우 (5회 네트워크 호출)
1. `checkAccountLockout` (RPC) — 계정 잠금 확인
2. `getProfileByUsername` (RPC) — 프로필 조회
3. `verifyStaffPassword` (RPC) — 비밀번호 검증
4. `signInWithPassword` (Auth) — Supabase Auth 세션 생성
5. `recordLoginAttempt` (RPC) — 시도 기록

각 단계가 별도 네트워크 호출 → 느린 로그인, 비원자적(중간 실패 시 불일치 가능)

### 불필요한 복잡성
- Fallback 코드 경로가 여러 개 (RPC 없을 때, Auth 불일치 시 등)
- 비밀번호 이중 저장 (Supabase Auth + staff_credentials)

## 결정 이력

| 날짜 | 결정 | 이유 |
|------|------|------|
| 2026-03-16 | Better Auth 전환 비권장 | RLS auth.uid() 의존성 |
| 2026-03-16 | 통합 RPC 방식 채택 | 네트워크 호출 최소화, 원자적 트랜잭션 |
| 2026-03-16 | 고정 Auth 비밀번호는 보류 | 클라이언트 노출 보안 우려, 서버 라우트 필요 |

## 제약 사항
- Supabase Auth 세션 생성(`signInWithPassword`)은 클라이언트에서 호출 필수
- 따라서 Auth 비밀번호와 staff_credentials 비밀번호 동기화 유지 필요
- `change_staff_password` RPC가 이미 양쪽을 동기화하므로 현재는 문제 없음
