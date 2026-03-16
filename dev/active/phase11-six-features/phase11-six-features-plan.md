# Phase 11 — Plan

## 아키텍처
- 신규 도메인 2개: popup, program (DDD 3파일 패턴)
- 신규 어드민 페이지 8개: consultations(1), popups(3), programs(3), + AdminHeader/Sidebar 수정
- 신규 홈 컴포넌트 2개: PopupModal, ProgramsSection
- DB 마이그레이션 2개: 031_add_popups.sql, 032_add_programs.sql
- 기존 코드 수정 4개: AdminHeader, AdminSidebar, notices/new, consultation/service

## 기술 결정
- 팝업 모달은 Framer Motion 사용 (기존 Toast 컴포넌트와 동일 패턴)
- "오늘 하루 안 보기"는 localStorage 기반 (popup_dismissed_{id}_{date})
- 프로그램 섹션은 데이터 없으면 섹션 자체 비노출
- SMS 알림 실패는 상담 신청 성공에 영향 없음 (비동기 best-effort)
