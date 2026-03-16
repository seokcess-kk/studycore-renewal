-- 질문 고정(공지) 기능 + 이미지 업로드 RLS 수정
-- Supabase SQL Editor에서 실행하세요.

-- 1. questions 테이블에 is_pinned 컬럼 추가
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- 고정 질문 정렬용 인덱스
CREATE INDEX IF NOT EXISTS idx_questions_pinned
ON public.questions (is_pinned DESC, created_at DESC);

-- 2. Storage RLS 수정: 멘토/관리자도 question-images 업로드 허용
-- 기존 student 전용 정책에 staff 정책 추가

CREATE POLICY "question_images_insert_staff"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'question-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor', 'assistant')
  )
);
