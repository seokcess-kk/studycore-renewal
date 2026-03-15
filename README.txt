스터디코어 1.0 — Claude Code 전달 패키지
==========================================

■ 사용 방법

  1. Claude Code 프로젝트 새로 생성
  2. 이 패키지의 모든 파일을 프로젝트에 추가
  3. INITIAL_PROMPT.md 내용을 첫 메시지로 복붙하여 전송
  4. Claude Code가 코드 작성 전에 Phase 0~5 인프라를 먼저 구축합니다

■ 파일 목록

  INITIAL_PROMPT.md
  └── Claude Code에 보낼 첫 번째 메시지
      vibe-guideline v2.0 기반 Phase 0~5 커버:
      · 프로젝트 스캐폴딩 지시
      · CLAUDE.md 템플릿 (프로젝트 기억 계층)
      · .claude/skills/ + skill-rules.json (6개 스킬)
      · .claude/agents/ 에이전트 구성
      · .claude/hooks/ 자동 품질 게이트
      · dev/active/ 외부 기억 장치 3대 문서
      · Phase 1 MVP 체크리스트
      · 자주 하는 실수 목록

  vibe-guideline.md
  └── AI 협업 시스템 가이드라인 v2.0 (SDD + DDD 통합)
      INITIAL_PROMPT.md의 기반이 되는 프레임워크
      Claude Code 프로젝트에 포함시켜 참조하게 할 것

  STUDYCORE_SPEC_v1.0.md
  └── 전체 개발 사양서 — Phase 0 SDD 주문서 (이미 완성)
      기술 스택 / 사이트맵 / 권한 구조 / DB 스키마 /
      페이지별 기능 명세 / 어드민 명세 / 알림 시스템 /
      인프라 설계 / 컴포넌트 목록 / 개발 우선순위

  UI_REF_01_Editorial_v2.html
  └── UI 레퍼런스 1 — 에디토리얼 스타일 (현재 기준 버전)
      브라우저로 열어서 확인
      · 전체 섹션 구조 및 콘텐츠 반영
      · Navy/Teal 컬러 시스템 적용
      · 스크롤 애니메이션, 슬라이더, FAQ 아코디언 동작 확인 가능

  UI_REF_02_Stack_VerB.html
  └── UI 레퍼런스 2 — 번호 스택형 (융합 대상)
      브라우저로 열어서 확인
      · Hero 좌우 2분할 구조
      · 차별점 섹션: 대형 번호 풀와이드 행 레이아웃
      · hover 시 teal 키워드 등장

■ UI 방향 (SPEC 1.3 참조)

  최종 UI = v2 에디토리얼 + VerB 스택형 융합

  · Hero          → VerB 좌우 2분할 구조 채택
  · 차별점 섹션   → VerB 번호 스택 행 채택
  · 나머지 섹션   → v2 기반 유지
  · 공통 원칙     → border-radius:0 / shadow 없음 / 다크모드 미지원

■ 브랜드 컬러

  --navy:   #103050   (주색 — 버튼, 다크 섹션)
  --teal:   #57ADB1   (포인트 — 강조, CTA)
  --navy-d: #0A1F35   (다크 배경 — Hero, Footer)
  --stone:  #F4F2EE   (라이트 배경 — 섹션 교차)
  --ink:    #111111   (본문 텍스트)

■ 태그라인

  "구조가 성적을 만든다"

