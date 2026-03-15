-- ============================================
-- STUDYCORE 1.0 - 사이트 설정 테이블
-- ============================================

-- 사이트 설정 테이블
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- updated_at 트리거
CREATE TRIGGER tr_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 초기 설정값
-- ============================================

INSERT INTO public.site_settings (key, value, description) VALUES
  ('menu_about_visible', 'false', '소개 페이지 네비게이션 노출'),
  ('menu_blog_visible', 'false', '블로그 페이지 네비게이션 노출'),
  ('menu_reviews_visible', 'false', '후기 페이지 네비게이션 노출'),
  ('menu_system_visible', 'true', '운영시스템 페이지 네비게이션 노출'),
  ('sms_consult_template', '안녕하세요, 스터디코어입니다.\n상담 신청이 접수되었습니다.\n빠른 시일 내에 연락드리겠습니다.\n\n카카오톡 채널: http://pf.kakao.com/_execQn', '상담 신청 SMS 템플릿')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- RLS 정책
-- ============================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 모든 인증 사용자가 설정 조회 가능 (메뉴 노출 여부 확인용)
CREATE POLICY "인증 사용자 설정 조회"
  ON public.site_settings FOR SELECT
  TO authenticated
  USING (true);

-- 비인증 사용자도 설정 조회 가능 (Nav 메뉴 표시용)
CREATE POLICY "비인증 사용자 설정 조회"
  ON public.site_settings FOR SELECT
  TO anon
  USING (true);

-- 관리자만 설정 수정 가능
CREATE POLICY "관리자 설정 수정"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (is_admin());

-- 관리자만 설정 추가 가능
CREATE POLICY "관리자 설정 추가"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- 관리자만 설정 삭제 가능
CREATE POLICY "관리자 설정 삭제"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (is_admin());
