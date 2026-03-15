# 인증 시스템 수정 태스크

## Phase 1: 긴급 수정 ✅

### Task 1.1: Staff 로그인 보안 강화 ✅
- [x] Supabase에 staff_credentials 테이블 생성 → SQL 스크립트 제공
- [x] verify_staff_password RPC 함수 생성 → SQL 스크립트 제공
- [x] repository.ts에 verifyStaffPassword 함수 추가
- [x] service.ts staffLogin 함수 수정 (RPC + fallback)
- [ ] 기존 Staff 계정 마이그레이션 (Supabase에서 SQL 실행 필요)
- [ ] 테스트 (SQL 실행 후)

> **참고**: `supabase/migrations/018_add_staff_credentials.sql` 파일을 Supabase SQL Editor에서 실행하세요.

### Task 1.2: Race Condition 수정 ✅
- [x] Providers.tsx에 AbortController 추가
- [x] 비동기 작업 전후 mounted 체크
- [x] cleanup 함수에서 abort 호출
- [x] 빌드 테스트 완료

### Task 1.3: 로그아웃 기능 구현 ✅
- [x] Nav.tsx에 로그아웃 버튼 추가
- [x] 로그아웃 핸들러 구현 (signOut + logout + redirect)
- [ ] 로그아웃 확인 모달 (선택사항 - 추후 구현)
- [x] 빌드 테스트 완료

---

## Phase 2: 중요 수정 ✅

### Task 2.1: 상태별 안내 페이지 ✅
- [x] /pending-approval/page.tsx 생성
- [x] /account-inactive/page.tsx 생성
- [x] middleware.ts 리다이렉트 로직 수정
- [x] 빌드 테스트 완료

### Task 2.2: 역할 상수 통합 ✅
- [x] constants.ts에 STAFF_ROLES, ADMIN_ACCESS_ROLES 추가
- [x] 헬퍼 함수 생성 (isStaffRole, hasAdminAccess, isAdmin, isMentor, isStudent)
- [x] middleware.ts 상수 사용으로 변경
- [x] useUserStore.ts 상수 사용으로 변경
- [x] service.ts, login/page.tsx 업데이트
- [x] 빌드 테스트 완료

### Task 2.3: 에러 로깅 개선 ✅
- [x] src/lib/logger.ts 생성
- [x] 로깅 레벨 정의 (error, warn, info, debug)
- [x] 프로덕션 환경 조건부 로깅
- [x] Providers.tsx, service.ts의 console.error를 logger로 교체
- [x] 빌드 테스트 완료

### Task 2.4: 미들웨어 최적화 ✅
- [x] 보호된 라우트에서만 프로필 조회 (이미 구현됨)
- [x] 불필요한 쿼리 제거 (role, status만 조회)
- [x] 빌드 테스트 완료

---

## Phase 3: 개선 ✅

### Task 3.1: register 페이지 DDD 패턴 적용 ✅
- [x] 직접 DB 쿼리를 service 함수로 교체 (createUserProfile, getCurrentProfile)
- [x] model.ts에 studentRegisterSchema 추가
- [x] logger 사용으로 변경
- [x] ROUTES, USER_STATUS 상수 사용
- [x] 빌드 테스트 완료

### Task 3.2: 계정 잠금 구현 ✅
- [x] login_attempts 테이블 SQL 생성 (supabase-login-attempts.sql)
- [x] repository.ts에 checkAccountLockout, recordLoginAttempt 추가
- [x] service.ts staffLogin에 잠금 로직 통합
- [x] 5회 실패 시 15분 잠금, 잠금 메시지 표시
- [x] 빌드 테스트 완료

> **참고**: `supabase/migrations/019_add_login_attempts.sql`을 Supabase에서 실행해야 활성화됩니다.

### Task 3.3: 토큰 만료 알림 ✅
- [x] SessionWarning 컴포넌트 생성 (common/SessionWarning.tsx)
- [x] 토큰 만료 10분 전 감지
- [x] 경고 알림 표시 (우하단)
- [x] "세션 연장" 버튼 (refreshSession)
- [x] Providers.tsx에 통합
- [x] 빌드 테스트 완료

### Task 3.4: 감사 로그 기본 구조 ✅
- [x] audit_logs 테이블 SQL 생성 (supabase-audit-logs.sql)
- [x] src/lib/audit.ts 생성 (로깅 함수, 액션 상수)
- [x] 헬퍼 함수: logUserStatusChange, logUserRoleChange, logNoticeCreate 등
- [x] 빌드 테스트 완료

> **참고**: `supabase/migrations/020_add_audit_logs.sql`을 Supabase에서 실행해야 활성화됩니다.

---

## Phase 4: 최적화

