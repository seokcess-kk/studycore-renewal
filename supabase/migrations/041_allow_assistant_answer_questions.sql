-- assistant도 질문에 답변할 수 있도록 RLS 정책 수정
-- 기존: mentor, admin만 답변 INSERT 가능
-- 변경: mentor, admin, assistant 모두 답변 INSERT 가능

DROP POLICY IF EXISTS "Mentors can create answers" ON public.question_answers;

CREATE POLICY "Staff can create answers"
  ON public.question_answers
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND get_user_role() IN ('mentor', 'admin', 'assistant')
  );
