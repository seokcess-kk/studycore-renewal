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
