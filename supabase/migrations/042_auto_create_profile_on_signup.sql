-- ============================================
-- 카카오 로그인 시 profiles 자동 생성
--
-- auth.users INSERT 트리거 → profiles에 기본 레코드 생성
-- 스태프 계정은 API에서 profiles를 직접 INSERT하므로
-- ON CONFLICT DO NOTHING으로 충돌 방지
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, status)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      '미입력'
    ),
    'student',
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (기존 트리거가 있으면 교체)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 기존 auth.users에 있지만 profiles에 없는 사용자 백필
INSERT INTO public.profiles (id, name, role, status)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    '미입력'
  ),
  'student',
  'pending'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
