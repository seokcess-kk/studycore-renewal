# Phase 2 Auth 컨텍스트

## 결정 이력

### 2025-03-15: 인증 방식 결정

**결정:** 카카오 OAuth (재원생) + username/password (스태프)

**이유:**
- 재원생: 카카오 계정 보유율 높음, 별도 회원가입 불필요
- 스태프: 관리 편의성, 카카오 계정 공유 불가

**구현:**
- 카카오 OAuth → Supabase Auth Provider
- username 로그인 → username@studycore.internal 더미 이메일 변환

---

### 2025-03-15: 사용자 상태 관리 방식

**결정:** Zustand + persist 미들웨어

**이유:**
- 전역 상태 관리 필요 (role, status, isStaff 등)
- 페이지 새로고침 시 세션 유지 필요
- TanStack Query는 서버 상태용으로 분리

**구현:**
```typescript
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({ ... }),
    { name: "studycore-user", partialize: (state) => ({ user, profile }) }
  )
);
```

---

### 2025-03-15: RLS 정책 설계

**결정:** 역할 기반 접근 제어 (RBAC)

**이유:**
- 4가지 역할: student, assistant, mentor, admin
- 역할별 CRUD 권한 명확히 분리
- SQL 함수로 역할 검사 로직 재사용

**구현:**
- `get_user_role()`, `is_admin()`, `is_staff()` 헬퍼 함수
- 테이블별 SELECT/INSERT/UPDATE/DELETE 정책

---

### 2025-03-15: 조회수 증가 방식

**결정:** RPC 함수 + fallback 로직

**이유:**
- 동시성 문제 방지 (race condition)
- RPC 없는 환경에서도 동작하도록 fallback

**구현:**
```sql
CREATE OR REPLACE FUNCTION increment_notice_view_count(notice_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notices SET view_count = view_count + 1 WHERE id = notice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 참고 자료 위치

| 자료 | 경로 |
|------|------|
| SQL 스키마 | `/supabase/migrations/001_initial_schema.sql` |
| RLS 정책 | `/supabase/migrations/002_rls_policies.sql` |
| RPC 함수 | `/supabase/migrations/003_add_view_count_rpc.sql` |
| User 도메인 | `/src/domains/user/` |
| Notice 도메인 | `/src/domains/notice/` |
| Question 도메인 | `/src/domains/question/` |

---

## 알려진 제약 사항

1. **카카오 OAuth**: Supabase Dashboard에서 Provider 설정 필요
2. **신규 가입 플로우**: /register 페이지 미구현 (Phase 3)
3. **이메일 인증**: 스태프 계정은 이메일 인증 생략 (내부 도메인)
4. **프로필 사진**: 카카오 프로필 사진 동기화 미구현
