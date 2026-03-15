# Phase 4 Content 아키텍처 계획

## 개요
스터디코어 1.0 확장 기능 구현 - 블로그, 도시락 관리, 알림 시스템, 콘텐츠 페이지

**상태: 계획 수립 완료**

---

## 범위

### 포함
1. **블로그 시스템**
   - /blog - 블로그 목록 (SSG + ISR)
   - /blog/[slug] - 블로그 상세 (SEO 최적화)
   - /admin/blog - 블로그 관리 (Markdown 에디터, 네이버 복사)

2. **도시락 관리**
   - /admin/lunch - 도시락 신청 기간 설정, 현황 조회, 엑셀 다운로드
   - /my 도시락 탭 - 재원생 도시락 신청

3. **알림 시스템**
   - Edge Functions (알림톡 + SMS 폴백)
   - /admin/kakao - 수동 알림톡 발송

4. **콘텐츠 페이지**
   - /guide - 신입생 안내 (동적 콘텐츠)
   - /about - 소개 페이지 (노출 제어)
   - /reviews - 성과/후기 (노출 제어)

5. **인프라**
   - Storage 버킷 설정
   - 질문 답변 기능 완성

### 미포함 (Phase 5 또는 추후)
- 카카오 알림톡 실제 연동 (템플릿 심사 대기)
- 실제 SMS 발송 (서비스 선택 후)
- /about, /reviews 콘텐츠 (원고 준비 후)

---

## 데이터베이스 스키마

### blog_posts (블로그)
```sql
-- 006_add_blog_posts.sql
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
```

### lunch_periods (도시락 신청 기간)
```sql
-- 007_add_lunch_system.sql
CREATE TABLE IF NOT EXISTS public.lunch_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  meal_types TEXT[] DEFAULT '{"lunch","dinner"}',
  selection_type TEXT NOT NULL CHECK (selection_type IN ('weekday', 'date')),
  available_options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### lunch_applications (도시락 신청)
```sql
CREATE TABLE IF NOT EXISTS public.lunch_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id UUID NOT NULL REFERENCES public.lunch_periods(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  selections JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period_id, student_id)
);
```

---

## 페이지 구조

### 블로그
```
/blog                     ← 목록 (SSG + ISR)
├── 썸네일, 제목, 요약, 날짜, 태그
├── 페이지네이션 또는 무한 스크롤
└── 태그 필터

/blog/[slug]              ← 상세 (SSG + ISR)
├── Markdown 렌더링
├── 태그, 발행일
├── 이전/다음 포스트
└── SEO 메타태그
```

### 어드민 블로그
```
/admin/blog               ← 포스트 목록
├── 발행/임시저장 필터
├── 작성 버튼
└── 수정/삭제

/admin/blog/new           ← 포스트 작성
├── 제목
├── 슬러그 (자동 생성 + 수정 가능)
├── Markdown 에디터
├── 썸네일 업로드
├── 태그 입력
├── 요약 (excerpt)
└── 발행/임시저장 버튼

/admin/blog/[id]/edit     ← 포스트 수정
├── 동일 폼
└── 네이버 복사 버튼 (발행 상태일 때)
```

### 도시락 관리
```
/admin/lunch              ← 기간 목록 + 현황
├── 기간 생성/수정
├── 현재 활성 기간 표시
├── 신청 현황 테이블
└── 엑셀 다운로드

/my                       ← 도시락 신청 탭
├── 활성 기간 있을 때만 표시
├── 요일별: 월~일 토글
├── 날짜별: 달력 UI
└── 중식/석식 선택
```

### 알림톡 수동 발송
```
/admin/kakao              ← 수동 발송
├── 수신 대상 선택
│   ├── 재원생 전체
│   ├── 특정 학생 검색/선택
│   └── 학부모 포함 여부
├── 메시지 입력
├── 미리보기
└── 발송 + 이력 로그
```

---

## 도메인 레이어 추가

### Blog 도메인 (`/src/domains/blog/`)
```
model.ts
├── BlogPost
├── BlogPostWithAuthor
├── CreateBlogPostInput (zod)
├── UpdateBlogPostInput (zod)
└── generateSlug()

repository.ts
├── getPublishedPosts()
├── getPostBySlug()
├── getPostById()
├── getAllPosts() (admin)
├── createPost()
├── updatePost()
├── deletePost()
└── getAdjacentPosts()

service.ts
├── publishPost()
├── unpublishPost()
└── copyForNaver()
```

### Lunch 도메인 (`/src/domains/lunch/`)
```
model.ts
├── LunchPeriod
├── LunchApplication
├── LunchSelections (JSONB 타입)
├── CreatePeriodInput (zod)
└── CreateApplicationInput (zod)

repository.ts
├── getActivePeriod()
├── getAllPeriods()
├── createPeriod()
├── updatePeriod()
├── getApplicationsByPeriod()
├── getStudentApplication()
├── upsertApplication()
└── exportToExcel()

service.ts
├── getCurrentPeriod()
├── submitApplication()
├── getStudentMealPlan()
└── generateExcelReport()
```

### Notification 도메인 (`/src/domains/notification/`)
```
model.ts
├── NotificationTarget
├── NotificationLog
├── SendNotificationInput (zod)
└── NotificationType

repository.ts
├── getTargetPhones()
├── logNotification()
└── getNotificationLogs()

