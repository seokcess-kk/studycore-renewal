-- =====================================================
-- 006_add_blog_posts.sql
-- 블로그 시스템 테이블
-- =====================================================

-- blog_posts 테이블
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);

-- RLS 활성화
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 발행된 포스트는 누구나 조회 가능
CREATE POLICY "blog_posts_select_published" ON public.blog_posts
  FOR SELECT
  USING (is_published = true);

-- RLS 정책: 관리자/멘토는 모든 포스트 조회 가능
CREATE POLICY "blog_posts_select_admin" ON public.blog_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'mentor')
    )
  );

-- RLS 정책: 관리자/멘토만 생성 가능
CREATE POLICY "blog_posts_insert_admin" ON public.blog_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'mentor')
    )
  );

-- RLS 정책: 관리자/멘토만 수정 가능
CREATE POLICY "blog_posts_update_admin" ON public.blog_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'mentor')
    )
  );

-- RLS 정책: 관리자만 삭제 가능
CREATE POLICY "blog_posts_delete_admin" ON public.blog_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();
