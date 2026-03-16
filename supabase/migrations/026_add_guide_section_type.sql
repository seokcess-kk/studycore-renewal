-- guide_sections에 type 컬럼 추가 (온보딩/매뉴얼 구분)
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE public.guide_sections
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'onboarding'
CHECK (type IN ('onboarding', 'manual'));

CREATE INDEX IF NOT EXISTS idx_guide_sections_type
ON public.guide_sections (type, order_index);
