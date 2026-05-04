# 어드민 규칙 — src/app/admin/

인증·권한·Supabase 클라이언트의 전역 규칙은 루트 CLAUDE.md 참조.
이 파일은 어드민 영역에만 해당하는 추가 규칙을 다룬다.

## 레이아웃 구조
- `layout.tsx` — 사이드바 + 헤더 래핑
- `AdminSidebar` (src/components/admin/) — 그룹별 메뉴 + 역할별 필터링
- `AdminHeader` — 로그아웃, 프로필

### AdminSidebar 메뉴 그룹
| 그룹 | 메뉴 |
|------|------|
| *(없음)* | 대시보드 |
| **관리** | 회원 관리, 상담 관리, 도시락 관리 |
| **콘텐츠** | 공지 관리, 질문 관리, 블로그 관리 |
| **홈페이지** | 프로그램 관리, 공간 관리, 팝업 관리 |
| **운영** | 안내 템플릿, 설정 |

새 메뉴 추가 시 `navGroups` 배열의 적절한 그룹에 배치. assistant는 `assistantVisible: true`인 항목만 표시.

## 스태프 계정 생성
- API: `src/app/api/admin/create-staff/`
- `createAdminClient()` 사용 (RLS 우회 필수)
- 비밀번호는 bcrypt 해싱 후 저장

## 레이아웃 규칙
- 어드민 layout이 `p-4 lg:p-6`으로 패딩 제공 → 페이지에서 추가 패딩 불필요
- **`container-*` 토큰 사용 금지** — `margin-inline: auto`가 포함되어 어드민 좌측 정렬 깨짐
- 대신 `max-w-*` 직접 사용: `max-w-lg`(폼), `max-w-2xl`(설정/편집), `max-w-3xl`(공지), `max-w-4xl`(가이드/블로그)
- 목록 페이지(테이블)는 max-w 없이 전체 너비 사용

## 페이지별 구조

### 가이드 관리 (/admin/guide)
- **목록**: 아코디언 리스트 (클릭 → 콘텐츠 미리보기 펼침). URL `?type=onboarding|manual`로 탭 상태 관리
- **추가**: `/admin/guide/new?type=...` — `GuideSectionForm` 공통 컴포넌트 사용
- **수정**: `/admin/guide/[id]/edit` — `GuideSectionForm` + `getSectionDetail` 서비스
- **폼 컴포넌트**: `src/components/admin/GuideSectionForm.tsx` (RichTextEditor + FileAttachmentManager + 카테고리/아이콘 선택)

### 질문 상세 (/admin/questions/[id])
- 질문 본문: 120px 이상 시 접기 + 그라데이션 "더 보기" 버튼
- 답변: 아코디언 카드 (최신 답변만 기본 펼침, 나머지 축소 + 80자 미리보기)

### 공지 작성 (/admin/notices/new)
- 팝업 등록 / 알림톡 발송: ChevronDown 접기/펼치기 섹션 (활성 시 배지 표시)

## 데이터 조회 패턴
- 목록 페이지: `createBrowserClient()` + TanStack Query (클라이언트 사이드)
- 초기 로드가 중요한 페이지: `createServerClient()` (서버 사이드)
- 계정 생성·권한 변경 등 관리 작업: `createAdminClient()`
