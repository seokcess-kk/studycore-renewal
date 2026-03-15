# Phase 3 Admin 아키텍처 계획

## 개요
스터디코어 1.0 어드민 패널 및 Edge Functions 구현

**상태: 완료 (90%)**

## 범위

### 포함 (완료)
- [x] 어드민 레이아웃 (사이드바 + 헤더 + 에러 바운더리)
- [x] 회원 관리 (/admin/members)
- [x] 공지 관리 (/admin/notices)
- [x] 질문 관리 (/admin/questions)
- [x] 사이트 설정 (/admin/settings)
- [x] 조교 온보딩 (/admin/guide)
- [x] /register 페이지 (카카오 신규 가입)

### 미포함 (Phase 4로 이동)
- [ ] Edge Functions (알림 발송)
- [ ] Storage 버킷 설정
- [ ] 블로그 관리 (/admin/blog)
- [ ] 도시락 관리 (/admin/lunch)
- [ ] 알림톡 수동 발송 (/admin/kakao)

---

## 데이터베이스 스키마 (완료)

### counseling_records (상담 기록)
```sql
-- supabase/migrations/004_add_counseling_records.sql
CREATE TABLE counseling_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admission', 'career', 'etc')),
  content TEXT NOT NULL,
  next_date DATE,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### site_settings (사이트 설정)
```sql
-- supabase/migrations/005_add_site_settings.sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 설정값
INSERT INTO site_settings (key, value, description) VALUES
  ('menu_about_visible', 'false', '소개 페이지 노출'),
  ('menu_blog_visible', 'false', '블로그 페이지 노출'),
  ('menu_reviews_visible', 'false', '후기 페이지 노출'),
  ('menu_system_visible', 'true', '운영시스템 페이지 노출'),
  ('sms_consult_template', '...', 'SMS 템플릿');
```

---

## 페이지 구조 (완료)

### 어드민 레이아웃
```
/admin/layout.tsx
├── AdminSidebar
│   ├── Logo
│   ├── NavLinks (대시보드, 회원, 공지, 질문, 온보딩, 설정)
│   └── UserInfo + Logout
├── AdminHeader
│   └── Breadcrumb
├── AdminErrorBoundary
└── {children}
```

### 페이지 목록 (모두 완료)
```
/admin                    ← 대시보드 (요약 카드 + 최근 활동)
/admin/members            ← 회원 목록 (검색, 필터, 테이블)
/admin/members/[id]       ← 회원 상세 (정보, 상태 변경)
/admin/members/[id]/consult ← 상담 기록
/admin/members/new        ← 스태프 계정 생성
/admin/notices            ← 공지 목록
/admin/notices/new        ← 공지 작성
/admin/notices/[id]/edit  ← 공지 수정
/admin/questions          ← 질문 목록 (필터)
/admin/settings           ← 사이트 설정
/admin/guide              ← 조교 온보딩
```

---

## 도메인 레이어 (완료)

### Counseling 도메인 (`/src/domains/counseling/`)
```
model.ts
├── CounselingRecord
├── CounselingRecordWithProfiles
├── CreateCounselingInput (zod)
├── UpdateCounselingInput (zod)
└── CounselingType, COUNSELING_TYPE_LABELS

repository.ts
├── getCounselingsByStudent()
├── getCounselingById()
├── createCounseling()
├── updateCounseling()
├── deleteCounseling()
└── getRecentCounselings()

service.ts
├── getStudentCounselings()
└── recordCounseling()
```

### Settings 도메인 (`/src/domains/settings/`)
```
model.ts
├── SiteSetting
├── SettingKey
├── MenuVisibility
├── UpdateSettingInput (zod)
└── settingToBoolean(), booleanToSetting()

repository.ts
├── getAllSettings()
├── getSettingByKey()
├── getSettingsByKeys()
├── updateSetting()
├── updateSettings()
└── createSetting()

