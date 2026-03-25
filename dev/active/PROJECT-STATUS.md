# STUDYCORE 프로젝트 상태 요약

**최종 업데이트: 2026-03-18**

---

## Phase 진행 현황

| Phase | 이름 | 상태 | 비고 |
|-------|------|------|------|
| 1 | MVP | ✅ 완료 | 인프라, 공통 컴포넌트, 홈페이지 |
| 2 | Auth | ✅ 완료 | 인증, DB 스키마, 도메인 레이어 |
| 3 | Admin | ✅ 완료 | 어드민 레이아웃, 회원 관리 |
| 4 | Content | ✅ 완료 | 블로그, 도시락 도메인 |
| 5 | Functions | ✅ 완료 | Storage, 이미지 업로드, Edge Functions |
| 6 | Contents | ✅ 완료 | 알림 이력, 리뷰, PWA (PWA 제외) |
| 7 | External | ✅ 코드 완료 | 카카오맵 (API 키 대기) |
| 8 | Features | ✅ 완료 | 도시락 재원생 페이지 (출석 취소) |
| 9 | Completion | ✅ 완료 | 관리자 답변, 온보딩 CRUD |
| - | Auth-Fix | ✅ 완료 | 인증 시스템 보안 강화 |
| - | UX-Fix | ✅ 완료 | 역할별 메뉴 권한, 로그아웃 수정 |
| - | Auth-Security | ✅ 완료 | 리다이렉트 검증, OAuth 분기 통합, 서버 보호 |
| - | Enhancements v2 | ✅ 완료 | 12개 기능 개선 (Phase 0~7) |
| - | Auth-Persist | ✅ 완료 | Zustand sessionStorage persist |
| - | Question UX | ✅ 완료 | 질문방 CRUD 권한 보완 + 멘토 UX 개선 |
| - | Role Separation | ✅ 완료 | 온보딩/매뉴얼 분리, 스태프 계정 생성 API |
| - | OAuth Fix | ✅ 완료 | 카카오 PKCE 에러 수정 (route handler) |
| 12 | UI Polish | ✅ 완료 | UI 세부 폴리싱 — 반응형, 버튼, 터치 영역, 일관성 |
| - | Homepage UX | ✅ 완료 | 홈페이지 전환율 최적화 — Hero/Features/SpaceSlider 애니메이션, CTA fill, 신뢰 지표 |
| - | Full UX Audit | ✅ 완료 | 전체 페이지 UX 감사 — 질문방 5건, 전역 footer, 헤더 패턴 10건, 브랜드 컬러 통일 |
| - | Meal Enhancement | ✅ 완료 | 도시락 기능 전면 개선 — 어드민 매트릭스 뷰, 학생 sticky 바, 미신청 학생 |

---

## 배포 전 필수 작업

### SQL 마이그레이션 (Supabase)
- [x] `001` ~ `047` 전체 적용 완료 ✅

### 환경변수 설정
- [x] `NEXT_PUBLIC_SUPABASE_URL` ✅
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (스태프 계정 생성 API용)
- [ ] `NEXT_PUBLIC_KAKAO_MAP_API_KEY` (카카오맵)
- [ ] `SOLAPI_API_KEY`, `SOLAPI_API_SECRET` (SMS)
- [ ] `KAKAO_ALIMTALK_*` 관련 변수들

### 외부 서비스 등록
- [ ] 카카오 개발자 콘솔 앱 등록 (OAuth + 카카오맵)
- [ ] Solapi 계정 설정
- [ ] 카카오 알림톡 채널 등록

---

## 구현된 주요 기능

### 공개 페이지
- `/` 홈 (Hero, Features, SpaceSlider, FAQ, CTA)
- `/about` 소개 (카카오맵 연동)
- `/system` 시스템 안내
- `/blog` 블로그 목록/상세 (OG 이미지 자동 생성)
- `/consult` 상담 신청
- `/reviews` 후기 목록/작성

