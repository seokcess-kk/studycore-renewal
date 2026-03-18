# Phase 12: UI 세부 폴리싱 — Context

## 배경
전체 UI를 세밀하게 검토한 결과, 버튼 위치/크기, 반응형 미지원, 터치 영역, 시각적 일관성 등 다수의 개선 포인트 발견.
기능 추가가 아닌 기존 UI의 완성도를 높이는 작업.

## 주요 발견 사항
1. 질문방 "질문하기" 버튼이 Hero 안에만 있어 스크롤 후 접근 불가
2. DateSelector 가로 스크롤 시 식사 레이블 열이 사라짐
3. 어드민 사이드바가 태블릿/모바일에서 반응형 미지원 (w-64 고정)
4. 마이페이지 수정/저장 버튼이 text-xs로 너무 작음
5. 필터 버튼 터치 영역이 44px 미만
6. 모바일 메뉴 CTA가 하단에 묻혀 주목도 낮음
7. 폼 입력 필드 패딩 불일치 (py-2 / py-2.5 / py-3)
8. 공지 첨부파일 하단 패딩 비대칭
9. 도시락 카드 패딩 불일치 (p-5)
10. 아바타 삭제/업로드 버튼 크기 불일치

## 가이드/매뉴얼 UI 개선 (2026-03-18)

기존 `/guide`, `/manual` 페이지가 단순 아코디언 패턴 + 플레인텍스트만 표시.
관리자 페이지도 textarea로만 입력.

### 개선 사항
- 사이드바 TOC + 리치 콘텐츠 뷰 "가이드 허브" 형태로 전환
- 카테고리별 그룹핑, 검색, 이전/다음 네비게이션
- 모바일 드롭다운 TOC
- 관리자: Tiptap WYSIWYG 에디터, 카테고리 선택, 아이콘 선택, 표시/숨김 토글
- DB: category, icon, content_html 컬럼 추가
- 하위 호환: content_html이 null이면 기존 content 플레인텍스트 fallback

## 2026-03-18 홈페이지 전환율 최적화

### 배경
공개 홈페이지에 신뢰 지표와 CTA가 부족하여 전환율이 낮을 수 있는 구조.

### 변경
- Hero 하단에 신뢰 지표 스트립 (재원생 수, 만족도, 상담 건수)
- Features 섹션에 인라인 CTA 추가
- 프로그램 섹션 위치 조정 (Hero와 색상 분리)

## 2026-03-18 전체 UX 감사 (10건)

### 배경
ui-ux-pro-max 스킬을 활용하여 전체 페이지 UX 일관성 감사 수행.

### 주요 발견 및 수정
1. **전역 footer 하단 고정**: body flex-col min-h-dvh + main flex:1 0 auto (globals.css @layer base)
2. **헤더 패턴 통일**: 공지 상세, 마이페이지 등 bg-stone/bg-yellow → bg-navy 패턴으로 통일
3. **브랜드 컬러 위반**: bg-yellow-100 등 비브랜드 색상 → 브랜드 토큰으로 교체
4. **어드민 테이블 가로 스크롤**: blog/consultations/popups/programs 테이블에 overflow-x-auto 추가
5. **중복 사이드바**: kakao/history 페이지에서 AdminSidebar 이중 렌더 제거

## 2026-03-18 도시락 기능 전면 개선

### 배경
어드민: 신청자별 상세 보기가 개별 확장(expand) 방식 → 전체 현황 파악 어려움.
학생: 신청 완료 피드백이 미약하고, 제출 버튼이 스크롤 후 보이지 않음.

### 핵심 결정
- **매트릭스 테이블**: 펼침 행(expand row) 대신 학생×요일 매트릭스 + 인라인 배지(중/석)
- **식수 합계**: 일별 점심/저녁/합계 → 도시락 발주 수량 즉시 확인 가능
- **미신청 학생**: 전체 active 학생 - 신청 학생 = 미신청 목록 표시
- **Sticky 하단 바**: 학생 신청 페이지에 fixed bottom 제출 바 (선택 수 + 버튼)
- **PeriodModal RHF 전환**: CLAUDE.md "모든 폼 react-hook-form + zod 필수" 규칙 준수

### 참고
- repository에 `getActiveStudents()` 추가 (profiles 테이블, role=student, status=active)
- Excel 엑스포트 2시트: "식수 합계" + "신청 상세"

## 제약 사항
- border-radius: 0 (globals.css 강제) — AvatarUploader 인라인 borderRadius: "50%"는 의도적 예외
- box-shadow 절대 금지
- 기존 컴포넌트 API/props 변경 없음
