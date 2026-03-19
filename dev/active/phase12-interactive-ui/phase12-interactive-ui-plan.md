# Phase 12 — 홈페이지 인터랙티브 UI 강화

## 목표
Hanzo/Gibson 레퍼런스의 인터랙티브함을 스터디코어 브랜드 톤(에디토리얼 + 미니멀 + 신뢰감)에 맞게 선별 적용.
대상이 학부모/학생이므로 "와 멋있다"보다 "여기 제대로 된 곳이다"라는 인상을 주는 방향.

## 레퍼런스 분석 요약

**Hanzo** — 에디토리얼 포트폴리오
- 흑백 + 단일 악센트(오렌지), 텍스트 stroke 효과
- 스크롤 기반 요소별 reveal, will-change 최적화
- Instrument Serif + Inter 조합 (현재 스터디코어와 유사한 serif+sans 구조)

**Gibson** — 다크 사이드바 포트폴리오
- 미세 그리드 텍스처 오버레이 (opacity 0.07)
- View Transition API 기반 페이지 전환
- 다층 그림자 카드 (스터디코어에는 shadow 금지로 불가)
- 스크롤 연동 프로그레스 인디케이터

## 현재 홈페이지 구성

```
Nav (fixed, 스크롤 시 축소)
├── HeroSection (2컬럼 그리드, 격자 배경, stagger 텍스트, stroke 타이포)
├── ProgramsSection (카드 그리드, 데이터 없으면 숨김) [Phase 11 신규]
├── FeaturesSection (6행, 호버 좌측 teal 보더, whileInView)
├── SpaceSlider (드래그 제스처, 자동 재생, 격자 오버레이)
├── FAQSection (sticky 좌측 타이틀 + 아코디언)
├── CTASection (2컬럼, 격자 배경, 연락처 행)
└── Footer (3컬럼)
    PopupModal (오버레이) [Phase 11 신규]
```

이미 Framer Motion 기반 애니메이션이 상당히 적용되어 있음.
추가할 것은 "스크롤 연동 인터랙션"과 "미세한 폴리시" 위주.

---

## 구현 항목 (5개)

### 1. 스크롤 프로그레스 바
**파일**: `src/components/common/Nav.tsx` 또는 별도 `ScrollProgress.tsx`
**내용**: 페이지 최상단에 teal 색 2px 바가 스크롤 진행률에 따라 좌→우로 채워짐
**기술**: `framer-motion`의 `useScroll()` + `motion.div`의 `scaleX` 바인딩
**효과**: 콘텐츠가 길어도 현재 위치를 직관적으로 인지. Gibson 스타일 요소.
**난이도**: 낮음

```
구현 스케치:
const { scrollYProgress } = useScroll()
<motion.div style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
  className="fixed top-0 left-0 right-0 h-0.5 bg-teal z-[999]" />
```

### 2. Hero 패럴랙스 (격자 배경 + 워터마크)
**파일**: `src/components/home/HeroSection.tsx`
**내용**:
- 격자 배경이 스크롤 시 콘텐츠보다 0.3배 속도로 느리게 이동
- "10" 워터마크가 0.15배 속도로 더 느리게 이동
- 전체 Hero 섹션이 스크롤 아웃 시 살짝 opacity 감소

**기술**: `useScroll({ target })` + `useTransform(scrollY, [0, 1], [0, -100])`
**효과**: 깊이감 추가. 단순 정적 배경 → 생동감 있는 첫인상.
**난이도**: 중

### 3. Features 텍스트 하이라이트 애니메이션
**파일**: `src/components/home/FeaturesSection.tsx`
**내용**: 각 FeatureRow의 `<strong>` 텍스트 아래에 teal 밑줄이 뷰포트 진입 시 좌→우로 그어지는 효과
**기술**: `whileInView` + `width: 0 → 100%` transition (CSS pseudo-element 또는 inline span)
**효과**: 핵심 메시지를 시각적으로 강조. Hanzo의 악센트 컬러 활용 방식 차용.
**난이도**: 중

```
구현 방향:
- <strong> 태그를 감싸는 <span className="relative"> 추가
- ::after pseudo-element로 하단 2px teal 바
- whileInView로 width 0% → 100% 애니메이션
- 기존 dangerouslySetInnerHTML → 컴포넌트 기반으로 전환 필요
```

### 4. 숫자 통계 카운터 섹션
**파일**: 신규 `src/components/home/StatsSection.tsx`
**위치**: HeroSection ↔ ProgramsSection 사이 (또는 ProgramsSection ↔ FeaturesSection 사이)
**내용**:
```
운영 시간  |  재원생  |  질문 답변  |  만족도
2,400+    |  --명   |  ---건     |  98%
```
- 숫자가 뷰포트 진입 시 0에서 목표값까지 카운트업
- 브랜드 컬러 배경 (navy-dark + 격자), font-mono 숫자
- 4컬럼 그리드, 모바일 2x2

**기술**: `useInView` + `useSpring` 또는 커스텀 카운터 훅
**효과**: 신뢰감 + 구체적 실적 전달. 학부모에게 가장 효과적인 설득 요소.
**난이도**: 중

### 5. ProgramsSection 카드 호버 인터랙션
**파일**: `src/components/home/ProgramsSection.tsx`
**내용**:
- 카드 호버 시 이미지가 살짝 scale(1.05)으로 확대 (overflow hidden으로 잘림)
- 호버 시 teal 상단 보더(3px) 등장
- 제목 텍스트 색상 navy → teal 전환

**기술**: CSS transition (group-hover) — JS 불필요
**효과**: 정적 카드에 생동감. border-radius 0 + shadow 금지 규칙 내에서 시각적 피드백 추가.
**난이도**: 낮음

---

## 적용하지 않는 것 (의도적 제외)

| 요소 | 제외 이유 |
|------|----------|
| 다크 사이드바 네비게이션 | 학부모 대상 신뢰감 사이트에 부적합 |
| 풀페이지 스크롤 스냅 | 콘텐츠 양 많음 + 모바일 UX 저해 |
| 커서 팔로워/글로우 | 모바일 사용 비중 높을 것으로 예상, 데스크톱 전용 효과 비효율 |
| View Transition API | 브라우저 지원 아직 불안정 (Safari 미지원) |
| box-shadow 카드 | CLAUDE.md 절대 금지 |
| border-radius | CLAUDE.md 절대 금지 |
| 과도한 모션 | prefers-reduced-motion 미대응 시 접근성 이슈 |

## 기술 제약

- `framer-motion` 이미 설치됨 — 추가 의존성 없이 구현 가능
- `prefers-reduced-motion` 미디어 쿼리 존중 필요 (패럴랙스, 카운터 등 비활성화)
- SSR 호환: useScroll 등은 클라이언트 전용 → "use client" 지시어 필수
- 모바일 성능: 패럴랙스는 모바일에서 비활성화 (will-change 최소화)

## 예상 작업량

| 항목 | 예상 |
|------|------|
| 1. 스크롤 프로그레스 바 | 소 |
| 2. Hero 패럴랙스 | 소~중 |
| 3. Features 텍스트 하이라이트 | 중 |
| 4. 숫자 통계 섹션 | 중 |
| 5. 카드 호버 인터랙션 | 소 |

## 의존성

- 1~5번 모두 독립적, 순서 무관하게 개별 적용 가능
- 4번(통계 섹션)은 page.tsx 수정 필요 (섹션 배치 위치)
- 3번은 FeaturesSection의 dangerouslySetInnerHTML 리팩터링 수반
