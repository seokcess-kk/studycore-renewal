# Phase 11 — 6가지 기능 추가 구현 (Tasks)

## 완료된 작업

- [x] 1. 관리자 → 홈페이지 이동 버튼 (AdminHeader에 Globe 아이콘 + 링크 추가)
- [x] 2. 공지사항 등록 실패 수정 (service 레이어 사용으로 변경)
- [x] 3. SMS 알림 연동 (Edge Function 호출 주석 해제 + try-catch)
- [x] 4. 상담 관리 페이지 + 대시보드 링크
  - [x] AdminSidebar에 상담/팝업/프로그램 메뉴 추가
  - [x] 대시보드 상담 링크 `/admin/consultations`로 변경
  - [x] `/admin/consultations` 페이지 생성
  - [x] AdminHeader pageTitles 추가
- [x] 5. 메인 모달 팝업
  - [x] DB 마이그레이션 (031_add_popups.sql)
  - [x] popup 도메인 (model/repository/service)
  - [x] PopupModal 컴포넌트 (오늘 하루 안 보기, notice_id 연결)
  - [x] 어드민 CRUD (목록/생성/수정)
  - [x] 홈페이지 통합
- [x] 6. 프로그램 안내 섹션
  - [x] DB 마이그레이션 (032_add_programs.sql)
  - [x] program 도메인 (model/repository/service)
  - [x] ProgramsSection 컴포넌트 (카드 그리드, 진행/종료 뱃지)
  - [x] 어드민 CRUD (목록/등록/수정)
  - [x] 홈페이지 통합 (HeroSection 뒤 배치)

## 남은 작업 (수동)

- [ ] Supabase Dashboard에서 `popups`, `programs` 스토리지 버킷 생성 (public)
- [ ] SQL 마이그레이션 실행 (031, 032)
- [ ] SMS 환경변수 설정: `SMS_API_KEY`, `SMS_API_SECRET`, `SMS_SENDER_PHONE`, `ADMIN_PHONE`
- [ ] Edge Functions 배포: `supabase functions deploy`
