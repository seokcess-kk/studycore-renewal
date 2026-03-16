-- ============================================
-- lunch_periods: mentor도 CRUD 가능하도록 수정
-- 기존: INSERT/UPDATE/DELETE 모두 admin만
-- 변경: admin + mentor
-- ============================================
DROP POLICY IF EXISTS "lunch_periods_insert_admin" ON public.lunch_periods;
DROP POLICY IF EXISTS "lunch_periods_update_admin" ON public.lunch_periods;
DROP POLICY IF EXISTS "lunch_periods_delete_admin" ON public.lunch_periods;

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

CREATE POLICY "lunch_periods_delete_admin_mentor" ON public.lunch_periods
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

-- ============================================
-- lunch_applications: 관리자/멘토도 삭제 가능하도록 정책 추가
--
-- 문제: lunch_periods 삭제 시 ON DELETE CASCADE가
--       lunch_applications의 RLS에 의해 차단됨
--       (기존: student_id = auth.uid() 본인만 삭제 가능)
-- 해결: admin/mentor도 삭제 가능한 정책 추가
-- ============================================

CREATE POLICY "lunch_applications_delete_admin" ON public.lunch_applications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );
