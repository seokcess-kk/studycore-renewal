-- 질문방 RLS 정책 보완
-- Supabase SQL Editor에서 실행하세요.

-- ============================================
-- 1. questions DELETE 정책 추가
-- ============================================

-- 본인의 미답변 질문만 삭제 가능
CREATE POLICY "Users can delete own pending questions"
  ON public.questions FOR DELETE
  USING (
    auth.uid() = author_id
    AND status = 'pending'
  );

-- 관리자는 모든 질문 삭제 가능
CREATE POLICY "Staff can delete questions"
  ON public.questions FOR DELETE
  USING (is_staff());

-- ============================================
-- 2. question_answers DELETE 정책 추가
-- ============================================

-- 본인 답변 삭제 가능
CREATE POLICY "Authors can delete own answers"
  ON public.question_answers FOR DELETE
  USING (auth.uid() = author_id);

-- 관리자는 모든 답변 삭제 가능
CREATE POLICY "Staff can delete answers"
  ON public.question_answers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'mentor')
    )
  );

-- ============================================
-- 3. 공개 질문 이미지 조회 정책 추가
-- ============================================
-- 로그인한 active 사용자가 공개 질문의 이미지를 볼 수 있도록

CREATE POLICY "question_images_select_active_users"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'question-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND status = 'active'
  )
);
