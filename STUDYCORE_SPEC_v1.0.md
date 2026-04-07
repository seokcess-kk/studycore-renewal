# STUDY CORE 1.0 — 홈페이지 리뉴얼 개발 사양서 (SPEC)

> **태그라인:** 구조가 성적을 만든다  
> **Version:** 1.0 | March 2026 | For Claude Code

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [사이트맵 및 권한 구조](#3-사이트맵-및-권한-구조)
4. [인증 및 계정 시스템](#4-인증-및-계정-시스템)
5. [데이터베이스 스키마](#5-데이터베이스-스키마)
6. [페이지별 기능 명세](#6-페이지별-기능-명세)
7. [어드민 기능 명세](#7-어드민-기능-명세)
8. [알림 시스템](#8-알림-시스템)
9. [인프라 설계](#9-인프라-설계)
10. [공통 컴포넌트](#10-공통-컴포넌트)
11. [미결 사항 (TBD)](#11-미결-사항-tbd)
12. [개발 우선순위](#12-개발-우선순위)

---

## 1. 프로젝트 개요

### 1.1 서비스 기본 정보

| 항목 | 내용 |
|------|------|
| 서비스명 | STUDY CORE 1.0 (스터디코어 1.0) |
| 태그라인 | 구조가 성적을 만든다 |
| 서비스 유형 | 관리형 학습공간 홈페이지 + 재원생 전용 서비스 |
| 위치 | 광주광역시 광산구 임방울대로 330 애플타워 10층 |
| 연락처 | 010-4408-3790 |
| 이메일 | studycore10@naver.com |
| 카카오채널 | http://pf.kakao.com/_execQn |
| 현행 사이트 | https://xn--2z1b50xilcu8n7jc.com/ |

### 1.2 리뉴얼 목표

- 학부모 설득 중심의 홈페이지로 상담 신청 전환율 극대화
- 재원생 전용 서비스(공지사항·질문방·도시락 신청) 통합 운영
- Next.js SSG 기반으로 SEO 강화 — 광산구 독서실 키워드 유입 확대
- 관리자·멘토·조교가 실무에서 바로 사용할 수 있는 어드민 구축
- 블로그를 통한 입시 정보 콘텐츠로 지속적 유입 경로 확보

### 1.3 브랜드 가이드

#### 컬러 시스템

| 토큰 | Hex | 용도 |
|------|-----|------|
| `--navy` | `#103050` | 로고 주색 / 다크 섹션 / 버튼 |
| `--navy-d` | `#0A1F35` | 더 어두운 navy / footer 배경 |
| `--teal` | `#57ADB1` | 포인트 컬러 / 강조 |
| `--teal-d` | `#3D8F94` | teal hover 상태 |
| `--stone` | `#F4F2EE` | 라이트 섹션 배경 |
| `--white` | `#FFFFFF` | 기본 배경 |
| `--ink` | `#111111` | 본문 텍스트 |
| `--muted` | `#888888` | 보조 텍스트 |
| `--rule` | `#E3E0DA` | 구분선 |

#### 타이포그래피

| 폰트 | 용도 |
|------|------|
| Noto Serif KR | 헤드라인, 섹션 타이틀, 강조 텍스트 |
| Noto Sans KR | 본문, 네비게이션, 폼 |
| IBM Plex Mono | 섹션 번호, 라벨, 메타 정보 |

#### 디자인 원칙

- `border-radius: 0` — 완전 사각형 처리
- `box-shadow` 사용 안 함
- 다크 모드 미지원
- UI 방향: v2 에디토리얼 + VerB 스택형 융합

> ※ UI 최종 확정 전이므로 컴포넌트는 토큰 기반으로 구현하여 변경 용이하게 유지

---

## 2. 기술 스택

| 영역 | 스택 / 버전 |
|------|------------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 상태 관리 | Zustand (전역) + TanStack Query v5 (서버 상태) |
| 폼 관리 | react-hook-form + zod |
| 애니메이션 | Framer Motion |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| 인증 | Supabase Auth (카카오 OAuth + 아이디/비밀번호) |
| 배포 | Vercel |
| 도메인 | 영문 도메인 (미정 — studycore10.com 등 검토) |
| 알림 | 카카오 알림톡 API (실패 시 SMS 폴백) |
| SMS | 외부 SMS API (카카오 알림톡 폴백 및 비회원 발송) |

### 2.1 렌더링 전략

| 페이지 유형 | 렌더링 방식 |
|------------|------------|
| `/` (홈) | SSG — 정적 생성, ISR 적용 |
| `/system`, `/about`, `/reviews` | SSG |
| `/blog`, `/blog/[slug]` | SSG + ISR (발행 시 재생성) |
| `/consult` | SSR 또는 CSR (폼 제출) |
| `/notices`, `/questions`, `/my` | CSR (로그인 필요) |
| `/admin/*` | CSR (로그인 필요, SSR 없음) |
| `/guide` | CSR — 관리자가 수정 가능한 동적 콘텐츠 |

---

## 3. 사이트맵 및 권한 구조

### 3.1 사이트맵

#### 공개 페이지 (비회원 접근 가능)

| URL | 페이지명 / 설명 |
|-----|----------------|
| `/` | 홈 — Hero, 6가지 차별점, 시설 슬라이더, FAQ, 상담 신청 |
| `/about` | 소개 — 브랜드, 원장 인사 (노출 보류, 어드민 제어) |
| `/system` | 운영 시스템 — 교시제, 생활 규정, 벌점 제도 |
| `/blog` | 블로그 목록 — 입시 정보 콘텐츠 (어드민 노출 제어) |
| `/blog/[slug]` | 블로그 포스트 상세 — SSG, SEO 최적화 |
| `/consult` | 상담 신청 — 폼 + 자동 안내 문자 발송 |
| `/reviews` | 성과/후기 — 구조만 준비, 콘텐츠 추후 (어드민 제어) |
| `/terms` | 이용약관 |
| `/privacy` | 개인정보처리방침 |

#### 로그인 전용 페이지

| URL | 페이지명 / 접근 권한 |
|-----|---------------------|
| `/login` | 로그인 — 카카오(재원생) / 아이디+비밀번호(조교·멘토·관리자) |
| `/guide` | 신입생 안내 — 재원생·조교 접근 가능 |
| `/notices` | 공지사항 — 재원생·조교 접근 가능 |
| `/notices/[id]` | 공지 상세 |
| `/questions` | 수학 질문방 — 재원생(질문), 멘토(답변), 조교(열람) |
| `/my` | 마이페이지 — 재원생 전용 (정보 수정, 도시락 신청) |

#### 어드민 페이지 (관리자 전용)

| URL | 기능 |
|-----|------|
| `/admin` | 대시보드 — 최근 상담·가입 신청·질문 현황 요약 |
| `/admin/members` | 회원 관리 — 목록, 검색, 상태 변경, 계정 생성 |
| `/admin/members/[id]` | 학생 상세 — 기본 정보, 등록 이력 |
| `/admin/members/[id]/consult` | 학생별 상담 기록 — 작성, 열람, 파일 첨부 |
| `/admin/notices` | 공지 관리 — 작성, 카테고리, 파일 첨부, 알림톡 발송 |
| `/admin/questions` | 질문 관리 — 전체 질문 현황, 멘토 배정 확인 |
| `/admin/blog` | 블로그 관리 — 포스트 작성·발행, 네이버 원클릭 복사 |
| `/admin/lunch` | 도시락 관리 — 신청 항목 설정, 현황 조회, 엑셀 다운로드 |
| `/admin/kakao` | 알림톡 수동 발송 |
| `/admin/guide` | 조교 온보딩 문서 관리 |
| `/admin/settings` | 사이트 설정 — 메뉴 노출 제어, 문자 템플릿 수정 |

### 3.2 권한 구조

| 페이지 유형 | 비회원 | 재원생 | 조교 | 멘토 | 관리자 | 비고 |
|------------|:------:|:------:|:----:|:----:|:------:|------|
| 공개 페이지 | ✅ | ✅ | ✅ | ✅ | ✅ | |
| 신입생 안내 `/guide` | ❌ | ✅ | ✅ | ❌ | ✅ | |
| 공지사항 `/notices` | ❌ | ✅ | ✅ | ❌ | ✅ | |
| 질문방 (질문 작성) | ❌ | ✅ | ❌ | ❌ | ✅ | |
| 질문방 (답변 작성) | ❌ | ❌ | ❌ | ✅ | ✅ | |
| 질문방 (열람) | ❌ | ✅ | ✅ | ✅ | ✅ | |
| 마이페이지 | ❌ | ✅ | ❌ | ❌ | ✅ | 재원생만 |
| 어드민 | ❌ | ❌ | ❌ | ❌ | ✅ | |
| 조교 온보딩 | ❌ | ❌ | ✅ | ❌ | ✅ | `/admin/guide` |

---

## 4. 인증 및 계정 시스템

### 4.1 로그인 방식

| 역할 | 로그인 방식 |
|------|------------|
| 재원생 | 카카오 OAuth (Supabase Auth) |
| 조교 | 아이디 + 비밀번호 (관리자가 계정 생성 후 전달) |
| 멘토 | 아이디 + 비밀번호 (관리자가 계정 생성 후 전달) |
| 관리자 | 아이디 + 비밀번호 |

> ※ 비밀번호 재설정: 아이디+비밀번호 계정은 이메일 기반 재설정 링크 발송  
> ※ 재원생은 카카오 로그인이므로 비밀번호 재설정 불필요

### 4.2 계정 상태

| 상태 | 설명 |
|------|------|
| `pending` | 가입 신청 완료 → 관리자 승인 대기. 로그인 및 기능 사용 불가 |
| `active` | 승인 완료 → 재원생 전체 기능 사용 가능. 알림톡 수신 on |
| `inactive` | 퇴소 또는 일시 중단. 로그인 가능하나 재원생 기능 전체 차단. 알림톡 수신 off |

> ※ `inactive` 상태에서 `/notices`, `/questions` 접근 시 "현재 이용 중인 서비스가 없습니다" 안내 화면 표시  
> ※ 계정 상태 변경은 관리자만 가능

### 4.3 재원생 가입 신청 필드

| 필드 | 필수 여부 |
|------|----------|
| 이름 | TBD |
| 전화번호 | TBD |
| 학교 | TBD |
| 학년 | TBD |
| 학부모 연락처 | TBD |

> ※ 이메일 미수집 — 카카오 계정으로 식별  
> ※ 필수 여부는 추후 확정 예정

### 4.4 관리자 생성 계정 (조교·멘토)

- 관리자가 `/admin/members`에서 직접 계정 생성
- 아이디 + 임시 비밀번호 생성 후 해당 인원에게 전달
- 초기 로그인 후 비밀번호 변경 권장 (강제 변경 여부 TBD)
- 멘토: 학교·학년 필드 불필요 — 공란 허용

---

## 5. 데이터베이스 스키마

### 5.1 users (Supabase Auth 확장)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | Supabase Auth uid |
| `username` | `TEXT UNIQUE` | 아이디 (조교·멘토·관리자용) |
| `role` | `ENUM('student','assistant','mentor','admin')` | 계정 권한 |
| `status` | `ENUM('pending','active','inactive')` | 재원생 상태 (student만) |
| `name` | `TEXT` | 이름 |
| `phone` | `TEXT` | 전화번호 |
| `school` | `TEXT` | 학교 (student만) |
| `grade` | `TEXT` | 학년 (student만) |
| `parent_phone` | `TEXT` | 학부모 연락처 (student만) |
| `kakao_id` | `TEXT` | 카카오 식별자 (student만) |
| `registered_at` | `TIMESTAMPTZ` | 최초 승인일 |
| `created_at` | `TIMESTAMPTZ` | 가입 신청일 |
| `updated_at` | `TIMESTAMPTZ` | 최근 수정일 |

### 5.2 user_registrations (등록 이력)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `user_id` | `UUID FK → users.id` | |
| `activated_at` | `TIMESTAMPTZ` | 활성화 일자 (inactive→active 변경 시점) |
| `note` | `TEXT` | 비고 (선택) |

### 5.3 notices (공지사항)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `title` | `TEXT NOT NULL` | 제목 |
| `content` | `TEXT NOT NULL` | 본문 (이미지 마커 포함) |
| `category` | `ENUM('general','urgent','material','schedule','event')` | 카테고리 |
| `is_published` | `BOOLEAN DEFAULT true` | 발행 여부 |
| `show_as_popup` | `BOOLEAN DEFAULT false` | 팝업 노출 여부 |
| `image_urls` | `TEXT[] DEFAULT {}` | 이미지 URL 배열 |
| `attachment_url` | `TEXT` | 첨부파일 URL |
| `attachment_name` | `TEXT` | 첨부파일명 |
| `view_count` | `INT DEFAULT 0` | 조회수 |
| `author_id` | `UUID FK → users.id` | 작성자 |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

### 5.4 questions (수학 질문방)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `student_id` | `UUID FK → users.id` | 질문 작성 학생 |
| `title` | `TEXT NOT NULL` | 제목 |
| `content` | `TEXT NOT NULL` | 질문 내용 |
| `image_urls` | `TEXT[] DEFAULT {}` | 질문 이미지 |
| `status` | `ENUM('pending','answered')` | 답변 대기 / 완료 |
| `answer_content` | `TEXT` | 멘토 답변 |
| `answer_image_urls` | `TEXT[] DEFAULT {}` | 답변 이미지 |
| `mentor_id` | `UUID FK → users.id` | 답변 멘토 |
| `answered_at` | `TIMESTAMPTZ` | 답변 일시 |
| `created_at` | `TIMESTAMPTZ` | |

### 5.5 consultations (상담 신청)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `name` | `TEXT NOT NULL` | 신청자 이름 |
| `phone` | `TEXT NOT NULL` | 연락처 |
| `consult_type` | `TEXT` | 상담 유형 |
| `message` | `TEXT` | 문의 내용 |
| `status` | `ENUM('new','contacted','done')` | 처리 상태 |
| `created_at` | `TIMESTAMPTZ` | |

### 5.6 counseling_records (학생별 상담 기록)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `student_id` | `UUID FK → users.id` | 대상 학생 |
| `counselor_id` | `UUID FK → users.id` | 상담 진행자 |
| `date` | `DATE NOT NULL` | 상담 일자 |
| `type` | `ENUM('admission','career','etc')` | 진학 / 진로 / 기타 |
| `content` | `TEXT NOT NULL` | 상담 내용 |
| `next_date` | `DATE` | 다음 상담 예정일 |
| `attachment_url` | `TEXT` | 첨부파일 URL |
| `attachment_name` | `TEXT` | 첨부파일명 |
| `created_at` | `TIMESTAMPTZ` | |

### 5.7 blog_posts (블로그)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `title` | `TEXT NOT NULL` | 제목 |
| `slug` | `TEXT NOT NULL UNIQUE` | URL slug |
| `content` | `TEXT NOT NULL` | 본문 (Markdown) |
| `excerpt` | `TEXT` | 요약 (목록 미리보기) |
| `thumbnail_url` | `TEXT` | 썸네일 이미지 |
| `tags` | `TEXT[] DEFAULT {}` | 태그 |
| `is_published` | `BOOLEAN DEFAULT false` | 발행 여부 |
| `author_id` | `UUID FK → users.id` | 작성자 |
| `published_at` | `TIMESTAMPTZ` | 발행일 |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

### 5.8 lunch_periods (도시락 신청 기간 설정)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `title` | `TEXT NOT NULL` | 기간 이름 (예: 2026년 3월) |
| `start_date` | `DATE NOT NULL` | 신청 기간 시작일 |
| `end_date` | `DATE NOT NULL` | 신청 기간 종료일 |
| `meal_types` | `TEXT[]` | 제공 식사 유형 (`['lunch','dinner']`) |
| `selection_type` | `ENUM('weekday','date')` | 요일별 / 날짜별 선택 |
| `available_options` | `JSONB` | 선택 가능 요일 또는 날짜 목록 |
| `is_active` | `BOOLEAN DEFAULT true` | 신청 활성 여부 |
| `created_at` | `TIMESTAMPTZ` | |

### 5.9 lunch_applications (도시락 신청)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `period_id` | `UUID FK → lunch_periods.id` | |
| `student_id` | `UUID FK → users.id` | |
| `selections` | `JSONB` | 선택 내용 (날짜별 중식/석식) |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

### 5.10 site_settings (사이트 설정)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `UUID PK` | |
| `key` | `TEXT NOT NULL UNIQUE` | 설정 키 (예: `menu_blog_visible`) |
| `value` | `TEXT NOT NULL` | 설정 값 |
| `description` | `TEXT` | 설명 |
| `updated_at` | `TIMESTAMPTZ` | |

> ※ 메뉴 노출 제어 키: `menu_about`, `menu_system`, `menu_blog`, `menu_reviews`  
> ※ 문자 템플릿 키: `sms_consult_template`

---

## 6. 페이지별 기능 명세

### 6.1 홈 (/)

**섹션 구성**

| # | 섹션 |
|---|------|
| 01 | Hero — 헤드라인 타이포, 설명, CTA 버튼 |
| 02 | 6가지 차별점 — 번호 스택 행 (VerB 스타일) |
| 03 | 시설 슬라이더 — 4장, 자동 슬라이드, 스와이프 지원 |
| 04 | FAQ — 아코디언, 카카오 채널 링크 |
| 05 | 상담 신청 — CTA → `/consult` 이동 또는 인라인 폼 (TBD) |
| Footer | 로고, 연락처, 이용약관, 개인정보처리방침 |

> ※ 시설 슬라이더 사진: 초기에는 플레이스홀더, 실사 촬영 후 교체

### 6.2 상담 신청 (/consult)

**폼 필드**

| 필드 | 타입 / 비고 |
|------|------------|
| 이름 | text input, 필수 |
| 연락처 | tel input, 필수 |
| 상담 유형 | select — 입소 상담 / 시설 견학 / 프로그램 문의 / 기타 |
| 문의 내용 | textarea, 선택 |

**제출 후 처리 흐름**

1. Supabase `consultations` 테이블에 저장
2. 관리자 연락처로 카카오 알림톡 발송 (신규 상담 접수 알림)
3. 신청자 전화번호로 SMS 발송 — 카카오 채널 안내 고정 템플릿
4. 성공 메시지 표시

> ※ SMS 템플릿은 `/admin/settings`에서 수정 가능

### 6.3 블로그 (/blog, /blog/[slug])

- 목록 페이지: 썸네일, 제목, 요약, 날짜, 태그 표시
- 상세 페이지: Markdown 렌더링, 태그, 이전/다음 포스트
- SSG + ISR — 발행 시 revalidate 트리거
- `generateStaticParams`로 slug 사전 생성
- SEO: `title`, `description`, `og:image` 메타태그 자동 생성
- `/admin/blog`에서 네이버 블로그 원클릭 복사 버튼 제공

### 6.4 공지사항 (/notices)

- 재원생·조교 접근 가능
- 카테고리 필터 탭: 전체 / 일반 공지 / 긴급 공지 / 학습 자료 / 시간표 / 행사·이벤트
- 목록: 카테고리 뱃지, 제목, 날짜, 이미지/첨부파일 아이콘, 조회수
- 상세: 이미지 갤러리, 인라인 이미지, 첨부파일 다운로드
- 팝업 공지: `show_as_popup=true`인 공지는 홈 접속 시 팝업 노출

### 6.5 수학 질문방 (/questions)

**역할별 기능**

| 역할 | 기능 |
|------|------|
| 재원생 | 질문 작성 (텍스트+이미지), 내 질문 목록, 답변 확인 |
| 멘토 | 전체 질문 목록, 답변 작성 (텍스트+이미지) |
| 조교 | 질문 목록 열람 (작성·답변 불가) |
| 관리자 | 전체 기능 |

**알림 흐름**

1. 재원생 질문 등록 → 멘토에게 카카오 알림톡
2. 멘토 답변 등록 → 해당 재원생에게 카카오 알림톡

> ※ 알림톡 수신: `active` 상태 계정만. `inactive`는 알림 off

### 6.6 마이페이지 (/my)

| 탭/영역 | 기능 상세 |
|---------|----------|
| 기본 정보 | 이름, 전화번호, 학교, 학년, 학부모 연락처 — 직접 수정 가능 |
| 계정 상태 | pending/active/inactive 표시 — 조회만 가능 |
| 내 질문 | 내가 작성한 질문 목록, 답변 상태 확인 |
| 도시락 신청 | 활성 기간 중에만 표시 — 별도 탭 또는 섹션 |

> ※ 학부모 연락처 수정 시 알림톡 수신 번호 자동 업데이트

### 6.7 도시락 신청 (마이페이지 내)

- 활성 `lunch_period`가 있을 때만 신청 UI 노출
- 중식·석식 유형은 period 설정에 따라 동적으로 표시
- 요일별 → 월~일 토글 / 날짜별 → 달력 형태
- 제출 후 `lunch_applications`에 저장 (중복 제출 시 update)
- 신청 기간 종료 후에는 조회만 가능

---

## 7. 어드민 기능 명세

### 7.1 회원 관리 (/admin/members)

**목록 기능**
- 검색: 이름, 전화번호
- 필터: 역할 (student/assistant/mentor), 상태 (pending/active/inactive), 학교
- 테이블 컬럼: 이름, 학교, 학년, 상태, 역할, 등록 횟수, 가입일

**회원 상세 (/admin/members/[id])**
- 기본 정보 조회 및 수정
- 계정 상태 변경 (active ↔ inactive) — 변경 시 `user_registrations`에 이력 자동 기록
- 역할 변경 (student → assistant/mentor 등)
- 등록 이력 목록: 활성화 일자 목록, 총 등록 횟수

**학생별 상담 기록 (/admin/members/[id]/consult)**
- 상담 기록 목록 / 신규 작성 / 파일 첨부

**계정 직접 생성 (조교·멘토용)**
- 이름, 아이디, 임시 비밀번호, 역할 입력
- 생성 후 아이디/비밀번호 화면에 표시 (복사 버튼)

### 7.2 공지 관리 (/admin/notices)

- 공지 작성: 제목, 카테고리, 본문(이미지 마커 지원), 이미지 업로드(다중), 파일 첨부
- 팝업 설정: `show_as_popup` 토글
- 발행/임시저장 구분

**카카오 알림톡 발송 옵션**
- 발송 안 함 (공지만 등록)
- 재원생 전체 발송
- 재원생 + 학부모 연락처 발송

> ※ 발송은 원장님이 내용 확인 후 수동 버튼 클릭 — 자동 발송 없음

### 7.3 질문 관리 (/admin/questions)

- 전체 질문 목록: 학생명, 제목, 상태, 등록일, 멘토
- 미답변 질문 필터
- 관리자도 답변 작성 가능

### 7.4 블로그 관리 (/admin/blog)

- 포스트 작성: 제목, 슬러그 자동 생성, 본문(Markdown), 썸네일, 태그
- 발행/임시저장
- 네이버 원클릭 복사: 발행된 포스트를 네이버 블로그 붙여넣기 최적화 형태로 클립보드 복사

### 7.5 도시락 관리 (/admin/lunch)

**신청 기간 설정**
- 기간명, 신청 기간(시작·종료), 식사 유형(중식/석식), 선택 방식(요일별/날짜별) 설정
- 활성화 여부 토글

**신청 현황**
- 학생별 신청 현황 테이블
- 엑셀(.xlsx) 다운로드 — 학생명, 선택 날짜/요일, 중식/석식

### 7.6 알림톡 수동 발송 (/admin/kakao)

- 수신 대상 선택: 재원생 전체 / 특정 학생 / 학부모 포함
- 메시지 직접 입력
- 발송 전 미리보기
- 발송 이력 로그

### 7.7 조교 온보딩 (/admin/guide)

- 문서 섹션 관리: 제목, 본문, 순서
- 파일 첨부 가능
- 조교 계정으로 로그인 시 `/admin/guide`에서 열람

### 7.8 사이트 설정 (/admin/settings)

**메뉴 노출 제어**

| 설정 키 | 제어 대상 |
|---------|----------|
| `menu_about_visible` | `/about` 네비게이션 노출 |
| `menu_blog_visible` | `/blog` 네비게이션 및 홈 섹션 노출 |
| `menu_reviews_visible` | `/reviews` 네비게이션 노출 |
| `menu_system_visible` | `/system` 네비게이션 노출 |

**문자 템플릿 수정**
- `sms_consult_template`: 상담 신청 시 발송되는 SMS 안내 문자 내용

---

## 8. 알림 시스템

### 8.1 알림 채널 우선순위

| 순위 | 채널 |
|------|------|
| 1순위 | 카카오 알림톡 |
| 2순위 (폴백) | SMS — 알림톡 발송 실패 시 자동 전환 |

### 8.2 알림 트리거 목록

| 트리거 | 수신자 | 채널 | 비고 |
|--------|--------|------|------|
| 상담 신청 폼 제출 | 관리자 | 알림톡 | 새 상담 접수 알림 |
| 상담 신청 폼 제출 | 신청자 | SMS | 카카오 채널 안내 고정 템플릿 |
| 재원생 질문 등록 | 멘토 | 알림톡 | 새 질문 알림 |
| 멘토 답변 등록 | 해당 재원생 | 알림톡 | active 상태만 |
| 공지 등록 (선택) | 재원생 전체 | 알림톡 | 관리자 수동 발송 |
| 공지 등록 (선택) | 학부모 연락처 | 알림톡 | 관리자 선택 시 |

> ※ 알림톡 발송 실패 시 SMS 자동 폴백 처리 — Edge Function에서 핸들링  
> ※ `inactive` 상태 재원생은 알림 수신 제외

---

## 9. 인프라 설계

### 9.1 Supabase Edge Functions 목록

> ※ 모든 알림 발송 로직은 Edge Function에서 처리 — 클라이언트에 API 키 노출 방지

| Function명 | 역할 / 트리거 |
|------------|--------------|
| `send-kakao-alimtalk` | 카카오 알림톡 발송 — 실패 시 SMS 폴백 자동 처리 |
| `notify-consult` | 상담 신청 시 관리자 알림톡 + 신청자 SMS 발송 |
| `notify-question` | 재원생 질문 등록 시 멘토 알림톡 발송 |
| `notify-answer` | 멘토 답변 등록 시 재원생 알림톡 발송 |
| `revalidate-blog` | 블로그 발행 시 Next.js ISR 재생성 트리거 |

### 9.2 Supabase Storage 버킷

| 버킷명 | 용도 / 접근 정책 |
|--------|----------------|
| `notice-images` | 공지사항 이미지 — 재원생 read, 관리자 write |
| `notice-attachments` | 공지사항 첨부파일 — 재원생 read, 관리자 write |
| `question-images` | 질문방 이미지 — 재원생·멘토 read/write (본인) |
| `blog-thumbnails` | 블로그 썸네일 — public read, 관리자 write |
| `counseling-files` | 상담 기록 첨부 — 관리자만 read/write |
| `guide-files` | 온보딩·신입생 안내 파일 — 로그인 사용자 read, 관리자 write |

### 9.3 환경변수 목록

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (클라이언트) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (서버·Edge Function 전용) |
| `NEXT_PUBLIC_KAKAO_CLIENT_ID` | 카카오 OAuth 앱 키 |
| `KAKAO_ALIMTALK_SENDER_KEY` | 카카오 알림톡 발신 프로파일 키 |
| `KAKAO_ALIMTALK_API_KEY` | 카카오 알림톡 API 키 |
| `SMS_API_KEY` | SMS 서비스 API 키 (폴백용 — 솔라피 등) |
| `SMS_SENDER_NUMBER` | SMS 발신 번호 |
| `REVALIDATE_SECRET` | ISR revalidate 엔드포인트 보안 토큰 |
| `ADMIN_CONTACT_PHONE` | 관리자 알림 수신 연락처 (상담 신청 알림용) |

### 9.4 Next.js 미들웨어 (Route 보호)

> ※ `middleware.ts`에서 Supabase Auth 세션 확인 후 미인증 접근 차단

| 경로 패턴 | 처리 방식 |
|----------|----------|
| `/notices`, `/questions`, `/my`, `/guide` | 미로그인 시 `/login` 리다이렉트 |
| `/admin/*` | 미로그인 또는 `role !== admin` 시 `/` 리다이렉트 |
| `/admin/guide` | `role === assistant` 또는 `admin`만 허용 |
| `pending` 상태 | 로그인은 되지만 재원생 기능 페이지 접근 시 안내 화면 |
| `inactive` 상태 | 로그인은 되지만 재원생 기능 페이지 접근 시 안내 화면 |

### 9.5 카카오 알림톡 사전 심사 템플릿

> ※ 카카오 비즈니스 채널 심사는 개발 전 미리 신청 필요 — 심사 기간 약 1~2주

| 템플릿명 | 발송 시점 / 수신자 |
|---------|-----------------|
| `consult_received` | 상담 신청 접수 → 관리자 |
| `question_received` | 새 질문 등록 → 멘토 |
| `answer_received` | 답변 완료 → 재원생 |
| `notice_general` | 공지사항 발송 → 재원생 전체 |
| `notice_with_parent` | 공지사항 발송 → 학부모 |

### 9.6 아이디 기반 로그인 구현 전략

> ※ Supabase Auth는 기본이 이메일 기반. 아이디+비밀번호 로그인은 아래 방식으로 구현

- `users` 테이블에 `username` 컬럼 추가 (`TEXT UNIQUE`)
- 로그인 시 `username`으로 `users` 테이블 조회 → 연결된 이메일 획득
- 획득한 이메일 + 입력 비밀번호로 `supabase.auth.signInWithPassword()` 호출
- 계정 생성 시 `username@studycore.internal` 형식의 더미 이메일 자동 생성

> ※ 외부 노출 없는 내부 이메일이므로 실제 발송 불필요. 비밀번호 재설정은 관리자가 직접 처리

---

## 10. 공통 컴포넌트

| 컴포넌트 | 설명 / 용도 |
|---------|------------|
| `<Nav />` | 고정 네비게이션 — 스크롤 시 배경 전환, 로고 색상 자동 전환, 로그인 상태 반영 |
| `<Footer />` | 하단 — 로고, 주소, 연락처, 약관 링크 |
| `<Button />` | 3 variant: primary(teal fill) / secondary(navy fill) / ghost(테두리). `border-radius: 0` |
| `<SpaceSlider />` | 시설 슬라이더 — 자동 재생, 화살표, 도트, 스와이프, hover 정지 |
| `<FAQAccordion />` | FAQ 아코디언 — 하나만 열림 |
| `<NoticeCard />` | 공지 카드 — 카테고리 뱃지, 제목, 날짜, 아이콘 |
| `<QuestionItem />` | 질문 항목 — 상태 뱃지, 제목, 학생명, 날짜 |
| `<StatusBadge />` | 계정 상태 / 질문 상태 뱃지 |
| `<FileUpload />` | 파일 첨부 UI — Supabase Storage 연동 |
| `<Toast />` | 우하단 고정, 3초 자동 소멸 |
| `<AdminTable />` | 어드민 공통 테이블 — 정렬, 필터, 페이지네이션 |
| `<ConfirmModal />` | 삭제·상태변경 등 확인 모달 |
| `<KakaoButton />` | 카카오 로그인 버튼 |
| `<LunchForm />` | 도시락 신청 폼 — 요일별/날짜별 선택, 중식/석식 |
| `<BlogEditor />` | 블로그 Markdown 에디터 — 이미지 업로드 포함 |
| `<NaverCopyButton />` | 네이버 블로그 원클릭 복사 버튼 |
| `<ImageGallery />` | 공지·질문 이미지 갤러리 — 라이트박스, 좌우 이동 |
| `<CounselingForm />` | 상담 기록 작성 폼 — 유형, 내용, 날짜, 파일 첨부 |
| `<ExcelDownload />` | 도시락 현황 엑셀 다운로드 버튼 |

---

## 11. 미결 사항 (TBD)

| 항목 | 내용 / 결정 필요 사항 |
|------|---------------------|
| UI 버전 | v2 + VerB 융합 방향 확정 — 구체적 컴포넌트 디자인 필요 |
| 도메인 | 영문 도메인 미정 (studycore10.com 등 검토) |
| 가입 필드 필수 여부 | 이름·전화·학교·학년·학부모 연락처 각 필수 여부 확정 |
| 홈 상담 신청 | 홈에 폼 직접 노출 vs `/consult` 링크 방식 선택 |
| 조교 초기 비밀번호 강제 변경 | 최초 로그인 시 비밀번호 변경 강제 여부 |
| 상담 기록 템플릿 | 진학·진로 상담 템플릿 양식 정리 예정 |
| `/about` 콘텐츠 | 브랜드 스토리, 원장 인사말 원고 필요 |
| `/reviews` 콘텐츠 | 성과/후기 데이터 수집 및 구조 확정 |
| SMS API 선택 | 카카오 알림톡 폴백용 SMS 서비스 선택 (예: 솔라피, NHN Cloud) |
| 카카오 알림톡 템플릿 | 카카오 비즈니스 채널 템플릿 사전 심사 필요 |
| 시설 사진 | 실사 촬영 후 슬라이더 교체 |
| 블로그 첫 포스트 | 초기 SEO를 위한 입시 정보 콘텐츠 준비 |

---

## 12. 개발 우선순위

### Phase 1 — MVP (공개 홈페이지 + 상담 신청)

1. Next.js 프로젝트 세팅, Supabase 연결, 기본 라우팅
2. 홈 `/` — Hero, 차별점, 슬라이더, FAQ, CTA
3. `/system`, `/terms`, `/privacy` 정적 페이지
4. `/consult` — 상담 신청 폼, DB 저장, SMS/알림톡 발송
5. Nav, Footer, 공통 컴포넌트

### Phase 2 — 재원생 서비스

1. Supabase Auth 카카오 로그인 + 아이디/비밀번호 로그인
2. 가입 신청 플로우, 계정 상태 관리
3. `/notices` — 공지사항 목록·상세
4. `/questions` — 질문 작성·답변
5. `/my` — 마이페이지, 정보 수정
6. 알림톡 트리거 (질문·답변)

### Phase 3 — 어드민

1. `/admin/members` — 회원 관리, 승인, 상담 기록
2. `/admin/notices` — 공지 작성, 카테고리, 알림톡 발송
3. `/admin/questions` — 질문 현황
4. `/admin/settings` — 메뉴 노출, SMS 템플릿
5. `/admin/guide` — 조교 온보딩

### Phase 4 — 확장 기능

1. `/blog` — 블로그, 네이버 복사
2. `/admin/blog` — 포스트 관리
3. `/admin/lunch` — 도시락 관리, 엑셀 다운로드
4. `/my` 도시락 신청 탭
5. `/admin/kakao` — 수동 알림톡
6. `/guide` — 신입생 안내
7. `/about`, `/reviews` — 콘텐츠 준비 후 노출

---

*STUDY CORE 1.0 — 학습관리의 첫 번째 완성형 시스템*  
*광주광역시 광산구 임방울대로 330 애플타워 10층 | 010-4408-3790*
