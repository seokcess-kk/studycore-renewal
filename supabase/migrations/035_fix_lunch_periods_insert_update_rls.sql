-- ============================================
-- lunch_periods: mentor도 생성/수정 가능하도록 수정
-- 034에서 DELETE만 적용된 경우를 위한 보완 마이그레이션
-- ============================================
DROP POLICY IF EXISTS "lunch_periods_insert_admin" ON public.lunch_periods;
DROP POLICY IF EXISTS "lunch_periods_update_admin" ON public.lunch_periods;
DROP POLICY IF EXISTS "lunch_periods_insert_admin_mentor" ON public.lunch_periods;
DROP POLICY IF EXISTS "lunch_periods_update_admin_mentor" ON public.lunch_periods;

CREATE POLICY "lunch_periods_insert_admin_mentor" ON public.lunch_periods
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

CREATE POLICY "lunch_periods_update_admin_mentor" ON public.lunch_periods
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );
