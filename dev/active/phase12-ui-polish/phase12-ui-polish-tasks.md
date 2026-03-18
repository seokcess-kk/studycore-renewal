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

## 2026-03-18 (1차) 홈페이지 전환율 최적화

- [x] Hero 섹션 하단에 신뢰 지표 스트립 추가 (재원생 수, 만족도, 상담 건수)
- [x] Features 섹션에 인라인 CTA 버튼 추가
- [x] 프로그램 섹션을 차별점 아래로 이동 (Hero와 색상 분리)
- [x] ProgramsSection 미사용 함수 제거 + 스크롤 gap 수정

## 2026-03-18 (2차) 전체 페이지 UX 감사 (10건)

- [x] #1: body flex-col min-h-dvh + main flex:1 (전역 footer 하단 고정)
- [x] #2: 공지 상세 헤더 bg-stone → bg-navy 패턴 통일
- [x] #3: 마이페이지 bg-yellow → bg-navy 헤더, 브랜드 컬러 통일
- [x] #4: 회원가입 bg-yellow-100 → bg-navy/10 브랜드 컬러 통일
- [x] #5: 질문방 FAB 버튼 확인 (이미 존재, bottom-6 right-6)
- [x] #6: 어드민 blog/consultations/popups/programs 테이블 overflow-x-auto + bg-stone 헤더
- [x] #7: 어드민 kakao/history 중복 AdminSidebar 제거
- [x] #8: 어드민 도시락 매트릭스 뷰 → 별도 3차 작업으로 분리
- [x] #10: 어드민 가이드 RHF 전환 → 별도 작업 예정
- [x] #11-12: 로딩 스피너 통일, 후기 페이지 → 별도 작업 예정

## 2026-03-18 (3차) 도시락 기능 전면 개선 (11건)

### A. 어드민 (5건)
- [x] A1: PeriodModal을 react-hook-form + zod로 전환 (CLAUDE.md 필수 규칙)
- [x] A2: 신청 목록 — 펼침 행 → 인라인 매트릭스 테이블 (학생×요일, 중/석 배지)
- [x] A3: 일별 식수 합계 테이블 (점심/저녁/합계 행)
- [x] A4: 미신청 학생 목록 (activeStudents vs applications 비교)
- [x] A5: 모바일 기간 선택 드롭다운 (lg 미만 사이드바 숨김)

### B. 학생 (4건)
- [x] B1: WeekdaySelector/DateSelector 반응형 패딩·체크박스 크기
- [x] B2: 신청 완료 배너 (teal/10, 끼 수·날짜·수정일 표시)
- [x] B3: Sticky 하단 제출 바 (fixed bottom-0, 선택 끼 수 + 버튼)
- [x] B4: "전체 선택/해제" 토글 버튼 (텍스트→버튼 전환, 상태 피드백)

### C. 공통 (2건)
- [x] C1: Excel 엑스포트 2시트 (식수 합계 + 신청 상세)
- [x] C2: repository에 getActiveStudents() 추가, service 래퍼

## 가이드/매뉴얼 UI 개선

- [x] DB 마이그레이션: guide_sections에 category, icon, content_html 컬럼 추가 (038)
- [x] 도메인 model/repository: 새 필드 반영 (category, icon, content_html)
- [x] GuidePageLayout 공용 컴포넌트: 사이드바 TOC + 검색 + 카테고리 그룹핑 + 이전/다음 네비게이션
- [x] /guide, /manual 페이지: GuidePageLayout으로 통합 전환
- [x] /admin/guide 관리자: textarea → Tiptap RichTextEditor, 카테고리/아이콘 선택, 표시/숨김 토글
