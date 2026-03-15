-- ============================================
-- STUDYCORE 1.0 - 조회수 증가 RPC 함수 추가
-- ============================================
-- 이미 001_initial_schema.sql을 실행한 경우 이 파일만 실행

CREATE OR REPLACE FUNCTION increment_notice_view_count(notice_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notices
  SET view_count = view_count + 1
  WHERE id = notice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
