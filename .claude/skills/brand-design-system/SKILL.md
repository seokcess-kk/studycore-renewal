---
name: brand-design-system
description: "스터디코어 1.0 브랜드 디자인 시스템. 스타일링·컴포넌트·UI 작업 시 반드시 활성화."
---

# 스터디코어 브랜드 디자인 시스템

## 절대 위반 금지 (Block 모드)

1. **border-radius: 반드시 0** — shadcn 기본값을 globals.css에서 override
2. **box-shadow: 절대 사용 금지** — 모든 shadow-* 클래스 금지
3. **다크 모드: 미지원** — dark: variant 작성 금지

## 컬러 토큰

```css
:root {
  --navy:   #103050;   /* 주색 — 버튼, 다크 섹션 */
  --navy-d: #0A1F35;   /* 딥 다크 배경 — Hero, Footer */
  --teal:   #57ADB1;   /* 포인트 — 강조, CTA */
  --teal-d: #3D8F94;   /* teal hover 상태 */
  --stone:  #F4F2EE;   /* 라이트 배경 — 섹션 교차 */
  --white:  #FFFFFF;   /* 기본 배경 */
  --ink:    #111111;   /* 본문 텍스트 */
  --muted:  #888888;   /* 보조 텍스트 */
  --rule:   #E3E0DA;   /* 구분선 */
}
```

## Tailwind 컬러 매핑

```typescript
// tailwind.config.ts
colors: {
  navy: {
    DEFAULT: '#103050',
    dark: '#0A1F35',
  },
  teal: {
    DEFAULT: '#57ADB1',
    dark: '#3D8F94',
  },
  stone: '#F4F2EE',
  ink: '#111111',
  muted: '#888888',
  rule: '#E3E0DA',
}
```

## 타이포그래피 (next/font/google)

| 폰트 | 용도 | 변수명 |
|------|------|--------|
| Noto Serif KR | 헤드라인, 섹션 타이틀 | `--font-serif` |
| Noto Sans KR | 본문, 네비게이션, 폼 | `--font-sans` |
| IBM Plex Mono | 섹션 번호, 라벨, 메타 | `--font-mono` |

## globals.css 필수 override

```css
/* 반드시 포함 */
* {
  border-radius: 0 !important;
}

/* box-shadow 전역 금지 */
.shadow, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl {
  box-shadow: none !important;
}
```

## 섹션 배경 패턴

| 섹션 | 배경색 |
|------|--------|
| Hero | `#0A1F35` (navy-d) |
| 차별점 | `#F4F2EE` (stone) |
| 시설 슬라이더 | `#FFFFFF` (white) |
| FAQ | `#FFFFFF` (white) |
| 상담 신청 | `#103050` (navy) |
| Footer | `#0A1F35` (navy-d) |

## 버튼 Variant

| Variant | 배경 | 텍스트 | Border |
|---------|------|--------|--------|
| primary | teal | navy-d | teal |
| secondary | navy | white | navy |
| ghost | transparent | ink | rule |

hover 시 배경 투명화 + 텍스트 색상 전환

## UI 레퍼런스

- `UI_REF_01_Editorial_v2.html` — 전체 기준 레이아웃
- `UI_REF_02_Stack_VerB.html` — Hero 2분할 + 차별점 스택

## ✅ DO

```tsx
// 올바른 버튼
<button className="bg-teal text-navy-dark border border-teal px-6 py-3 font-bold">
  상담 신청
</button>

// 올바른 카드
<div className="border border-rule bg-white p-6">
  내용
</div>
```

## ❌ DON'T

```tsx
// 금지: rounded 클래스
<button className="rounded-lg">버튼</button>

// 금지: shadow 클래스
<div className="shadow-md">카드</div>

// 금지: dark: variant
<div className="dark:bg-slate-900">컨텐츠</div>
```
