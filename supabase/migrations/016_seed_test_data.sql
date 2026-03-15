-- ============================================
-- STUDYCORE 1.0 - 테스트 더미 데이터
-- ============================================
-- 주의: 이 파일은 개발/테스트 환경에서만 실행하세요.
-- 사전 조건: 013_seed_test_accounts.sql 실행 완료
-- ============================================

-- ============================================
-- 1. 테스트 질문 데이터
-- ============================================

-- 미답변 질문 1
INSERT INTO public.questions (id, title, content, status, author_id, created_at)
SELECT
  '11111111-1111-4111-8111-111111111111'::uuid,
  '수학 문제 질문입니다 - 미분 적분',
  '안녕하세요, 수학 문제 풀다가 막혀서 질문드립니다.

다음 함수의 미분을 구하시오:
f(x) = x³ + 2x² - 5x + 3

풀이 과정도 알려주시면 감사하겠습니다.',
  'pending',
  id,
  NOW() - INTERVAL '2 hours'
FROM public.profiles WHERE username = 'student_test'
ON CONFLICT (id) DO NOTHING;

-- 미답변 질문 2
INSERT INTO public.questions (id, title, content, status, author_id, created_at)
SELECT
  '22222222-2222-4222-8222-222222222222'::uuid,
  '확률과 통계 문제 도움 요청',
  '확률 문제입니다.

주머니에 빨간 공 3개, 파란 공 5개가 있습니다.
동시에 2개를 꺼낼 때, 같은 색 공이 나올 확률을 구하시오.

조합 공식을 어떻게 적용해야 할지 모르겠습니다.',
  'pending',
  id,
  NOW() - INTERVAL '1 hour'
FROM public.profiles WHERE username = 'student_test'
ON CONFLICT (id) DO NOTHING;

-- 미답변 질문 3
INSERT INTO public.questions (id, title, content, status, author_id, created_at)
SELECT
  '33333333-3333-4333-8333-333333333333'::uuid,
  '이차방정식 근의 공식 질문',
  '이차방정식 ax² + bx + c = 0 에서
근의 공식을 유도하는 과정이 이해가 안 됩니다.

특히 완전제곱식으로 만드는 부분이요.
단계별로 설명해주실 수 있나요?',
  'pending',
  id,
  NOW() - INTERVAL '30 minutes'
FROM public.profiles WHERE username = 'student_test'
ON CONFLICT (id) DO NOTHING;

-- 답변 완료된 질문
INSERT INTO public.questions (id, title, content, status, author_id, created_at)
SELECT
  '44444444-4444-4444-a444-444444444444'::uuid,
  '삼각함수 공식 질문 (답변 완료)',
  '사인법칙과 코사인법칙의 차이점이 뭔가요?

언제 어떤 공식을 사용해야 하는지 헷갈립니다.',
  'answered',
  id,
  NOW() - INTERVAL '1 day'
FROM public.profiles WHERE username = 'student_test'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. 테스트 답변 데이터
-- ============================================

-- 답변 완료된 질문에 대한 답변
INSERT INTO public.question_answers (id, question_id, content, author_id, created_at)
SELECT
  '55555555-5555-4555-a555-555555555555'::uuid,
  '44444444-4444-4444-a444-444444444444'::uuid,
  '안녕하세요! 좋은 질문이네요.

**사인법칙**
- a/sinA = b/sinB = c/sinC = 2R (외접원 반지름)
- 사용 시기: 한 변과 대각, 다른 각을 알 때

**코사인법칙**
- a² = b² + c² - 2bc·cosA
- 사용 시기: 세 변을 알 때, 또는 두 변과 끼인각을 알 때

**선택 기준**
1. 각-변-각 → 사인법칙
2. 변-각-변 → 코사인법칙
3. 변-변-변 → 코사인법칙

추가 질문 있으시면 편하게 물어보세요!',
  id,
  NOW() - INTERVAL '20 hours'
FROM public.profiles WHERE username = 'mentor_test'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. 테스트 공지사항 데이터
-- ============================================

INSERT INTO public.notices (id, title, content, category, is_pinned, author_id, created_at)
SELECT
  '66666666-6666-4666-a666-666666666666'::uuid,
  '[중요] 3월 모의고사 일정 안내',
  '안녕하세요, 스터디코어입니다.

**3월 모의고사 일정을 안내드립니다.**

- 일시: 2025년 3월 20일 (목)
- 시간: 08:30 ~ 17:00
- 장소: 스터디코어 자습실

**준비물**
- 수험표
- 검정 컴퓨터용 사인펜
- 수정테이프
- 신분증

당일 점심 도시락이 제공됩니다.
감사합니다.',
  'urgent',
  TRUE,
  id,
  NOW() - INTERVAL '3 days'
FROM public.profiles WHERE username = 'admin_test'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notices (id, title, content, category, is_pinned, author_id, created_at)
SELECT
  '77777777-7777-4777-a777-777777777777'::uuid,
  '3월 셋째 주 자료 배부 안내',
  '이번 주 배부되는 자료입니다.

1. 수학 - 미적분 심화 문제집
2. 영어 - 독해 모의고사 3회분
3. 국어 - 비문학 지문 분석 자료

자료실에서 수령해주세요.',
  'material',
  FALSE,
  id,
  NOW() - INTERVAL '1 day'
FROM public.profiles WHERE username = 'admin_test'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notices (id, title, content, category, is_pinned, author_id, created_at)
SELECT
  '88888888-8888-4888-a888-888888888888'::uuid,
  '3월 넷째 주 시간표 변경 안내',
  '다음 주 시간표가 일부 변경됩니다.

**변경 사항**
- 월요일 5교시: 국어 → 수학
- 수요일 3교시: 영어 → 국어

자세한 시간표는 게시판을 확인해주세요.',
  'schedule',
  FALSE,
  id,
  NOW() - INTERVAL '12 hours'
FROM public.profiles WHERE username = 'admin_test'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. 데이터 확인 쿼리
-- ============================================
-- SELECT * FROM public.questions ORDER BY created_at DESC;
-- SELECT * FROM public.question_answers;
-- SELECT * FROM public.notices ORDER BY created_at DESC;
-- SELECT * FROM public.guide_sections ORDER BY order_index;

-- ============================================
-- 테스트 시나리오
-- ============================================
-- 1. 관리자 로그인 (admin_test / test1234!)
-- 2. /admin/questions 접속 → 미답변 질문 3개 확인
-- 3. 질문 클릭 → /admin/questions/[id] 상세 페이지
-- 4. 답변 작성 후 등록 → 상태가 'answered'로 변경 확인
--
-- 5. /admin/guide 접속 → 섹션 목록 확인
-- 6. 섹션 추가/수정/삭제 테스트
-- ============================================
