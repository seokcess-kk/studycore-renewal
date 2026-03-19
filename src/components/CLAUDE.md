# UI/브랜드 규칙 — src/components/

## 브랜드 컬러 토큰
```css
--navy:   #103050   /* 주색 — 버튼, 다크 섹션 */
--teal:   #57ADB1   /* 포인트 — 강조, CTA */
--teal-d: #3D8F94   /* teal hover */
--navy-d: #0A1F35   /* 다크 배경 — Hero, Footer */
--stone:  #F4F2EE   /* 라이트 배경 — 섹션 교차 */
--ink:    #111111   /* 본문 텍스트 */
--muted:  #888888   /* 보조 텍스트 */
--rule:   #E3E0DA   /* 구분선 */
```

## 타이포그래피
- 헤드라인: Noto Serif KR (next/font/google)
- 본문: Noto Sans KR
- 번호·레이블: IBM Plex Mono

## CTA 버튼
`globals.css`의 `cta-fill` 클래스 사용:
```html
<!-- 다크 배경 --> <Link className="cta-fill cta-fill-teal ... border-teal hover:text-teal">
<!-- 라이트 배경 --> <Link className="cta-fill cta-fill-navy ... border-navy hover:text-navy">
```

## 모달 패턴
새 모달 작성 시 아래 구조를 따를 것:
- ESC 닫기 + 오버레이 클릭 닫기 + `document.body.style.overflow` 스크롤 방지
- Framer Motion `AnimatePresence`
- `fixed inset-0 z-50` 오버레이 + `relative z-10` 본체
- 참고 구현: `ConfirmModal`, `SearchModal`, `ProgramDetailModal`, `PopupModal`

## 홈페이지 섹션 (src/components/home/)
`src/app/page.tsx`에서 순서대로:
```
HeroSection → TrustStrip → FeaturesSection → ProgramsSection
→ SpaceSlider → FAQSection → CTASection → PopupModal
```
섹션 번호 라벨(01~05) 사용.
