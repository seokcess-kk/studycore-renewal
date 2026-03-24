-- =====================================================
-- 044_allow_pdf_in_question_images.sql
-- question-images 버킷에 PDF 허용 + 파일 크기 상향
-- =====================================================

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  file_size_limit = 10485760  -- 10MB
WHERE id = 'question-images';
