# 인증 시스템 수정 계획

## 개요
- **목표**: 코드 리뷰에서 발견된 인증 시스템 문제점 해결
- **범위**: 로그인, 세션 관리, 권한 검사, 보안 강화
- **예상 작업량**: 총 15개 태스크

---

## Phase 1: 긴급 수정 (Critical)

### 1.1 Staff 로그인 보안 강화
**문제**: 더미 이메일(`username@studycore.internal`) 방식은 보안 취약
**해결**: Supabase RPC 함수로 비밀번호 검증 분리

```sql
-- Supabase에서 실행
CREATE TABLE staff_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION verify_staff_password(p_username TEXT, p_password TEXT)
RETURNS TABLE(user_id UUID, is_valid BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT sc.user_id, (sc.password_hash = crypt(p_password, sc.password_hash))
  FROM staff_credentials sc
  WHERE sc.username = p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**수정 파일**:
- `src/domains/user/service.ts` - staffLogin 함수 수정
- `src/domains/user/repository.ts` - verifyStaffPassword 추가

---

### 1.2 Race Condition 수정
**문제**: AuthInitializer에서 비동기 작업 중 unmount 가능
**해결**: AbortController 사용 + 상태 체크 강화

**수정 파일**:
- `src/components/Providers.tsx`

---

### 1.3 로그아웃 기능 구현
**문제**: signOut() 함수는 있으나 UI 없음
**해결**: Nav 컴포넌트에 로그아웃 버튼 추가

**수정 파일**:
- `src/components/common/Nav.tsx`
- 필요시 로그아웃 확인 모달

---

## Phase 2: 중요 수정 (Important)

### 2.1 상태별 안내 페이지 구현
**문제**: pending/inactive 상태 시 안내 없이 홈으로 리다이렉트
**해결**: 상태별 전용 페이지 생성

**새 파일**:
- `src/app/pending-approval/page.tsx` - 승인 대기 안내
- `src/app/account-inactive/page.tsx` - 비활성 계정 안내

**수정 파일**:
- `src/middleware.ts` - 상태별 리다이렉트 로직

---

### 2.2 역할 상수 통합
**문제**: "admin", "mentor" 등 문자열이 여러 파일에 분산
**해결**: 상수 파일 통합 및 타입 안전성 강화

**수정 파일**:
- `src/lib/constants.ts` - ROLES, USER_STATUS 상수 확장
- `src/middleware.ts` - 상수 사용
- `src/stores/useUserStore.ts` - 상수 사용
- `src/components/Providers.tsx` - 상수 사용

---

### 2.3 에러 로깅 개선
**문제**: console.error만 사용, 프로덕션 모니터링 불가
**해결**: 에러 로깅 유틸리티 생성

**새 파일**:
- `src/lib/logger.ts` - 로깅 유틸리티

**수정 파일**:
- 모든 catch 블록에서 logger 사용

---

### 2.4 미들웨어 최적화
**문제**: 매 요청마다 profiles 테이블 쿼리
**해결**: 보호된 라우트에서만 프로필 조회

**수정 파일**:
- `src/middleware.ts` - 조건부 프로필 조회

---

## Phase 3: 개선 (Enhancement)

### 3.1 register 페이지 DDD 패턴 적용
**문제**: DB 직접 쿼리, repository/service 미사용
**해결**: service 함수 사용으로 리팩토링

**수정 파일**:
- `src/app/register/page.tsx`

---

### 3.2 계정 잠금 구현
**문제**: 반복 로그인 실패 시 보호 없음
**해결**: 실패 횟수 추적 및 임시 잠금

**새 파일**:
- `src/domains/user/login-attempt.ts` - 로그인 시도 추적

**수정 파일**:
- `src/domains/user/service.ts` - 잠금 로직 추가

---

### 3.3 토큰 만료 알림
**문제**: 자동 로그아웃만 있음, 사용자 알림 없음
**해결**: 만료 전 경고 모달

**새 파일**:
- `src/components/common/SessionWarning.tsx`

**수정 파일**:
- `src/components/Providers.tsx` - 토큰 만료 감지

---

### 3.4 감사 로그 기본 구조
**문제**: 관리자 활동 추적 없음
**해결**: audit_logs 테이블 및 기본 로깅

```sql
-- Supabase에서 실행
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Phase 4: 최적화 (Optimization)

### 4.1 초기 로드 성능 개선
**문제**: 500-1300ms 초기 로드 시간
**해결**:
- 미들웨어와 AuthInitializer 중복 쿼리 제거
- JWT에 역할 정보 포함

---

### 4.2 Skeleton UI 적용
**문제**: isLoading 중 빈 화면
**해결**: Skeleton 컴포넌트로 대체

---

## 작업 순서 및 의존성

```
Phase 1 (긴급)
├── 1.1 Staff 로그인 보안 ──┐
├── 1.2 Race Condition ────┼── 독립 작업 가능
└── 1.3 로그아웃 구현 ─────┘

Phase 2 (중요)
├── 2.1 상태별 페이지 ─────┬── 1.3 완료 후
├── 2.2 역할 상수 통합 ────┤
├── 2.3 에러 로깅 ─────────┤
└── 2.4 미들웨어 최적화 ───┘

Phase 3 (개선)
├── 3.1 register DDD ──────┬── Phase 2 완료 후
├── 3.2 계정 잠금 ─────────┤
├── 3.3 토큰 만료 알림 ────┤
└── 3.4 감사 로그 ─────────┘

Phase 4 (최적화)
├── 4.1 성능 개선 ─────────┬── Phase 3 완료 후
└── 4.2 Skeleton UI ───────┘
```

---

## 체크리스트

### Phase 1
- [ ] 1.1 Staff 로그인 보안 강화
- [ ] 1.2 Race Condition 수정
- [ ] 1.3 로그아웃 기능 구현

### Phase 2
- [ ] 2.1 상태별 안내 페이지
- [ ] 2.2 역할 상수 통합
- [ ] 2.3 에러 로깅 개선
- [ ] 2.4 미들웨어 최적화

### Phase 3
- [ ] 3.1 register 페이지 리팩토링
- [ ] 3.2 계정 잠금 구현
- [ ] 3.3 토큰 만료 알림
- [ ] 3.4 감사 로그

### Phase 4
- [ ] 4.1 초기 로드 성능 개선
- [ ] 4.2 Skeleton UI 적용

---

## 위험 요소

| 위험 | 영향 | 완화 방법 |
|------|------|----------|
| Staff 로그인 변경 시 기존 계정 | 높음 | 마이그레이션 스크립트 작성 |
| 미들웨어 변경 시 권한 우회 | 높음 | 테스트 케이스 작성 |
| 세션 로직 변경 시 로그아웃 | 중간 | 점진적 롤아웃 |

---

## 예상 결과

| 항목 | Before | After |
|------|--------|-------|
| Staff 로그인 보안 | 더미 이메일 | bcrypt 검증 |
| 로그아웃 | 없음 | Nav에 버튼 |
| 상태 안내 | 홈 리다이렉트 | 전용 페이지 |
| 에러 추적 | console.error | 구조화된 로깅 |
| 초기 로드 | ~1초 | ~300ms |