### 재원생 페이지 (로그인 필요)
- `/login` 로그인 (카카오 OAuth / Staff 아이디)
- `/register` 회원가입 (카카오 추가 정보)
- `/manual` 이용 매뉴얼 (DB 기반)
- `/notices` 공지사항 목록/상세
- `/questions` 질문방 목록/상세/작성 (공개/비공개, 고정)
- `/meal` 도시락 신청
- `/my` 마이페이지 (프로필, 내 질문, 도시락)

### 스태프 페이지
- `/guide` 조교 온보딩 가이드 (DB 기반)
- `/questions` 질문 관리 (스태프 컴팩트 뷰, 인라인 답변)
- `/questions/[id]` 질문 상세 + 답변 작성 + 고정/해제
- `/my` 마이페이지 (비밀번호 변경, 질문방 관리 바로가기)

### 관리자 페이지 (admin + mentor)
- `/admin` 대시보드
- `/admin/members` 회원 관리/상세/상담 기록
- `/admin/members/new` 스태프 계정 생성 (API 연동)
- `/admin/notices` 공지사항 CRUD (리치텍스트 에디터)
- `/admin/questions` 질문 관리 (뱃지, 고정)
- `/admin/blog` 블로그 CRUD
- `/admin/meal` 도시락 관리 (매트릭스 뷰, 식수 합계, 미신청 학생, 엑셀)
- `/admin/guide` 온보딩/매뉴얼 아코디언 목록 + 분리 추가/수정 페이지 (GuideSectionForm)
- `/admin/kakao` 알림톡 발송/이력
- `/admin/settings` 사이트 설정

---

## 역할별 메뉴

| 역할 | Nav 메뉴 |
|------|---------|
| 비로그인 | 특징, 시설, FAQ, 로그인, 무료 상담 신청 |
| 재원생 (active) | 공지사항, 질문방, 도시락, **매뉴얼**, 마이페이지 |
| 조교 | 공지사항, 질문방, **온보딩**, 마이페이지 |
| 멘토 | 공지사항, 질문방, **온보딩**, 마이페이지, 관리자 |
| 관리자 | 공지사항, 질문방, **온보딩**, 마이페이지, 관리자 |

---

## 도메인 구조

```
src/domains/
├── user/          ← 사용자, 프로필, 로그인/로그아웃
├── notice/        ← 공지사항
├── question/      ← 질문/답변 (고정, 공개/비공개)
├── consultation/  ← 상담 신청
├── counseling/    ← 상담 기록
├── blog/          ← 블로그
├── meal/          ← 도시락
├── review/        ← 후기
├── notification/  ← 알림
├── settings/      ← 사이트 설정
├── guide/         ← 온보딩/매뉴얼 (type 구분)
└── search/        ← 통합 검색
```

---

## 최근 변경사항

### 2026-03-25 (2차) — 어드민 UX 개선 + 디자인 토큰 일괄 교체
- **가이드 관리 개편**: 아코디언 목록 + 분리된 추가(`/admin/guide/new`)/수정(`/admin/guide/[id]/edit`) 페이지, `GuideSectionForm` 공통 컴포넌트 추출
- **질문 상세 UX**: 질문 본문 접기(120px) + 답변 아코디언(최신만 펼침, 80자 미리보기)
- **공지 작성 UX**: 팝업·알림톡 섹션 ChevronDown 접기/펼치기 전환
- **MetaAttachmentList onSelect**: 이미지 클릭 시 모달 오픈 일관성 확보 (6개 사용처)
- **디자인 토큰 전체 교체**: text-sm/xs/xl/lg → text-body/caption/fluid-h2/subhead (46개 파일)
- **Footer flex 체인**: layout.tsx div#main-content에 `flex flex-col flex-1` 추가