### Task 4.1: 초기 로드 성능 개선 ✅ (분석 완료)
- [x] 미들웨어-AuthInitializer 중복 쿼리 분석
- [x] 현재 구조 분석:
  - Middleware: 서버에서 실행, 보호된 라우트에서만 프로필 조회
  - AuthInitializer: 클라이언트에서 실행, 세션 확인 후 프로필 조회
  - 서버/클라이언트 분리로 인해 데이터 공유 불가
- [x] 최적화 방안 검토:
  - JWT custom claims: Supabase 설정 변경 필요
  - 쿠키 기반 캐싱: 보안 고려 필요
  - RSC 활용: 아키텍처 변경 필요
- **결론**: 현재 구조에서는 추가 최적화 비용 대비 효과 낮음. 향후 필요 시 검토.

### Task 4.2: Skeleton UI 적용 ✅
- [x] Skeleton 컴포넌트 이미 존재 (common/Skeleton.tsx)
- [x] AuthInitializer가 비블로킹이므로 별도 Skeleton 불필요
- [x] 개별 페이지에서 필요시 Skeleton 사용 가능

---

## 완료 기록

| 태스크 | 완료일 | 비고 |
|--------|--------|------|
| Task 1.1 | 2026-03-16 | SQL 스크립트 제공, 코드 수정 완료 |
| Task 1.2 | 2026-03-16 | AbortController 추가, 빌드 성공 |
| Task 1.3 | 2026-03-16 | Nav.tsx 로그아웃 버튼 추가, 빌드 성공 |
| Task 2.1 | 2026-03-16 | 상태별 안내 페이지 생성, 미들웨어 리다이렉트 |
| Task 2.2 | 2026-03-16 | 역할 상수 및 헬퍼 함수 통합 |
| Task 2.3 | 2026-03-16 | logger.ts 생성, 로깅 교체 |
| Task 2.4 | 2026-03-16 | 이미 최적화됨 확인 |
| Task 3.1 | 2026-03-16 | register 페이지 DDD 패턴 적용 |
| Task 3.2 | 2026-03-16 | 계정 잠금 SQL 및 로직 구현 |
| Task 3.3 | 2026-03-16 | SessionWarning 컴포넌트 생성 |
| Task 3.4 | 2026-03-16 | 감사 로그 SQL 및 유틸리티 생성 |
| Task 4.1 | 2026-03-16 | 성능 분석 완료, 현재 구조 유지 |
| Task 4.2 | 2026-03-16 | Skeleton 컴포넌트 이미 존재 확인 |

---

## 코드 리뷰 개선 사항 (2026-03-16)

| 항목 | 수정 내용 |
|------|----------|
| repository.ts console → logger | 모든 console.warn/error를 logger로 교체 |
| SessionWarning 에러 로깅 | catch 블록에 logger.debug 추가 |
| SessionWarning 상수 이동 | constants.ts에 SESSION 상수 추가 |
| staffLogin 코드 중복 제거 | signInWithDummyEmail 헬퍼 함수 추출 |
| updateProfile 빈 객체 체크 | Object.keys 체크 추가 |
| 로그인 실패 메시지 통일 | LOGIN_ERROR_MESSAGE 상수로 보안 강화 |

---

## 전체 완료 요약

**총 13개 태스크 완료**

### 생성된 파일
- `src/lib/logger.ts` - 로깅 유틸리티
- `src/lib/audit.ts` - 감사 로그 유틸리티
- `src/app/pending-approval/page.tsx` - 승인 대기 안내
- `src/app/account-inactive/page.tsx` - 계정 비활성화 안내
- `src/components/common/SessionWarning.tsx` - 세션 만료 경고

### 생성된 SQL 마이그레이션 (Supabase 실행 필요)
- `supabase/migrations/018_add_staff_credentials.sql` - Staff 보안 강화
- `supabase/migrations/019_add_login_attempts.sql` - 계정 잠금
- `supabase/migrations/020_add_audit_logs.sql` - 감사 로그

### 수정된 주요 파일
- `src/lib/constants.ts` - 역할 상수 및 헬퍼 함수
- `src/stores/useUserStore.ts` - 상수 사용
- `src/middleware.ts` - 상태별 리다이렉트, 상수 사용
- `src/components/Providers.tsx` - AbortController, SessionWarning
- `src/components/common/Nav.tsx` - 로그아웃 버튼
- `src/domains/user/service.ts` - 계정 잠금, logger
- `src/domains/user/repository.ts` - RPC 함수들
- `src/domains/user/model.ts` - studentRegisterSchema
- `src/app/register/page.tsx` - DDD 패턴 적용
- `src/app/login/page.tsx` - hasAdminAccess 헬퍼
