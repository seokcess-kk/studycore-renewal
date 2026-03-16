-- questions 테이블에 view_count 컬럼 추가
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- 조회수 증가 RPC 함수
CREATE OR REPLACE FUNCTION increment_question_view_count(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.questions
  SET view_count = view_count + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
