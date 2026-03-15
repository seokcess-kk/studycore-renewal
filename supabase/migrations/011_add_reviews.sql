-- =============================================
-- 011: Reviews Table
-- 학생/학부모 후기
-- =============================================

-- reviews 테이블 생성
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('student', 'parent', 'alumni')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reviews_created_at
  ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_category
  ON public.reviews(category);
CREATE INDEX IF NOT EXISTS idx_reviews_is_visible
  ON public.reviews(is_visible);
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured
  ON public.reviews(is_featured);

-- RLS 활성화
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 공개 조회 (is_visible = true만)
CREATE POLICY "reviews_select_public"
  ON public.reviews
  FOR SELECT
  USING (is_visible = true);

-- RLS 정책: 작성자 본인 전체 조회
CREATE POLICY "reviews_select_own"
  ON public.reviews
  FOR SELECT
  USING (author_id = auth.uid());

-- RLS 정책: 관리자 전체 조회
CREATE POLICY "reviews_select_admin"
  ON public.reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS 정책: 활성 재원생만 작성 가능
CREATE POLICY "reviews_insert_active_student"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'student'
      AND status = 'active'
    )
  );

-- RLS 정책: 작성자 본인만 수정 가능
CREATE POLICY "reviews_update_own"
  ON public.reviews
  FOR UPDATE
  USING (author_id = auth.uid());

-- RLS 정책: 관리자 수정 가능
CREATE POLICY "reviews_update_admin"
  ON public.reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS 정책: 관리자만 삭제 가능
CREATE POLICY "reviews_delete_admin"
  ON public.reviews
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- 코멘트
COMMENT ON TABLE public.reviews IS '학생/학부모 후기';
COMMENT ON COLUMN public.reviews.category IS 'student, parent, alumni';
COMMENT ON COLUMN public.reviews.rating IS '1-5점';
COMMENT ON COLUMN public.reviews.is_featured IS '대표 후기 여부';
COMMENT ON COLUMN public.reviews.is_visible IS '공개 여부';
