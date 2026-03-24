-- =====================================================
-- 046_question_attachments_jsonb.sql
-- 질문/답변 첨부파일: image_urls TEXT[] → attachments JSONB 전환
-- 원본 파일명 메타데이터 보존을 위한 스키마 변경
-- =====================================================

-- Step 1: 새 JSONB 컬럼 추가
ALTER TABLE questions ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE question_answers ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Step 2: 기존 image_urls 데이터를 attachments JSONB로 마이그레이션
-- 기존 파일은 원본 파일명이 없으므로 URL에서 추출한 이름 사용
UPDATE questions
SET attachments = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'url', url,
      'original_name', reverse(split_part(reverse(url), '/', 1)),
      'size', NULL,
      'type', CASE
        WHEN url ILIKE '%.pdf' THEN 'application/pdf'
        WHEN url ILIKE '%.png' THEN 'image/png'
        WHEN url ILIKE '%.webp' THEN 'image/webp'
        WHEN url ILIKE '%.gif' THEN 'image/gif'
        ELSE 'image/jpeg'
      END
    )
  )
  FROM unnest(image_urls) AS url
)
WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0;

UPDATE question_answers
SET attachments = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'url', url,
      'original_name', reverse(split_part(reverse(url), '/', 1)),
      'size', NULL,
      'type', CASE
        WHEN url ILIKE '%.pdf' THEN 'application/pdf'
        WHEN url ILIKE '%.png' THEN 'image/png'
        WHEN url ILIKE '%.webp' THEN 'image/webp'
        WHEN url ILIKE '%.gif' THEN 'image/gif'
        ELSE 'image/jpeg'
      END
    )
  )
  FROM unnest(image_urls) AS url
)
WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0;

-- Note: image_urls 컬럼은 앱 코드 배포 후 별도 마이그레이션(047)에서 제거
