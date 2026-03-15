-- ============================================
-- STUDYCORE 1.0 - 테스트 계정 시드
-- ============================================
-- 주의: 이 파일은 개발/테스트 환경에서만 실행하세요.
-- ============================================

-- ============================================
-- 단계 1: Supabase Dashboard에서 계정 생성
-- ============================================
-- 1. Supabase Dashboard > Authentication > Users
-- 2. "Add user" 버튼 클릭
-- 3. 아래 계정들을 생성:
--    - admin@studycore.internal / test1234!
--    - mentor@studycore.internal / test1234!
--    - student@studycore.internal / test1234!
--
-- ============================================
-- 단계 2: 아래 SQL 실행 (profiles 생성)
-- ============================================

-- 관리자 프로필
INSERT INTO public.profiles (id, username, name, phone, role, status)
SELECT id, 'admin_test', '테스트관리자', '010-0000-0001', 'admin', 'active'
FROM auth.users WHERE email = 'admin@studycore.internal'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- 멘토 프로필
INSERT INTO public.profiles (id, username, name, phone, role, status)
SELECT id, 'mentor_test', '테스트멘토', '010-0000-0002', 'mentor', 'active'
FROM auth.users WHERE email = 'mentor@studycore.internal'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- 재원생 프로필
INSERT INTO public.profiles (id, username, name, phone, role, status, school, g   rade)
SELECT id, 'student_test', '테스트학생', '010-0000-0003', 'student', 'active', '광주고등학교', 2
FROM auth.users WHERE email = 'student@studycore.internal'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  school = EXCLUDED.school,
  grade = EXCLUDED.grade;

-- ============================================
-- 테스트 계정 정보
-- ============================================
-- | 역할    | 아이디        | 이메일                        | 비밀번호   |
-- |---------|---------------|-------------------------------|-----------|
-- | 관리자  | admin_test    | admin@studycore.internal      | test1234! |
-- | 멘토    | mentor_test   | mentor@studycore.internal     | test1234! |
-- | 재원생  | student_test  | student@studycore.internal    | test1234! |
-- | 비회원  | (로그인 안함) | -                             | -         |
-- ============================================