### 2026-03-25 (1차) — AdminSidebar 그룹핑 + 공간 관리 + E2E 테스트
- AdminSidebar 12개 flat list → 5개 그룹 구조화
- spaces 테이블 + 어드민 CRUD + SpaceSlider 동적 데이터
- Playwright E2E 38 테스트 케이스

### 2026-03-18 (4차) — 어드민 도시락 헤더 중복 수정
- **어드민 도시락 관리 페이지**: AdminHeader 중복 렌더링 제거
  - layout.tsx에서 이미 렌더링하는 AdminHeader를 meal/page.tsx에서 중복 호출하고 있던 문제 수정

### 2026-03-18 (3차) — 도시락 기능 전면 개선
- **어드민 도시락 관리 개편**
  - PeriodModal → react-hook-form + zod 전환 (CLAUDE.md 규칙 준수)
  - 신청자 매트릭스 테이블 — 학생×요일/날짜 한눈에 확인 (인라인 중/석 뱃지)
  - 식수 합계 테이블 — 요일별 중식/석식/합계 즉시 파악
  - 미신청 학생 섹션 추가 (활성 재원생 - 신청자 비교)
  - 모바일 기간 드롭다운 (데스크톱은 사이드바 유지)
  - 엑셀 다운로드에 "식수 합계" 시트 추가
  - repository에 `getActiveStudents()` 추가
- **학생 도시락 신청 UX 강화**
  - 신청 완료 배너 강화 (끼수, 날짜, 수정 안내)
  - Sticky 하단 제출 바 (선택 개수 + 버튼 항상 화면에 고정)
  - WeekdaySelector/DateSelector "전체 선택" 토글 버튼 개선 (상태 표시 + 시각적 피드백)

### 2026-03-18 (2차) — 전체 페이지 UX 감사
- **질문방 UX 감사 5건 수정**
  - 이미지 모달 통합 (AnswerCard → 부모 위임, 중복 제거)
  - 빈 상태 CTA "첫 질문 작성하기" 추가
  - 새 질문 폼 bg-stone + 카드 계층 추가
  - 이미지 썸네일 + 개수 뱃지 추가
  - "내 질문" 탭 빈 상태 메시지 분기
- **전역 footer 수정**
  - body flex + main flex-grow 전역 적용 (콘텐츠 부족 시 footer 올라오는 문제 해결)
- **전체 페이지 UX 감사 10건 수정**
  - 공지 상세: bg-stone → bg-navy 헤더 (질문/블로그 패턴 통일)
  - 마이페이지: Navy 프로필 헤더 추가 + bg-yellow-* → 브랜드 컬러(navy/teal)
  - 도시락 페이지: Navy 헤더 + mono 레이블 추가
  - 회원가입: bg-yellow-100 → bg-navy/10
  - 어드민 테이블 4개: overflow-x-auto + bg-stone 헤더 통일
  - 카카오 어드민: 중복 사이드바 제거

### 2026-03-18 (1차) — 홈페이지 전환율 최적화
- **Hero 애니메이션 강화**: spring 모션, teal 라인 장식, 글로우 효과
- **Features 호버 인터랙션**: 번호 스케일업, 보더 scaleY, 제목 색상 전환
- **SpaceSlider**: 70vh 확대, Ken Burns 줌인, 프로그레스 바
- **CTA fill 애니메이션**: 좌→우 scaleX 배경 전환 통일
- **Nav 높이 모핑**: 스크롤 시 축소, shadow 제거
- **전환율 요소**: 신뢰 지표 스트립 + Features 인라인 CTA
- **섹션 전환**: teal 디바이더 4곳 추가
- **UX 감사 6건**: 모바일 Hero, Footer 연도/중복, Features 브레이크, SpaceSlider 구분
- **Hero 레이아웃**: 상하 스택 전환 — 메인 카피 상단 풀와이드
- **프로그램 섹션**: UI 전면 개선 + 차별점 아래 이동

