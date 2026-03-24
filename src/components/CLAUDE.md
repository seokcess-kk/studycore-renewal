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

/* 외부 브랜드 컬러 */
--kakao:      #FEE500   /* 카카오 노랑 */
--kakao-dark: #191919   /* 카카오 텍스트 */
--naver:      #03C75A   /* 네이버 그린 */
--google:     #4285F4   /* 구글 블루 */
```

### 예외: 원형 UI 요소
아바타, 아이콘 뱃지 등 원형이 필요한 UI는 `style={{ borderRadius: "50%" }}`를 사용합니다.
`border-radius: 0 !important` 글로벌 오버라이드가 Tailwind `rounded-*`를 차단하므로, 원형 요소는 인라인 스타일로 처리합니다.

## 타이포그래피
- 헤드라인: Noto Serif KR (next/font/google)
- 본문: Noto Sans KR
- 번호·레이블: IBM Plex Mono

### 고정 타입 스케일
| 토큰 | CSS 변수 | 크기 | 용도 |
|------|----------|------|------|
| `text-label` | `--text-label` | 10px | mono 섹션 라벨, 장식 텍스트 |
| `text-caption` | `--text-caption` | 11px | 뱃지, 태그, 타임스탬프 |
| `text-small` | `--text-small` | 12px | 보조 메타, 에러 메시지 |
| `text-secondary` | `--text-secondary` | 13px | 네비 링크, 보조 텍스트 |
| `text-body` | `--text-body` | 14px | 본문, 폼 입력, 테이블 |
| `text-reading` | `--text-reading` | 15px | 긴 설명문, 소개 문단 |
| `text-subhead` | `--text-subhead` | 17px | FAQ 질문, 카드 제목 |

### 유동 타입 스케일 (clamp)
| 토큰 | 범위 | 용도 |
|------|------|------|
| `text-fluid-display` | 40–96px | 히어로 H1, 브랜드명 |
| `text-fluid-h1` | 32–56px | 섹션 대제목 |
| `text-fluid-h2` | 22–32px | 페이지 제목, 중제목 |
| `text-fluid-h3` | 18–24px | 피처 제목 |

### 행간 (line-height)
| 클래스 | 값 | 용도 |
|--------|-----|------|
| `leading-heading` | 1.15 | 제목 |
| `leading-ui` | 1.4 | UI 텍스트 |
| `leading-prose` | 1.7 | 본문 문단 |

### 자간 (letter-spacing)
| 클래스 | 값 | 용도 |
|--------|-----|------|
| `tracking-heading` | -0.03em | 제목 압축 |
| `tracking-cta` | 0.04em | 버튼/CTA |
| `tracking-label` | 0.2em | 라벨/대문자 |

## 레이아웃 토큰

### 섹션 수직 패딩
| 클래스 | 값 | 용도 |
|--------|-----|------|
| `section-sm` | 48px (3rem) | 소섹션 |
| `section-md` | 80px (5rem) | About 등 라이트 섹션 |
| `section-lg` | 112px (7rem) | 마케팅 대형 섹션 |

### 컨테이너 너비 (Tailwind `max-w-*` + `mx-auto`)
| 클래스 | 너비 | 용도 |
|--------|------|------|
| `max-w-md mx-auto` | 448px | 로그인/등록 폼 |
| `max-w-3xl mx-auto` | 768px | 약관/공지/블로그 본문 |
| `max-w-4xl mx-auto` | 1024px | 시스템/가이드 |
| `max-w-6xl mx-auto` | 1344px | 팀/시설 그리드 |
※ 어드민 내부: `mx-auto` 생략 (좌측 정렬), 상세 → `admin/CLAUDE.md`

### 페이지 본문 래퍼
| 클래스 | 효과 | 대체 패턴 |
|--------|------|-----------|
| `page-body` | `padding-top: 6rem; padding-bottom: 5rem` | `pt-24 pb-20` |

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
- 참고 구현: `ConfirmModal`, `SearchModal`, `ProgramDetailModal`, `PopupModal`, `AttachmentModal`

## 첨부파일 표시 패턴
첨부파일 목록은 공통 컴포넌트를 사용할 것 (인라인 구현 금지):

| 컴포넌트 | 데이터 | 용도 | 인터랙션 |
|----------|--------|------|----------|
| `AttachmentList` | URL 배열 (`string[]`) | 질문/답변 (`image_urls`) | `onSelect` → 모달 |
| `MetaAttachmentList` | 메타데이터 배열 (`{id, file_name, file_url, file_type, file_size}`) | 공지/프로그램 첨부 | 새 탭 열기 + 원본 파일명 다운로드 |

표시 규칙:
- 이미지: `w-16 h-16` (64px) 작은 썸네일 가로 나열
- 파일(PDF 등): 아이콘 + 파일명 한 줄 리스트
- `aspect-square` / `aspect-video` 큰 그리드 사용 금지

다운로드 규칙:
- 원본 파일명 다운로드: `downloadWithName(url, fileName)` 유틸 사용 (blob fetch 방식, cross-origin 대응)
- Storage 경로는 랜덤 ID 사용 (`${timestamp}-${random}.${ext}`), 원본 파일명은 메타데이터에 보존
- fallback: fetch 실패 시 새 탭 열기

## 홈페이지 섹션 (src/components/home/)
`src/app/page.tsx`에서 순서대로:
```
HeroSection → TrustStrip → FeaturesSection → ProgramsSection
→ SpaceSlider → FAQSection → CTASection → PopupModal
```
섹션 번호 라벨(01~05) 사용.
