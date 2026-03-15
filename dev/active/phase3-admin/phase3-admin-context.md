# Phase 3 Admin 컨텍스트

## 현재 상태

**Phase 3 상태: 완료 (90%)**

완료된 항목:
- 데이터베이스 (SQL 마이그레이션)
- 도메인 레이어 (counseling, settings)
- 어드민 레이아웃 및 컴포넌트
- 모든 어드민 페이지 구현
- /register 페이지
- 코드 품질 개선 (타입 안전성, 에러 바운더리)

미완료 항목:
- Edge Functions (Phase 4로 이동)
- Storage 버킷 설정
- 관리자 답변 기능

---

## 결정 이력

### 2025-03-15: 어드민 라우트 구조

**결정:** `/admin/*` 경로에 별도 레이아웃 적용

**이유:**
- 공개 페이지와 완전히 다른 UI (사이드바 + 테이블 중심)
- 별도 Nav/Footer 불필요
- CSR 전용 (SSR 없음)

**구현:**
```
/admin
├── layout.tsx       ← 사이드바 + 헤더 + ErrorBoundary
├── page.tsx         ← 대시보드
├── members/
├── notices/
├── questions/
├── settings/
└── guide/
```

---

### 2025-03-15: 어드민 권한 검사

**결정:** middleware.ts + 페이지별 이중 검사

**이유:**
- middleware: 빠른 리다이렉트, UX 개선
- 페이지: RLS 실패 시 fallback, 보안 강화

**구현:**
```typescript
// middleware.ts - 서버 사이드 검증
const adminRoles: string[] = [ROLES.ADMIN, ROLES.MENTOR];
if (!adminRoles.includes(profile.role)) {
  return NextResponse.redirect(new URL('/', request.url));
}

// admin/layout.tsx - 클라이언트 사이드 검증
const { canAccessAdmin } = useUserStore();
if (!canAccessAdmin) {
  router.replace("/");
}
```

---

### 2025-03-15: 멘토 역할 어드민 접근

**결정:** mentor 역할도 어드민 패널 접근 허용

**이유:**
- 멘토가 질문 답변, 공지 관리 필요
- admin과 동일한 관리 기능 필요

**구현:**
- `useUserStore`에 `canAccessAdmin` 속성 추가
- middleware에서 `adminRoles = [ROLES.ADMIN, ROLES.MENTOR]` 검사

---

### 2025-03-15: Supabase 조인 타입 처리

**결정:** repository에서 타입 캐스팅 통일

**이유:**
- Supabase가 조인 결과를 배열로 반환
- TypeScript 타입 불일치 발생

**구현:**
```typescript
// 조인 결과 타입 캐스팅
return (data || []).map((record) => ({
  ...record,
  student: record.student as unknown as CounselingRecordWithProfiles["student"],
  counselor: record.counselor as unknown as CounselingRecordWithProfiles["counselor"],
}));
```

---

### 2025-03-15: 에러 바운더리

**결정:** 어드민 레이아웃에 에러 바운더리 적용

**이유:**
- 개별 페이지 에러가 전체 앱 크래시 방지
- 사용자 친화적 에러 화면 제공

**구현:**
- `AdminErrorBoundary` 컴포넌트 생성
- `admin/layout.tsx`의 `{children}` 래핑

---

### 2025-03-15: Edge Functions 연기

**결정:** Edge Functions는 Phase 4로 이동

**이유:**
- 카카오 알림톡 템플릿 심사 필요 (1~2주 소요)
- SMS API 서비스 선택 미정
- 핵심 기능 우선 구현

**영향:**
- 자동 알림 기능 없이 수동 운영 가능
- Phase 4에서 알림 시스템 일괄 구현

---

## 참고 자료 위치

| 자료 | 경로 |
|------|------|
| SPEC 문서 | `/STUDYCORE_SPEC_v1.0.md` |
| 어드민 명세 | SPEC 7장 (어드민 기능 명세) |
| 인프라 설계 | SPEC 9장 (Edge Functions, Storage) |
| 공통 컴포넌트 | SPEC 10장 |

---

## 알려진 제약 사항

1. **카카오 알림톡**: 템플릿 사전 심사 필요 (1~2주 소요)
2. **SMS API**: 서비스 선택 미정 (솔라피 등 검토)
3. **Storage 버킷**: Supabase Dashboard에서 생성 필요
4. **조교 온보딩**: 문서 콘텐츠 미정
5. **상담 기록 템플릿**: 진학/진로 상담 양식 미정
6. **스태프 계정 생성**: Admin API 필요 (현재 데모용 UI만 구현)

---

## 의존성

### Phase 2에서 완료된 것
- [x] profiles 테이블 + RLS
- [x] notices 테이블 + RLS
- [x] questions 테이블 + RLS
- [x] useUserStore (role, isAdmin 확인)
- [x] 기본 인증 시스템

### Phase 3에서 완료한 것
- [x] counseling_records 테이블 (SPEC 5.6)
- [x] site_settings 테이블 (SPEC 5.10)
- [x] 어드민 레이아웃 및 모든 페이지
- [x] /register 페이지
- [x] 권한 검사 (서버 + 클라이언트)
- [x] 에러 바운더리

### Phase 4에서 필요한 것
- [ ] Storage 버킷 설정
- [ ] Edge Functions 배포
- [ ] 블로그 관리 (/admin/blog)
- [ ] 도시락 관리 (/admin/lunch)
