-- ============================================
-- 로그인 헬퍼 함수
-- ============================================
-- RLS를 우회하여 username으로 프로필 조회 (로그인 전 사용)

CREATE OR REPLACE FUNCTION get_profile_by_username(p_username TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  name TEXT,
  role TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    profiles.id,
    profiles.username,
    profiles.name,
    profiles.role,
    profiles.status
  FROM public.profiles
  WHERE profiles.username = p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION get_profile_by_username(TEXT) TO anon, authenticated;
