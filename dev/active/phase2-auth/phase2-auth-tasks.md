# Phase 2 Auth 작업 목록

## 데이터베이스

- [x] profiles 테이블 생성 (auth.users 확장)
- [x] consultations 테이블 생성
- [x] notices 테이블 생성
- [x] notice_attachments 테이블 생성
- [x] questions 테이블 생성
- [x] question_answers 테이블 생성
- [x] counselings 테이블 생성
- [x] user_registrations 테이블 생성
- [x] updated_at 트리거 함수
- [x] 상태 변경 이력 트리거
- [x] RLS 정책 설정
- [x] increment_notice_view_count RPC 함수

## 인증 시스템

- [x] 카카오 OAuth 코드 작성 (Supabase 설정은 별도)
- [x] 아이디/비밀번호 로그인 (staff용)
- [x] /login 페이지 구현
- [x] /auth/callback 라우트 구현
- [x] useUserStore (Zustand + persist) 구현

## 도메인 레이어

- [x] src/domains/user/ (model + repository + service)
- [x] src/domains/notice/ (model + repository + service)
- [x] src/domains/question/ (model + repository + service)

## 페이지 구현

- [x] /login — 로그인 페이지 (카카오 + staff)
- [x] /notices — 공지사항 목록
- [x] /notices/[id] — 공지사항 상세
- [x] /questions — 질문방 (재원생 전용)
- [x] /my — 마이페이지

## 검증

- [x] npm run build 0 에러
- [x] npm run lint 통과
- [x] 코드 리뷰 완료

## 프로젝트 구조

- [x] studycore-web/ 내용을 루트로 이동
- [x] Phase 진행 규칙 CLAUDE.md에 추가
- [x] phase2-auth context/plan 파일 생성

---

## ✅ Phase 2 코드 완료 (2025-03-15)

### 빌드 결과
```
Route (app)
├ ○ /
├ ○ /_not-found
├ ƒ /api/consult
├ ƒ /auth/callback    ← NEW
├ ○ /consult
├ ○ /login            ← NEW
├ ○ /my               ← NEW
├ ○ /notices          ← NEW
├ ƒ /notices/[id]     ← NEW
├ ○ /privacy
├ ○ /questions        ← NEW
├ ○ /system
└ ○ /terms
```

### SQL 마이그레이션

| 파일 | 내용 |
|------|------|
| `001_initial_schema.sql` | 8개 테이블 + 트리거 |
| `002_rls_policies.sql` | RLS 정책 + 헬퍼 함수 |
| `003_add_view_count_rpc.sql` | 조회수 증가 RPC |

### 도메인 레이어

| 도메인 | 파일 |
|--------|------|
| user | model.ts, repository.ts, service.ts |
| notice | model.ts, repository.ts, service.ts |
| question | model.ts, repository.ts, service.ts |

### 스토어
- `src/stores/useUserStore.ts` — Zustand + persist

### 코드 리뷰 이슈 해결

| 이슈 | 해결 |
|------|------|
| incrementViewCount 잘못된 RPC 호출 | 조회 후 +1 업데이트로 수정 |
| RPC 함수 누락 | 003_add_view_count_rpc.sql 별도 생성 |
| Button variant 오류 | ghost로 변경 |
| Zustand partialState API 변경 | partialize로 수정 |

---

## Supabase 설정 체크리스트

### 필수 (SQL 실행)
- [ ] `001_initial_schema.sql` 실행
- [ ] `002_rls_policies.sql` 실행
- [ ] `003_add_view_count_rpc.sql` 실행

### 선택 (카카오 OAuth)
- [ ] Supabase Dashboard → Authentication → Providers → Kakao 활성화
- [ ] 카카오 개발자 콘솔에서 Client ID/Secret 발급
- [ ] Redirect URI 설정: `{SUPABASE_URL}/auth/v1/callback`

---

## 다음 단계 (Phase 3)

### 기능
- [ ] /register 페이지 (카카오 신규 가입 추가 정보)
- [ ] Edge Functions (notify-consult, notify-question, notify-answer)
- [ ] 어드민 페이지 구현
- [ ] 도시락 신청 기능

### 개선
- [ ] 실제 시설 사진으로 교체
- [ ] SEO 메타데이터 최적화
- [ ] 성능 모니터링 설정
