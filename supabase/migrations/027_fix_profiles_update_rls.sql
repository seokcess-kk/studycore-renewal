-- profiles UPDATE 정책 수정: admin만 → admin + mentor
-- Supabase SQL Editor에서 실행하세요.

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

-- 새 정책: admin + mentor가 모든 프로필 수정 가능
CREATE POLICY "Staff can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    get_user_role() IN ('admin', 'mentor')
  );
