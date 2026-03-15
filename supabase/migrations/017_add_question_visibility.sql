-- ============================================
-- STUDYCORE 1.0 - 질문 공개/비공개 기능 추가
-- ============================================

-- is_public 컬럼 추가 (기본값 false - 비공개)
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- 기존 질문은 비공개 유지 (이미 DEFAULT FALSE이므로 별도 처리 불필요)

-- ============================================
-- RLS 정책 수정
-- ============================================

-- 기존 "Users can read own questions" 정책 유지 (본인 질문 열람)

-- 활성 사용자가 공개 질문 열람 가능한 정책 추가
CREATE POLICY "Active users can read public questions"
  ON public.questions FOR SELECT
  USING (
    is_public = TRUE
    AND is_active_user()
  );

-- question_answers에 공개 질문 답변 열람 정책 추가
CREATE POLICY "Active users can read answers to public questions"
  ON public.question_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions
      WHERE id = question_id
      AND is_public = TRUE
      AND is_active_user()
    )
  );

-- 인덱스 추가 (공개 질문 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_questions_is_public
  ON public.questions (is_public)
  WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_questions_is_public_created
  ON public.questions (created_at DESC)
  WHERE is_public = TRUE;