service.ts
├── getMenuVisibility()
├── getSmsTemplate()
└── updateSettings()
```

---

## 어드민 컴포넌트 (완료)

### 공통
| 컴포넌트 | 상태 | 설명 |
|---------|------|------|
| `<AdminSidebar />` | ✅ | 좌측 네비게이션 |
| `<AdminHeader />` | ✅ | 상단 헤더 + 페이지 타이틀 |
| `<AdminCard />` | ✅ | 대시보드 통계 카드 |
| `<ConfirmModal />` | ✅ | 삭제/상태변경 확인 |
| `<StatusBadge />` | ✅ | 상태 뱃지 (pending/active/inactive) |
| `<RoleBadge />` | ✅ | 역할 뱃지 (student/assistant/mentor/admin) |
| `<AdminErrorBoundary />` | ✅ | 에러 바운더리 |
| `<AdminTable />` | ⏸️ | TanStack Table 래퍼 (필요시 구현) |
| `<ImageUploader />` | ⏸️ | 다중 이미지 업로드 (추후) |
| `<FileAttachment />` | ⏸️ | 파일 첨부 (추후) |

---

## 권한 검사 (완료)

### 서버 사이드 (middleware.ts)
```typescript
// profiles 테이블에서 역할 조회
const { data: profile } = await supabase
  .from("profiles")
  .select("role, status")
  .eq("id", user.id)
  .single();

// admin 또는 mentor만 어드민 접근 허용
const adminRoles: string[] = [ROLES.ADMIN, ROLES.MENTOR];
if (!adminRoles.includes(profile.role)) {
  return NextResponse.redirect(new URL('/', request.url));
}
```

### 클라이언트 사이드 (admin/layout.tsx)
```typescript
const { canAccessAdmin, isLoading } = useUserStore();

useEffect(() => {
  if (!isLoading && !canAccessAdmin) {
    router.replace("/");
  }
}, [canAccessAdmin, isLoading]);
```

### 역할별 접근 권한
| 라우트 | student | assistant | mentor | admin |
|--------|---------|-----------|--------|-------|
| `/admin/*` | ❌ | ❌ | ✅ | ✅ |
| `/admin/guide` | ❌ | ✅ | ✅ | ✅ |

---

## Edge Functions (Phase 4로 이동)

### send-kakao-alimtalk
```typescript
// 공통 알림톡 발송 함수
interface AlimtalkRequest {
  template_code: string;
  receiver_number: string;
  variables: Record<string, string>;
}
// 실패 시 SMS 폴백
```

### notify-consult / notify-question / notify-answer
- 상담 신청 알림
- 질문 등록 알림
- 답변 등록 알림

---

## Storage 버킷 (Phase 4로 이동)

| 버킷명 | 용도 | 접근 정책 |
|--------|------|----------|
| `notice-images` | 공지 이미지 | 재원생 read, 관리자 write |
| `notice-attachments` | 공지 첨부파일 | 재원생 read, 관리자 write |
| `counseling-files` | 상담 기록 첨부 | 관리자만 |
| `guide-files` | 온보딩 파일 | 로그인 유저 read, 관리자 write |

---

## 구현 순서 (완료 체크)

1. ✅ **데이터베이스** (SQL 마이그레이션)
2. ✅ **도메인 레이어** (counseling, settings)
3. ✅ **어드민 레이아웃** (sidebar, header, error boundary)
4. ✅ **대시보드** (/admin)
5. ✅ **회원 관리** (/admin/members/*)
6. ✅ **공지 관리** (/admin/notices/*)
7. ✅ **/register 페이지**
8. ✅ **질문 관리** (/admin/questions)
9. ✅ **설정 페이지** (/admin/settings)
10. ✅ **조교 온보딩** (/admin/guide)
11. ⏸️ **Edge Functions** (Phase 4)
12. ⏸️ **Storage 설정** (Phase 4)

---

## 코드 개선 사항 (완료)

| 항목 | 파일 | 내용 |
|------|------|------|
| 미들웨어 수정 | `middleware.ts` | users → profiles 테이블, 멘토 역할 허용 |
| 권한 체크 개선 | `useUserStore.ts` | canAccessAdmin, isMentor 속성 추가 |
| 레이아웃 개선 | `admin/layout.tsx` | canAccessAdmin 사용 + AdminErrorBoundary |
| 타입 안전성 | `counseling/repository.ts` | Supabase 조인 타입 캐스팅 통일 |
| 에러 처리 | `ErrorBoundary.tsx` | 에러 바운더리 컴포넌트 추가 |