### 2026-03-18 (이전)
- **가이드/매뉴얼 UI 개선**
  - DB: guide_sections에 category, icon, content_html 컬럼 추가 (038 마이그레이션)
  - 공개 페이지: 사이드바 TOC + 검색 + 카테고리 그룹핑 + 이전/다음 네비게이션 (GuidePageLayout)
  - 관리자: textarea → Tiptap RichTextEditor, 카테고리/아이콘 선택 UI, 표시/숨김 토글
  - /guide, /manual 페이지를 GuidePageLayout 공용 컴포넌트로 통합
  - 하위 호환: content_html null이면 기존 content 플레인텍스트 fallback

- **Phase 12: UI 세부 폴리싱**
  - 질문방: 모바일 floating "질문하기" 버튼 추가, 필터 터치 영역 확대
  - 도시락: DateSelector sticky 첫 번째 열, 체크박스 크기 통일, "(전체)" 시각화
  - 어드민: 사이드바 반응형 (lg 미만 햄버거 + 오버레이 + scroll lock)
  - 어드민 헤더: 모바일 좌측 패딩 (햄버거 겹침 방지)
  - 마이페이지: 수정/저장 버튼 크기·스타일 개선, 로그아웃 여백 분리
  - 모바일 메뉴: CTA "무료 상담 신청" 상단 배치
  - 공지 상세: 첨부파일 패딩 대칭, 도시락 카드 패딩 통일
  - 아바타: 삭제/업로드 버튼 크기 통일 (w-7)

### 2026-03-16 (4차)
- **Zustand sessionStorage persist**
  - 페이지 리로드 시 store 즉시 복원 → 로그인 관련 타이밍 문제 근본 해결
  - AuthInitializer: "복원" → "검증" 역할로 단순화

- **질문방 CRUD 권한 보완**
  - DELETE RLS 정책 추가 (questions, question_answers)
  - 서비스에 소유자 확인 추가 (updateQuestion, deleteQuestion)
  - 공개 질문 이미지 조회 정책, 답변 삭제 시 상태 롤백
  - 관리자 목록 repository 경유로 변경

- **멘토 질문 관리 UX 개선**
  - 스태프 컴팩트 헤더 (Hero 제거, 미답변 통계)
  - 대기 시간 시각 강조 (1h 주황, 24h 빨강)
  - 인라인 아코디언 답변 (StaffQuestionCard)
  - AnswerForm 공유 컴포넌트 분리

- **온보딩/매뉴얼 분리**
  - guide_sections.type 컬럼 (onboarding/manual)
  - /guide: 조교 온보딩, /manual: 재원생 매뉴얼
  - /admin/guide: 탭으로 온보딩/매뉴얼 전환 관리

- **스태프 계정 생성 API**
  - /api/admin/create-staff (Service Role, RLS 우회)
  - 초기 비밀번호 1234, Auth + profiles + staff_credentials 동시 생성

- **카카오 OAuth PKCE 수정**
  - /auth/callback: page.tsx → route.ts (서버 Route Handler)

- **UI 개선**
  - Nav: 홈 외 페이지 어두운 텍스트 모드 (isDarkText)
  - MobileMenu: Framer Motion stagger 애니메이션
  - Hero, Features, SpaceSlider, 상담 페이지 스타일 개선

### 2026-03-16 (3차)
- 인증 보안 개선 (Auth-Security)
- 로그인 흐름 수정
- 테스트 계정 정리

### 2026-03-16 (2차)
- 역할별 메뉴 권한 분기
- 로그아웃 동작 통일

---

## 다음 단계

### 즉시 가능
1. Vercel 환경변수 설정 (`SUPABASE_SERVICE_ROLE_KEY`)
2. 위 마이그레이션 실행
3. 기능 테스트 (카카오 로그인, 질문 CRUD, 계정 생성)

### 외부 의존성 대기
1. 카카오 API 키 발급 → OAuth + 카카오맵
2. Solapi 설정 → SMS/알림톡
3. 카카오 채널 등록 → 알림톡 템플릿
