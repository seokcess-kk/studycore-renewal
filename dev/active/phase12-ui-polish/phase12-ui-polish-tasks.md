# Phase 12: UI 세부 폴리싱 — Tasks

## 높은 우선순위

- [x] 질문방 모바일 floating "질문하기" 버튼 (Pencil 아이콘, teal, bottom-6 right-6)
- [x] 질문방 Hero 버튼 데스크탑 전용 (`hidden md:block`)
- [x] DateSelector 첫 번째 열 sticky (`sticky left-0 bg-white/bg-stone z-10`)
- [x] DateSelector 체크박스 w-7 → w-8 (WeekdaySelector와 통일)
- [x] 어드민 사이드바 반응형 (lg 미만 숨김 + 햄버거 + 오버레이)
- [x] 어드민 사이드바 z-index 정리 (사이드바 z-50, 오버레이 z-[45])
- [x] 어드민 사이드바 body scroll lock
- [x] 어드민 레이아웃 `pl-64` → `lg:pl-64` + 모바일 pt-16
- [x] 어드민 헤더 `pl-14 lg:pl-6` (햄버거 겹침 방지)

## 중간 우선순위

- [x] 마이페이지 수정/저장/취소 버튼 — text-xs → text-[13px], border 추가, 저장 teal 배경
- [x] 마이페이지 로그아웃 버튼 mt-4 여백
- [x] 질문방 필터 버튼 gap-2 → gap-3, py-2 → py-2.5
- [x] 모바일 메뉴 CTA "무료 상담 신청" 상단 배치

## 낮은 우선순위

- [x] 공지 상세 첨부파일 pb-2 → pb-6
- [x] 도시락 기간/요약 카드 p-5 → p-6
- [x] 아바타 삭제 w-6 / 업로드 w-8 → 모두 w-7 h-7 통일
- [x] WeekdaySelector "(전체)" text-muted → text-teal underline
- [x] DateSelector "(전체)" text-muted → text-teal underline

## 가이드/매뉴얼 UI 개선

- [x] DB 마이그레이션: guide_sections에 category, icon, content_html 컬럼 추가 (038)
- [x] 도메인 model/repository: 새 필드 반영 (category, icon, content_html)
- [x] GuidePageLayout 공용 컴포넌트: 사이드바 TOC + 검색 + 카테고리 그룹핑 + 이전/다음 네비게이션
- [x] /guide, /manual 페이지: GuidePageLayout으로 통합 전환
- [x] /admin/guide 관리자: textarea → Tiptap RichTextEditor, 카테고리/아이콘 선택, 표시/숨김 토글
