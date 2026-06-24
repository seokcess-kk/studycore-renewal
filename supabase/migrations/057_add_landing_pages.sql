-- ============================================
-- landing_pages: 광고 랜딩페이지 동적 관리
--
-- 어드민에서 완성된 HTML을 업로드하면 고유 slug(/landing/[slug])로
-- 서빙된다. 각 랜딩은 자기 slug를 consultations.source로 보내
-- 어드민 상담관리에서 캠페인별 인입이 구분된다.
-- ============================================
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,             -- /landing/[slug]
  name TEXT NOT NULL,                    -- 관리용 이름 (예: "2026 썸머스쿨")
  html_content TEXT NOT NULL,            -- 업로드된 HTML 원본
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- slug 형식(영문 소문자·숫자·하이픈)은 createLandingSchema(zod)에서 검증

CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON public.landing_pages (slug);

ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- 공개 서빙용: 활성 랜딩은 익명 포함 누구나 조회 가능 (/landing/[slug])
DROP POLICY IF EXISTS "landing_public_read" ON public.landing_pages;
CREATE POLICY "landing_public_read" ON public.landing_pages
  FOR SELECT
  USING (is_active = true);

-- 어드민(admin/mentor) 전체 관리
DROP POLICY IF EXISTS "landing_admin_all" ON public.landing_pages;
CREATE POLICY "landing_admin_all" ON public.landing_pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

COMMENT ON TABLE public.landing_pages IS '광고 랜딩페이지(HTML 원본 보존). /landing/[slug]로 서빙';
COMMENT ON COLUMN public.landing_pages.slug IS 'URL 식별자. consultations.source로도 사용됨';
