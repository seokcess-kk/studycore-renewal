-- user_registrations INSERT 정책 추가
-- 트리거에서 INSERT하므로 SECURITY DEFINER 트리거이거나 정책이 필요함
-- Supabase SQL Editor에서 실행하세요.

-- 방법 1: 트리거 함수를 SECURITY DEFINER로 재생성 (RLS 우회)
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.user_registrations (user_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 방법 2: 조회 정책도 추가 (관리자가 이력을 볼 수 있도록)
CREATE POLICY "Staff can read user registrations"
  ON public.user_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'mentor')
    )
  );
