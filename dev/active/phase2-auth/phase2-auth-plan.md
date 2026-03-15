# Phase 2 Auth 아키텍처 계획

## 개요
스터디코어 1.0 인증 시스템 및 재원생 전용 페이지 구현

## 기술 결정

| 영역 | 선택 | 비고 |
|------|------|------|
| 인증 | Supabase Auth | OAuth + Password |
| OAuth | 카카오 | 재원생용 |
| 상태 관리 | Zustand + persist | 세션 유지 |
| 권한 | RLS + middleware | 서버/클라이언트 이중 검사 |

## 데이터베이스 스키마

### 테이블 구조
```
profiles          ← auth.users 확장 (role, status, school 등)
consultations     ← 상담 신청 (Phase 1에서 이관)
notices           ← 공지사항
notice_attachments ← 첨부파일
questions         ← 수학 질문
question_answers  ← 질문 답변
counselings       ← 진학/진로 상담 기록
user_registrations ← 상태 변경 이력
```

### 역할 (role)
- `student`: 재원생 (카카오 로그인)
- `assistant`: 조교
- `mentor`: 멘토
- `admin`: 관리자

### 상태 (status)
- `pending`: 승인 대기
- `active`: 활성
- `inactive`: 비활성

## 도메인 레이어 설계

### User 도메인 (`/src/domains/user/`)
```
model.ts
├── Profile 타입
├── UserRoleType, UserStatusType
├── StaffLoginInput (zod)
└── CreateProfileInput (zod)

repository.ts
├── getProfileById()
├── getProfileByUsername()
├── createProfile()
└── updateProfile()

service.ts
├── staffLogin() ← username → email 변환 → signIn
├── kakaoLogin() ← OAuth redirect
└── getCurrentUser()
```

### Notice 도메인 (`/src/domains/notice/`)
```
model.ts
├── Notice, NoticeWithAuthor
├── NoticeAttachment
└── CreateNoticeInput, UpdateNoticeInput

repository.ts
├── getNotices() ← 필터링, 페이지네이션
├── getNoticeById()
├── incrementViewCount()
├── createNotice()
├── updateNotice()
└── deleteNotice()

service.ts
├── getPublishedNotices()
├── getNoticeDetail()
└── adminCRUD()
```

### Question 도메인 (`/src/domains/question/`)
```
model.ts
├── Question, QuestionWithAuthor
├── QuestionAnswer
└── CreateQuestionInput

repository.ts
├── getQuestions()
├── getQuestionById()
├── createQuestion()
└── createAnswer()

service.ts
├── getMyQuestions()
├── submitQuestion()
└── answerQuestion()
```

## 페이지 구조

```
/login          ← 로그인 (카카오 + 스태프)
/auth/callback  ← OAuth 콜백 처리
/notices        ← 공지사항 목록
/notices/[id]   ← 공지사항 상세
/questions      ← 수학 질문방 (active 재원생 전용)
/my             ← 마이페이지
```

## 인증 플로우

### 카카오 로그인 (재원생)
```
1. /login → "카카오 로그인" 클릭
2. supabase.auth.signInWithOAuth({ provider: 'kakao' })
3. 카카오 인증 → /auth/callback
4. profiles 조회/생성
5. useUserStore.login()
6. / 홈으로 리다이렉트
```

### 스태프 로그인
```
1. /login → username + password 입력
2. profiles에서 username으로 조회
3. email 획득 → signInWithPassword
4. useUserStore.login()
5. /admin 또는 /로 리다이렉트
```

## RLS 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | 본인/스태프 | 시스템 | 본인/스태프 | 관리자 |
| notices | 발행됨/스태프 | 스태프 | 스태프 | 관리자 |
| questions | 본인/스태프 | active학생 | 작성자 | 관리자 |

## Zustand Store 설계

```typescript
interface UserState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: { id, email } | null;
  profile: Profile | null;

  // 계산된 값
  role: UserRoleType | null;
  status: UserStatusType | null;
  isStaff: boolean;    // admin, mentor, assistant
  isAdmin: boolean;
  isActive: boolean;

  // 액션
  login(user, profile): void;
  logout(): void;
  updateProfile(updates): void;
}
```

## Phase 2 미포함 (Phase 3 이후)

- /register 페이지 (카카오 신규 가입 추가 정보)
- Edge Functions (notify-consult, notify-question)
- 어드민 페이지
- 도시락 신청
