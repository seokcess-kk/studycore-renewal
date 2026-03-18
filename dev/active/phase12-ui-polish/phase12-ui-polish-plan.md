# Phase 12: UI 세부 폴리싱 — Plan

## 변경 대상 파일 (11개)

### 높은 우선순위
1. `src/app/questions/page.tsx` — 모바일 floating 질문하기 버튼 추가
2. `src/components/meal/DateSelector.tsx` — sticky 첫 번째 열 + 체크박스 크기 통일
3. `src/components/admin/AdminSidebar.tsx` — lg 미만 반응형 (햄버거 + 오버레이)
4. `src/app/admin/layout.tsx` — lg:pl-64 반응형 + 모바일 pt 조정
5. `src/components/admin/AdminHeader.tsx` — 모바일 좌측 패딩 (햄버거 겹침 방지)

### 중간 우선순위
6. `src/app/my/page.tsx` — 수정/저장 버튼 크기 + 로그아웃 여백
7. `src/app/questions/page.tsx` — 필터 버튼 gap/py 확대
8. `src/components/common/MobileMenu.tsx` — CTA 상단 배치

### 낮은 우선순위
9. `src/app/notices/[id]/page.tsx` — 첨부파일 pb 대칭
10. `src/app/(member)/meal/page.tsx` — 카드 패딩 p-6 통일
11. `src/components/common/AvatarUploader.tsx` — 버튼 w-7 h-7 통일
12. `src/components/meal/WeekdaySelector.tsx` — (전체) 텍스트 시각화

## z-index 계층 설계
```
z-[500] — SearchModal
z-[400] — MobileMenu (공개)
z-[300] — Nav (공개)
z-50    — AdminSidebar (어드민, 열린 상태)
z-50    — 질문방 floating 버튼 (공개, 동시 공존 안 함)
z-[45]  — AdminSidebar 오버레이
z-30    — AdminHeader (sticky)
z-10    — DateSelector sticky 열
```

## 반응형 브레이크포인트
- 질문방: `md` (768px) 기준 — Hero 버튼 hidden/floating 전환
- 어드민: `lg` (1024px) 기준 — 사이드바 표시/숨김
- 가이드: `lg` (1024px) 기준 — 사이드바 TOC 표시/모바일 드롭다운

## 가이드/매뉴얼 UI 개선 (추가)

### 변경/생성 파일 (7개)
1. `supabase/migrations/038_enhance_guide_sections.sql` — category, icon, content_html 컬럼 추가
2. `src/domains/guide/model.ts` — 스키마에 새 필드 추가
3. `src/domains/guide/repository.ts` — create에 새 필드 반영
4. `src/components/guide/GuidePageLayout.tsx` — 사이드바 TOC + 검색 + 리치 콘텐츠 뷰 공용 레이아웃
5. `src/app/guide/page.tsx` — GuidePageLayout 사용
6. `src/app/manual/page.tsx` — GuidePageLayout 사용
7. `src/app/admin/guide/page.tsx` — Tiptap + 카테고리/아이콘/표시 토글

## 2026-03-18 홈페이지 전환율 최적화

### 변경 파일 (2개)
1. `src/components/home/HeroSection.tsx` — 신뢰 지표 스트립 추가
2. `src/components/home/FeaturesSection.tsx` — 인라인 CTA 추가
3. `src/components/home/ProgramsSection.tsx` — 위치 조정, 미사용 함수 제거

## 2026-03-18 전체 UX 감사

### 변경 파일 (10개)
1. `src/app/globals.css` — main { flex: 1 0 auto; } (전역 footer 하단 고정)
2. `src/app/layout.tsx` — body에 flex flex-col min-h-dvh 추가
3. `src/app/notices/[id]/page.tsx` — bg-stone → bg-navy 헤더
4. `src/app/my/page.tsx` — bg-yellow → bg-navy 헤더, 브랜드 컬러
5. `src/app/register/page.tsx` — bg-yellow-100 → bg-navy/10
6. `src/app/admin/blog/page.tsx` — overflow-x-auto + bg-stone 테이블 헤더
7. `src/app/admin/consultations/page.tsx` — overflow-x-auto + bg-stone 테이블 헤더
8. `src/app/admin/popups/page.tsx` — overflow-x-auto + bg-stone 테이블 헤더
9. `src/app/admin/programs/page.tsx` — overflow-x-auto + bg-stone 테이블 헤더
10. `src/app/admin/kakao/page.tsx` + `kakao/history/page.tsx` — 중복 AdminSidebar 제거

## 2026-03-18 도시락 기능 전면 개선

### 변경/추가 파일 (5개)
1. `src/app/admin/meal/page.tsx` — 전면 재작성 (매트릭스 뷰, PeriodModal RHF, 미신청 학생, 식수 합계, 모바일 드롭다운)
2. `src/app/(member)/meal/page.tsx` — 신청 완료 배너, Sticky 하단 바, 선택 상세 배지
3. `src/components/meal/WeekdaySelector.tsx` — 반응형 패딩, "전체 선택/해제" 토글 버튼
4. `src/components/meal/DateSelector.tsx` — "전체 선택/해제" 토글 버튼
5. `src/domains/meal/repository.ts` + `service.ts` — getActiveStudents() 추가

## 미완료 / 향후 작업
- [ ] 어드민 가이드 RHF 전환 (현재 useState 직접 관리 → react-hook-form + zod)
- [ ] 어드민 로딩 스피너 패턴 통일
- [ ] 후기(reviews) 페이지 구현 (현재 미존재)
