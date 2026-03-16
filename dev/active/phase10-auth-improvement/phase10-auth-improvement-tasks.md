# Phase 10 — Staff 인증 개선 (Tasks)

## Task 1: 통합 RPC + 서비스 단순화 ✅
- [x] `authenticate_staff` SQL 마이그레이션 작성 (029)
- [x] `repository.ts` — `authenticateStaff()` 함수 추가
- [x] `service.ts` — `staffLogin` 통합 RPC 전용으로 단순화
- [x] TypeScript 타입 체크 통과

## Task 2: DB 마이그레이션 배포 ✅
- [x] `authenticate_staff` RPC 배포 확인
- [x] 레거시 코드 제거 (개별 RPC 4함수, fallback 경로)

## Task 3: 고정 Auth 비밀번호 전환 ✅
- [x] `src/lib/staff-auth-config.ts` — 고정 비밀번호 상수 (서버 전용)
- [x] `src/app/api/auth/staff-login/route.ts` — 서버 사이드 로그인 API
- [x] `src/app/login/page.tsx` — API 라우트 호출로 전환 (fetch)
- [x] `src/app/api/admin/create-staff/route.ts` — Auth 생성 시 고정 비밀번호 사용
- [x] `supabase/migrations/030_staff_fixed_auth_password.sql` — 기존 Auth 비밀번호 일괄 변경 + change_staff_password RPC 수정
- [x] SQL 마이그레이션 배포 완료 (3개 계정 UPDATE)
- [x] 고정 비밀번호 Auth 세션 생성 검증 (admin, mentor, staff 모두 성공)
- [x] `service.ts` — `staffLogin` 함수 제거 (API 라우트로 이전)
- [x] 미사용 타입/import 정리 (`AuthResult`, `signInWithDummyEmail` 등)
- [x] TypeScript 타입 체크 통과
