-- ============================================
-- consultations: 광고/캠페인 리드 유입 추적 컬럼 추가
--
-- 광고 랜딩페이지(예: 썸머스쿨 /landing/studycore-summer-landing.html)에서
-- 들어온 인입을 기존 홈페이지 상담과 동일한 consultations 테이블에서
-- 관리하되, 유입 경로(source)로 구분하기 위함.
--
-- 기존 행은 모두 source='homepage'(홈페이지 상담폼)로 처리된다.
-- ============================================
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'homepage',
  ADD COLUMN IF NOT EXISTS utm JSONB,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false;

-- 유입 경로 필터 조회(어드민 상담 관리: 전체/광고/홈페이지)용 인덱스
CREATE INDEX IF NOT EXISTS idx_consultations_source
  ON public.consultations (source);

COMMENT ON COLUMN public.consultations.source IS '유입 경로: homepage(기본 상담폼) 또는 캠페인 식별자(예: lp_studycore_summer_2026)';
COMMENT ON COLUMN public.consultations.utm IS '광고 유입 추적 메타(JSONB): utm_source/medium/campaign/content/term, fbclid, landing_page_id, inflow_url, product';
COMMENT ON COLUMN public.consultations.marketing_consent IS '마케팅 정보 수신 동의 여부 (랜딩 선택 동의 항목)';

-- 컬럼 추가는 기존 RLS 정책(anon INSERT / staff SELECT / admin·mentor UPDATE·DELETE)에
-- 자동 적용되므로 별도 정책 변경은 불필요하다.
