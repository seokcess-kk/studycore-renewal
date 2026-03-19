# 어드민 규칙 — src/app/admin/

인증·권한·Supabase 클라이언트의 전역 규칙은 루트 CLAUDE.md 참조.
이 파일은 어드민 영역에만 해당하는 추가 규칙을 다룬다.

## 레이아웃 구조
- `layout.tsx` — 사이드바 + 헤더 래핑
- `AdminSidebar` (src/components/admin/) — 역할별 메뉴 필터링
- `AdminHeader` — 로그아웃, 프로필

## 스태프 계정 생성
- API: `src/app/api/admin/create-staff/`
- `createAdminClient()` 사용 (RLS 우회 필수)
- 비밀번호는 bcrypt 해싱 후 저장

## 데이터 조회 패턴
- 목록 페이지: `createBrowserClient()` + TanStack Query (클라이언트 사이드)
- 초기 로드가 중요한 페이지: `createServerClient()` (서버 사이드)
- 계정 생성·권한 변경 등 관리 작업: `createAdminClient()`