service.ts
├── sendToStudents()
├── sendToParents()
├── sendCustomMessage()
└── getActiveStudentContacts()
```

---

## Edge Functions

### _shared/kakao-alimtalk.ts
```typescript
interface AlimtalkRequest {
  template_code: string;
  receiver_number: string;
  variables: Record<string, string>;
}

export async function sendAlimtalk(request: AlimtalkRequest): Promise<boolean> {
  // 1. 카카오 알림톡 발송 시도
  // 2. 실패 시 SMS 폴백
  // 3. 결과 반환
}
```

### notify-consult/
```typescript
// 트리거: 상담 신청 후 호출
// 1. 관리자에게 알림톡 (새 상담 접수)
// 2. 신청자에게 SMS (카카오 채널 안내)
```

### notify-question/
```typescript
// 트리거: 질문 등록 후 호출
// 멘토에게 알림톡 (새 질문 알림)
```

### notify-answer/
```typescript
// 트리거: 답변 등록 후 호출
// 재원생에게 알림톡 (active 상태만)
```

### revalidate-blog/
```typescript
// 트리거: 블로그 발행 시 호출
// Next.js ISR 재생성 요청
```

---

## Storage 버킷

| 버킷명 | 용도 | 접근 정책 |
|--------|------|----------|
| `blog-thumbnails` | 블로그 썸네일 | public read, admin write |
| `blog-images` | 블로그 본문 이미지 | public read, admin write |
| `question-images` | 질문방 이미지 | 재원생·멘토 read/write (본인) |
| `notice-images` | 공지 이미지 | 재원생 read, admin write |
| `notice-attachments` | 공지 첨부파일 | 재원생 read, admin write |
| `counseling-files` | 상담 기록 첨부 | admin only |
| `guide-files` | 신입생 안내 파일 | 로그인 사용자 read, admin write |

---

## 컴포넌트

### 블로그
| 컴포넌트 | 설명 |
|---------|------|
| `<BlogCard />` | 블로그 목록 카드 |
| `<BlogEditor />` | Markdown 에디터 |
| `<MarkdownRenderer />` | Markdown → HTML 렌더링 |
| `<NaverCopyButton />` | 네이버 블로그 복사 버튼 |
| `<TagInput />` | 태그 입력 (chips) |
| `<ThumbnailUploader />` | 썸네일 업로드 |

### 도시락
| 컴포넌트 | 설명 |
|---------|------|
| `<LunchPeriodForm />` | 기간 설정 폼 |
| `<WeekdaySelector />` | 요일별 선택 UI |
| `<DateSelector />` | 날짜별 선택 (달력) |
| `<MealTypeToggle />` | 중식/석식 토글 |
| `<LunchStatusTable />` | 신청 현황 테이블 |
| `<ExcelDownloadButton />` | 엑셀 다운로드 |

### 알림
| 컴포넌트 | 설명 |
|---------|------|
| `<RecipientSelector />` | 수신자 선택 |
| `<MessagePreview />` | 발송 미리보기 |
| `<NotificationLog />` | 발송 이력 |

---

## 구현 순서

### 1단계: 데이터베이스 + 도메인 (우선순위 높음)
1. SQL 마이그레이션 (006, 007)
2. Blog 도메인 (model, repository, service)
3. Lunch 도메인 (model, repository, service)
4. Notification 도메인 (model, repository, service)

### 2단계: 블로그 (우선순위 높음)
1. /blog 목록 페이지 (SSG)
2. /blog/[slug] 상세 페이지 (SSG + ISR)
3. /admin/blog 목록 페이지
4. /admin/blog/new 작성 페이지
5. /admin/blog/[id]/edit 수정 페이지
6. 네이버 복사 기능
7. Storage 버킷 (blog-thumbnails, blog-images)

### 3단계: 도시락 관리 (우선순위 중간)
1. /admin/lunch 기간 설정 + 현황
2. /my 도시락 신청 탭
3. 엑셀 다운로드 기능

### 4단계: 알림 시스템 (우선순위 중간)
1. Edge Functions 구조 설정
2. notify-consult (상담 알림)
3. notify-question (질문 알림)
4. notify-answer (답변 알림)
5. /admin/kakao 수동 발송

### 5단계: 콘텐츠 페이지 (우선순위 낮음)
1. /guide 신입생 안내
2. /about 소개 (콘텐츠 준비 후)
3. /reviews 후기 (콘텐츠 준비 후)

### 6단계: 마무리
1. Storage 버킷 전체 설정
2. 질문 답변 기능 완성
3. revalidate-blog Edge Function
4. 빌드/테스트 검증

---

## 외부 라이브러리 추가

```bash
# Markdown
npm install react-markdown remark-gfm rehype-highlight

# 엑셀 다운로드
npm install xlsx

# 날짜 선택 (도시락)
npm install react-day-picker date-fns
```

---

## 예상 결과물

### 페이지 (8개 추가)
- /blog
- /blog/[slug]
- /admin/blog
- /admin/blog/new
- /admin/blog/[id]/edit
- /admin/lunch
- /admin/kakao
- /guide

### 도메인 (3개 추가)
- src/domains/blog/
- src/domains/lunch/
- src/domains/notification/

### Edge Functions (5개)
- _shared/kakao-alimtalk.ts
- notify-consult/
- notify-question/
- notify-answer/
- revalidate-blog/

### SQL 마이그레이션 (2개)
- 006_add_blog_posts.sql
- 007_add_lunch_system.sql
