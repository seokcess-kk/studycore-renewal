-- =====================================================
-- 007_add_lunch_system.sql
-- 도시락 관리 시스템 테이블
-- =====================================================

-- lunch_periods 테이블 (도시락 신청 기간)
CREATE TABLE IF NOT EXISTS public.lunch_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  meal_types TEXT[] DEFAULT '{lunch,dinner}',
  selection_type TEXT NOT NULL CHECK (selection_type IN ('weekday', 'date')),
  available_options JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- lunch_applications 테이블 (도시락 신청)
CREATE TABLE IF NOT EXISTS public.lunch_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id UUID NOT NULL REFERENCES public.lunch_periods(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  selections JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period_id, student_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_lunch_periods_active ON public.lunch_periods(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_lunch_applications_period ON public.lunch_applications(period_id);
CREATE INDEX IF NOT EXISTS idx_lunch_applications_student ON public.lunch_applications(student_id);

-- RLS 활성화
ALTER TABLE public.lunch_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lunch_applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- lunch_periods RLS 정책
-- =====================================================

-- 활성 기간은 재원생(active)이 조회 가능
CREATE POLICY "lunch_periods_select_student" ON public.lunch_periods
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND status = 'active'
    )
  );

-- 관리자/멘토는 모든 기간 조회 가능
CREATE POLICY "lunch_periods_select_admin" ON public.lunch_periods
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'mentor')
    )
  );

-- 관리자만 기간 생성/수정/삭제 가능
CREATE POLICY "lunch_periods_insert_admin" ON public.lunch_periods
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "lunch_periods_update_admin" ON public.lunch_periods
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "lunch_periods_delete_admin" ON public.lunch_periods
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- lunch_applications RLS 정책
-- =====================================================

-- 재원생은 본인 신청만 조회 가능
CREATE POLICY "lunch_applications_select_own" ON public.lunch_applications
  FOR SELECT
  USING (student_id = auth.uid());

-- 관리자/멘토는 모든 신청 조회 가능
CREATE POLICY "lunch_applications_select_admin" ON public.lunch_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'mentor')
    )
  );

-- 재원생(active)은 본인 신청만 생성 가능
CREATE POLICY "lunch_applications_insert_own" ON public.lunch_applications
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND status = 'active'
    )
  );

-- 재원생은 본인 신청만 수정 가능
CREATE POLICY "lunch_applications_update_own" ON public.lunch_applications
  FOR UPDATE
  USING (student_id = auth.uid());

-- 재원생은 본인 신청만 삭제 가능
CREATE POLICY "lunch_applications_delete_own" ON public.lunch_applications
  FOR DELETE
  USING (student_id = auth.uid());

-- =====================================================
-- 트리거
-- =====================================================

-- lunch_periods updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_lunch_periods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lunch_periods_updated_at
  BEFORE UPDATE ON public.lunch_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_lunch_periods_updated_at();

-- lunch_applications updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_lunch_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lunch_applications_updated_at
  BEFORE UPDATE ON public.lunch_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_lunch_applications_updated_at();
