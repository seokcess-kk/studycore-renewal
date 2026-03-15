-- ============================================
-- STUDYCORE 1.0 - 상담 기록 테이블
-- ============================================

-- 상담 기록 테이블 (학생별 진학/진로 상담)
CREATE TABLE IF NOT EXISTS public.counseling_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES public.profiles(id),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admission', 'career', 'etc')),
  content TEXT NOT NULL,
  next_date DATE,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_counseling_records_student_id ON public.counseling_records(student_id);
CREATE INDEX IF NOT EXISTS idx_counseling_records_date ON public.counseling_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_counseling_records_counselor_id ON public.counseling_records(counselor_id);

-- updated_at 트리거
CREATE TRIGGER tr_counseling_records_updated_at
  BEFORE UPDATE ON public.counseling_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS 정책
-- ============================================

ALTER TABLE public.counseling_records ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 상담 기록 조회 가능
CREATE POLICY "관리자 상담 기록 조회"
  ON public.counseling_records FOR SELECT
  TO authenticated
  USING (is_admin());

-- 관리자만 상담 기록 작성 가능
CREATE POLICY "관리자 상담 기록 작성"
  ON public.counseling_records FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- 관리자만 상담 기록 수정 가능
CREATE POLICY "관리자 상담 기록 수정"
  ON public.counseling_records FOR UPDATE
  TO authenticated
  USING (is_admin());

-- 관리자만 상담 기록 삭제 가능
CREATE POLICY "관리자 상담 기록 삭제"
  ON public.counseling_records FOR DELETE
  TO authenticated
  USING (is_admin());
