-- ============================================
-- STUDYCORE 1.0 - 관리자 계정 시드
-- ============================================
--
-- 실행 순서:
-- 1. Supabase Dashboard > Authentication > Users
--    "Add user" → admin@studycore.internal / studycore12#
--
-- 2. 아래 SQL 실행 (profile 생성)
-- ============================================

-- 관리자 프로필
-- ⚠️ username은 auth 이메일의 로컬 파트와 반드시 일치해야 함
--    signInWithDummyEmail이 ${username}@studycore.internal로 이메일을 구성하므로
INSERT INTO public.profiles (id, username, name, phone, role, status)
SELECT id, 'admin', '관리자', NULL, 'admin', 'active'
FROM auth.users WHERE email = 'admin@studycore.internal'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- ============================================
-- 계정 정보
-- ============================================
-- | 역할   | 아이디 | 이메일                     | 비밀번호      |
-- |--------|--------|---------------------------|--------------|
-- | 관리자 | admin  | admin@studycore.internal  | studycore12# |
-- ============================================
--
-- 추가 계정(멘토, 조교 등)은 관리자 로그인 후
-- /admin/members/new 에서 생성합니다.
-- ============================================
