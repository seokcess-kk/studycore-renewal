# Phase 11 — Context

## 결정 이력
- 2026-03-16: 6가지 기능 구현 결정 (관리자 홈페이지 링크, 공지 수정, SMS 연동, 상담 관리, 팝업, 프로그램)
- 2026-03-16: 팝업 new/edit에서 notices 조회는 경량 드롭다운 전용이므로 repository 우회 허용
- 2026-03-16: 코드 리뷰 후 3건 수정 (Edge Function 에러 처리, sort_order 방향 통일, AdminHeader 라우트 오타)

## 참고 자료
- 기존 도메인 패턴: src/domains/notice/ (model/repository/service 3파일 패턴 참조)
- 기존 어드민 페이지 패턴: src/app/admin/notices/ (목록/생성/수정 CRUD 참조)
- ImageUploader: src/components/common/ImageUploader.tsx (팝업/프로그램 이미지 업로드에 재사용)

## 제약 사항
- Storage 버킷(popups, programs) 수동 생성 필요
- SQL 마이그레이션(031, 032) 수동 실행 필요
- SMS 환경변수(SMS_API_KEY, SMS_API_SECRET, SMS_SENDER_PHONE, ADMIN_PHONE) 수동 설정 필요
