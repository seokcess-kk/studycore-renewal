-- ============================================
-- 테스트 계정 정리 & admin 비밀번호 변경
-- ============================================
-- Supabase SQL Editor에서 실행하세요.
-- ============================================

-- 1. 테스트 더미 데이터 삭제 (FK cascade로 답변도 함께 삭제)
DELETE FROM public.question_answers WHERE id IN (
  '55555555-5555-4555-a555-555555555555'::uuid
);
DELETE FROM public.questions WHERE id IN (
  '11111111-1111-4111-8111-111111111111'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,
  '44444444-4444-4444-a444-444444444444'::uuid
);
DELETE FROM public.notices WHERE id IN (
  '66666666-6666-4666-a666-666666666666'::uuid,
  '77777777-7777-4777-a777-777777777777'::uuid,
  '88888888-8888-4888-a888-888888888888'::uuid
);

-- 2. 테스트 계정 프로필 삭제 (mentor, student)
--    staff_credentials도 CASCADE로 삭제됨
DELETE FROM public.profiles
WHERE username IN ('mentor', 'mentor_test', 'student', 'student_test')
  AND role IN ('mentor', 'student');

-- 3. 테스트 auth 계정 삭제 (Supabase Dashboard에서 수동으로 해야 함)
-- mentor@studycore.internal, student@studycore.internal 삭제
-- ⚠️ SQL로 auth.users 직접 삭제는 권장하지 않음
-- Supabase Dashboard > Authentication > Users에서 삭제하세요.

-- 4. admin 계정 username 확인 및 정리
UPDATE public.profiles
SET username = 'admin', name = '관리자'
WHERE role = 'admin' AND username IN ('admin', 'admin_test');

-- 5. admin 비밀번호 변경
-- ⚠️ Supabase Dashboard > Authentication > Users에서
--    admin@studycore.internal 계정의 비밀번호를 studycore12# 로 변경하세요.

-- 6. staff_credentials에 admin bcrypt 비밀번호 설정
SELECT set_staff_password(
  (SELECT id FROM public.profiles WHERE username = 'admin' AND role = 'admin'),
  'admin',
  'studycore12#'
);

-- ============================================
-- 실행 후 확인
-- ============================================
-- SELECT username, role, status FROM profiles;
-- SELECT username FROM staff_credentials;
-- ============================================
